import { prisma } from '../../prisma.js'
import { toAuthor, userInclude } from '../../lib/dto.js'
import { getAiConfig } from '../ai/ai.settings.js'
import { chat } from '../ai/llm.js'

const WASTE_LABEL: Record<string, string> = { sabut: 'Sabut', tempurung: 'Tempurung', air: 'Air Kelapa', ampas: 'Ampas' }
const MAT_LABEL: Record<string, string> = { raw: 'Mentah', curated: 'Terkurasi', validated: 'Tervalidasi Lapangan', standard: 'Standar Rujukan' }
const DIFF_LABEL: Record<string, string> = { mudah: 'Mudah', sedang: 'Sedang', sulit: 'Sulit' }
const ORDER: Record<string, number> = { raw: 1, curated: 2, validated: 3, standard: 4 }
const rupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID')

const DEFAULT_SYSTEM =
  'Anda adalah COCO, asisten pengetahuan pengelolaan limbah buah kelapa untuk UMKM agroindustri Indonesia. ' +
  'Jawab dalam Bahasa Indonesia yang ringkas, praktis, dan ramah pemula. ' +
  'Gunakan HANYA informasi pada KONTEKS yang diberikan; jangan mengarang angka atau klaim. ' +
  'Selalu rujuk sumber dengan format [#n] sesuai nomor pada konteks. ' +
  'Bila konteks tidak memuat jawabannya, katakan terus terang Anda belum punya datanya dan sarankan bertanya di Forum atau Tanya Pakar.'

