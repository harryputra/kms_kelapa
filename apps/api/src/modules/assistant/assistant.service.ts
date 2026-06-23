import { prisma } from '../../prisma.js'
import { toAuthor, userInclude } from '../../lib/dto.js'

const WASTE_LABEL: Record<string, string> = { sabut: 'Sabut', tempurung: 'Tempurung', air: 'Air Kelapa', ampas: 'Ampas' }
const MAT_LABEL: Record<string, string> = { raw: 'Mentah', curated: 'Terkurasi', validated: 'Tervalidasi Lapangan', standard: 'Standar Rujukan' }
const DIFF_LABEL: Record<string, string> = { mudah: 'Mudah', sedang: 'Sedang', sulit: 'Sulit' }
const ORDER: Record<string, number> = { raw: 1, curated: 2, validated: 3, standard: 4 }
const rupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID')

function parseBudget(q: string): number | null {
  let m = q.match(/(\d+(?:[.,]\d+)?)\s*(juta|jt)\b/)
  if (m) return Math.round(parseFloat(m[1].replace(',', '.')) * 1_000_000)
  m = q.match(/(\d+(?:[.,]\d+)?)\s*(ribu|rb)\b/)
  if (m) return Math.round(parseFloat(m[1].replace(',', '.')) * 1_000)
  m = q.match(/rp\s*([\d.]{4,})/)
  if (m) return parseInt(m[1].replace(/\./g, ''), 10) || null
  return null
}

export async function ask(question: string) {
  const q = (question || '').toLowerCase()
  const budget = parseBudget(q)
  const wasteHit = (Object.keys(WASTE_LABEL)).find((k) => q.includes(k) || q.includes(WASTE_LABEL[k].toLowerCase()))

  const rows = await prisma.blueprint.findMany({
    where: { status: 'published', deletedAt: null },
    include: { economic: true, author: userInclude, reports: { select: { outcome: true } } },
  })
  let scoped = rows
  if (wasteHit) scoped = scoped.filter((b) => b.wasteKind === wasteHit)
  if (q.includes('mudah') || q.includes('pemula') || q.includes('gampang')) scoped = scoped.filter((b) => b.difficulty === 'mudah')
  if (budget != null) scoped = scoped.filter((b) => b.minCapital <= budget)
  if (!scoped.length) scoped = rows

  const ranked = [...scoped].sort((a, b) => ORDER[b.maturity] - ORDER[a.maturity] || a.minCapital - b.minCapital).slice(0, 3)

  const lines = ranked.map((b, i) => {
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

  const answer = `${intro}\n\n${lines.join('\n\n')}\n\nJawaban ini disusun dari ${ranked.length} cetak biru tervalidasi di repositori COCONEXUS — buka sumber di bawah untuk langkah lengkap, parameter mutu, dan K3.`

  const sources = ranked.map((b) => {
    const total = b.reports.length
    const succ = b.reports.filter((r) => r.outcome === 'success').length
    return {
      id: b.id, title: b.title, slug: b.slug, author: toAuthor(b.author), wasteKind: b.wasteKind, wasteLabel: b.wasteLabel,
      product: b.product, excerpt: b.excerpt, status: b.status, maturity: b.maturity, difficulty: b.difficulty,
      capitalTier: b.capitalTier, minCapital: b.minCapital, estTime: b.estTime, tags: (b.tags as string[]) ?? [],
      stats: { views: b.views, saves: b.saves, replications: total, successRate: total ? Math.round((succ / total) * 100) : 0 },
    }
  })

  return { answer, sources, suggestions: ['Mana yang modalnya paling kecil?', wasteHit ? 'Bagaimana cara uji mutunya?' : 'Produk apa dari tempurung?', 'Tampilkan cetak biru paling mudah'] }
}