const STOP = new Set(['yang', 'untuk', 'dari', 'dengan', 'dan', 'atau', 'apa', 'cara', 'bagaimana', 'saya', 'bisa', 'adalah', 'pada', 'ini', 'itu', 'ada', 'akan', 'mau', 'ingin', 'tolong', 'kah', 'nya', 'gimana', 'butuh', 'punya'])
const tokenize = (s: string) => (s.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((t) => t.length >= 3 && !STOP.has(t))

function parseBudget(q: string): number | null {
  let m = q.match(/(\d+(?:[.,]\d+)?)\s*(juta|jt)\b/)
  if (m) return Math.round(parseFloat(m[1].replace(',', '.')) * 1_000_000)
  m = q.match(/(\d+(?:[.,]\d+)?)\s*(ribu|rb)\b/)
  if (m) return Math.round(parseFloat(m[1].replace(',', '.')) * 1_000)
  m = q.match(/rp\s*([\d.]{4,})/)
  if (m) return parseInt(m[1].replace(/\./g, ''), 10) || null
  return null
}

type Row = Awaited<ReturnType<typeof fetchRows>>[number]

function fetchRows() {
  return prisma.blueprint.findMany({
    where: { status: 'published', deletedAt: null },
    include: { economic: true, materials: true, steps: true, quality: true, author: userInclude, reports: { select: { outcome: true } } },
  })
}

function scoreRow(b: Row, qt: string[]): number {
  if (!qt.length) return 0
  const hit = (weight: number, txt: string) => {
    const set = new Set(tokenize(txt))
    let s = 0
    for (const t of qt) if (set.has(t)) s += weight
    return s
  }
  return (
    hit(3, b.title) +
    hit(3, `${b.product} ${b.wasteLabel}`) +
    hit(2, ((b.tags as string[]) ?? []).join(' ')) +
    hit(1, `${b.excerpt} ${b.summary}`) +
    hit(1, b.materials.map((m) => m.name).join(' ')) +
    hit(1, b.steps.map((s) => s.title).join(' ')) +
    hit(0.5, b.quality.map((q) => q.name).join(' '))
  )
}

function contextOf(b: Row, i: number): string {
  const e = b.economic
  const steps = [...b.steps].sort((a, c) => a.order - c.order).map((s) => `${s.order}. ${s.title}${s.detail ? ': ' + s.detail.slice(0, 160) : ''}`).join('\n')
  const mats = b.materials.map((m) => `${m.name} (${m.qty})`).join(', ')
  const qual = b.quality.map((q) => `${q.name}: target ${q.target} (uji ${q.method})`).join('; ')
  const eco = e ? `Modal mulai ${rupiah(b.minCapital)}; biaya/batch ${rupiah(e.costPerBatch)}; output ${e.batchOutputKg} kg @ ${rupiah(e.sellPricePerKg)}/kg.` : `Modal mulai ${rupiah(b.minCapital)}.`
  return [
    `[#${i}] ${b.title} — produk ${b.product} dari ${b.wasteLabel}.`,
    `Kematangan ${MAT_LABEL[b.maturity]}, kesulitan ${DIFF_LABEL[b.difficulty]}, estimasi ${b.estTime}.`,
    `Ringkasan: ${b.excerpt}`,
    `Bahan: ${mats || '-'}`,
    `Langkah:\n${steps || '-'}`,
    `Parameter mutu: ${qual || '-'}`,
    `Ekonomi: ${eco}`,
  ].join('\n')
}

function extractive(top: Row[], budget: number | null, wasteHit?: string): string {
  const lines = top.map((b, i) => {
    const e = b.economic
    const perBatch = e ? e.batchOutputKg * e.sellPricePerKg - e.costPerBatch : 0
    const grossWeek = perBatch * 5
    const bep = e && perBatch > 0 ? Math.ceil(e.capital / perBatch) : 0
    return `${i + 1}. ${b.title}\n   • Modal mulai ${rupiah(b.minCapital)} · ${DIFF_LABEL[b.difficulty]} · Kematangan: ${MAT_LABEL[b.maturity]}\n   • Estimasi laba ${rupiah(grossWeek)}/minggu (5 batch), BEP ±${bep} batch.`
  })
  const intro =
    budget != null ? `Dengan modal sekitar ${rupiah(budget)}${wasteHit ? ' dan bahan ' + WASTE_LABEL[wasteHit].toLowerCase() : ''}, berikut cetak biru paling sesuai & terbukti di lapangan:`
      : wasteHit ? `Untuk pengolahan ${WASTE_LABEL[wasteHit].toLowerCase()}, ini rekomendasi cetak biru paling matang:`
        : 'Berikut cetak biru paling relevan dari repositori untuk pertanyaan Anda:'
  return `${intro}\n\n${lines.join('\n\n')}\n\nBuka sumber di bawah untuk langkah lengkap, parameter mutu, dan K3.`
}

const suggest = (wasteHit?: string) => ['Mana yang modalnya paling kecil?', wasteHit ? 'Bagaimana cara uji mutunya?' : 'Produk apa dari tempurung?', 'Tampilkan cetak biru paling mudah']

function sourceOf(b: Row) {
  const total = b.reports.length
  const succ = b.reports.filter((r) => r.outcome === 'success').length
  return {
    id: b.id, title: b.title, slug: b.slug, author: toAuthor(b.author), wasteKind: b.wasteKind, wasteLabel: b.wasteLabel,
    product: b.product, excerpt: b.excerpt, status: b.status, maturity: b.maturity, difficulty: b.difficulty,
    capitalTier: b.capitalTier, minCapital: b.minCapital, estTime: b.estTime, tags: (b.tags as string[]) ?? [],
    stats: { views: b.views, saves: b.saves, replications: total, successRate: total ? Math.round((succ / total) * 100) : 0 },
  }
}

export async function ask(question: string) {
  const q = (question || '').toLowerCase()
  const budget = parseBudget(q)
  const wasteHit = Object.keys(WASTE_LABEL).find((k) => q.includes(k) || q.includes(WASTE_LABEL[k].toLowerCase()))

  const rows = await fetchRows()
  let scoped = rows
  if (wasteHit) scoped = scoped.filter((b) => b.wasteKind === wasteHit)
  if (q.includes('mudah') || q.includes('pemula') || q.includes('gampang')) scoped = scoped.filter((b) => b.difficulty === 'mudah')
  if (budget != null) scoped = scoped.filter((b) => b.minCapital <= budget)
  if (!scoped.length) scoped = rows

  const cfg = await getAiConfig()
  const qt = tokenize(q)
  const ranked = [...scoped]
    .map((b) => ({ b, s: scoreRow(b, qt) }))
    .sort((x, y) => y.s - x.s || ORDER[y.b.maturity] - ORDER[x.b.maturity] || x.b.minCapital - y.b.minCapital)
  const relevant = ranked.some((r) => r.s > 0) ? ranked.filter((r) => r.s > 0) : ranked
  const top = relevant.slice(0, Math.max(1, Math.min(8, cfg.topK))).map((r) => r.b)
  const sources = top.map(sourceOf)

  // RAG penuh bila AI diaktifkan; jika gagal/dimatikan → fallback ekstraktif (tetap berguna).
  if (cfg.enabled) {
    try {
      const context = top.map((b, i) => contextOf(b, i + 1)).join('\n\n')
      const system = cfg.systemPrompt.trim() || DEFAULT_SYSTEM
      const user = `PERTANYAAN PENGGUNA:\n${question}\n\nKONTEKS (cetak biru terverifikasi dari repositori COCONEXUS):\n${context}`
      const { text, model } = await chat(cfg, system, user)
      return { answer: text, sources, suggestions: suggest(wasteHit), model, grounded: true }
    } catch (err) {
      const note = `\n\n_(Catatan: model AI tak bisa dihubungi — ${(err as Error)?.message ?? 'gagal'}. Jawaban disusun langsung dari repositori.)_`
      return { answer: extractive(top, budget, wasteHit) + note, sources, suggestions: suggest(wasteHit), model: 'extractive', grounded: false }
    }
  }

  return { answer: extractive(top, budget, wasteHit), sources, suggestions: suggest(wasteHit), model: 'extractive', grounded: false }
}

export async function testConnection() {
  const cfg = await getAiConfig()
  const started = Date.now()
  const { text, model } = await chat(cfg, 'Anda asisten ringkas.', 'Balas hanya dengan kata: OK')
  return { ok: true, latency_ms: Date.now() - started, model, sample: text.slice(0, 120) }
}
