import type { Prisma } from '@prisma/client'
import { prisma } from '../../prisma.js'
import { ApiError } from '../../lib/http.js'
import type { ListQuery, ReplicationInput, SubmitInput } from './blueprint.schema.js'

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const authorInclude = { role: true, profile: true } as const

function toAuthor(u: { id: number; email: string; role: { name: string }; profile: { displayName: string; avatarPath: string | null } | null }) {
  return {
    id: u.id,
    email: u.email,
    display_name: u.profile?.displayName ?? u.email,
    role: u.role.name,
    avatar_url: u.profile?.avatarPath ?? null,
  }
}

const summaryInclude = { author: { include: authorInclude }, reports: { select: { outcome: true } } } satisfies Prisma.BlueprintInclude
const fullInclude = {
  author: { include: authorInclude },
  economic: true,
  materials: { orderBy: { sort: 'asc' } },
  steps: { orderBy: { order: 'asc' } },
  quality: true,
  safety: true,
  reports: { select: { outcome: true } },
  versions: { orderBy: { version: 'asc' } },
  variants: true,
} satisfies Prisma.BlueprintInclude

type SummaryRow = Prisma.BlueprintGetPayload<{ include: typeof summaryInclude }>
type FullRow = Prisma.BlueprintGetPayload<{ include: typeof fullInclude }>

function breakdown(reports: { outcome: string }[]) {
  const b = { success: 0, partial: 0, fail: 0 }
  for (const r of reports) if (r.outcome in b) b[r.outcome as keyof typeof b]++
  return b
}

function toSummary(bp: SummaryRow) {
  const rep = breakdown(bp.reports)
  const total = rep.success + rep.partial + rep.fail
  return {
    id: bp.id,
    title: bp.title,
    slug: bp.slug,
    author: toAuthor(bp.author),
    wasteKind: bp.wasteKind,
    wasteLabel: bp.wasteLabel,
    product: bp.product,
    excerpt: bp.excerpt,
    status: bp.status,
    maturity: bp.maturity,
    difficulty: bp.difficulty,
    capitalTier: bp.capitalTier,
    minCapital: bp.minCapital,
    estTime: bp.estTime,
    tags: (bp.tags as string[]) ?? [],
    stats: { views: bp.views, saves: bp.saves, replications: total, successRate: total ? Math.round((rep.success / total) * 100) : 0 },
  }
}

function toFull(bp: FullRow) {
  const rep = breakdown(bp.reports)
  return {
    ...toSummary(bp),
    summary: bp.summary,
    sources: (bp.sources as string[]) ?? [],
    isBookmarked: false,
    replications: rep,
    materials: bp.materials.map((m) => ({ name: m.name, qty: m.qty, tier: m.tier, price: m.price, note: m.note ?? undefined })),
    steps: bp.steps.map((s) => ({ order: s.order, title: s.title, detail: s.detail, duration: s.duration ?? undefined, temperature: s.temperature ?? undefined, dose: s.dose ?? undefined })),
    quality: bp.quality.map((q) => ({ name: q.name, target: q.target, method: q.method })),
    safety: bp.safety.map((s) => ({ risk: s.risk, mitigation: s.mitigation })),
    economic: bp.economic
      ? {
          capital: bp.economic.capital,
          costPerBatch: bp.economic.costPerBatch,
          batchInputKg: bp.economic.batchInputKg,
          batchOutputKg: bp.economic.batchOutputKg,
          sellPricePerKg: bp.economic.sellPricePerKg,
        }
      : { capital: 0, costPerBatch: 0, batchInputKg: 0, batchOutputKg: 0, sellPricePerKg: 0 },
    versions: bp.versions.map((v) => ({
      version: v.version,
      changelog: v.changelog,
      author: { id: 0, email: '', display_name: v.authorName, role: '', avatar_url: null },
      createdAt: v.createdAt.toISOString(),
    })),
    variants: bp.variants.map((v) => ({ id: v.id, region: v.region, title: v.title })),
  }
}

const MATURITY_ORDER: Record<string, number> = { raw: 1, curated: 2, validated: 3, standard: 4 }

export async function listPublished(q: ListQuery) {
  const where: Prisma.BlueprintWhereInput = { status: 'published', deletedAt: null }
  if (q.wasteKind) where.wasteKind = q.wasteKind
  if (q.difficulty) where.difficulty = q.difficulty
  if (q.capitalTier) where.capitalTier = q.capitalTier
  if (q.maturity) where.maturity = q.maturity
  if (q.search) {
    where.OR = [{ title: { contains: q.search } }, { excerpt: { contains: q.search } }, { product: { contains: q.search } }]
  }
  const rows = await prisma.blueprint.findMany({ where, include: summaryInclude })
  let list = rows.map(toSummary)
  if (q.product) list = list.filter((b) => slugify(b.product) === q.product)
  if (q.sort === 'maturity') list.sort((a, b) => MATURITY_ORDER[b.maturity] - MATURITY_ORDER[a.maturity])
  else if (q.sort === 'capital') list.sort((a, b) => a.minCapital - b.minCapital)
  else if (q.sort === 'newest') list.sort((a, b) => b.id - a.id)
  else list.sort((a, b) => b.stats.saves - a.stats.saves)
  return list
}

export async function getById(id: number, userId?: number) {
  const bp = await prisma.blueprint.findFirst({ where: { id, deletedAt: null }, include: fullInclude })
  if (!bp) throw ApiError.notFound('Cetak biru tidak ditemukan.')
  await prisma.blueprint.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => undefined)
  const full = toFull(bp)
  if (userId) {
    const bm = await prisma.bookmark.findUnique({ where: { userId_blueprintId: { userId, blueprintId: id } } })
    full.isBookmarked = !!bm
  }
  return full
}

async function uniqueSlug(title: string) {
  const base = slugify(title) || 'cetak-biru'
  let slug = base
  let n = 1
  while (await prisma.blueprint.findUnique({ where: { slug } })) slug = `${base}-${++n}`
  return slug
}

export async function submit(userId: number, input: SubmitInput) {
  const author = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } })
  if (!author) throw ApiError.unauthorized()
  const slug = await uniqueSlug(input.title)
  const bp = await prisma.blueprint.create({
    data: {
      title: input.title, slug, authorId: userId, wasteKind: input.wasteKind, wasteLabel: input.wasteLabel,
      product: input.product, excerpt: input.excerpt, summary: input.summary || input.excerpt,
      status: 'submitted', maturity: 'raw', difficulty: input.difficulty, capitalTier: input.capitalTier,
      minCapital: input.economic.capital, estTime: input.estTime, tags: input.tags, sources: input.sources,
      economic: { create: input.economic },
      materials: { create: input.materials.map((m, i) => ({ name: m.name, qty: m.qty, tier: m.tier, price: m.price, note: m.note ?? null, sort: i })) },
      steps: { create: input.steps.map((s, i) => ({ order: s.order ?? i + 1, title: s.title, detail: s.detail, duration: s.duration ?? null, temperature: s.temperature ?? null, dose: s.dose ?? null })) },
      quality: { create: input.quality },
      safety: { create: input.safety },
      versions: { create: [{ version: 1, changelog: 'Versi awal (kontribusi).', authorName: author.profile?.displayName ?? author.email }] },
    },
    include: fullInclude,
  })
  return toFull(bp)
}

export async function listMine(userId: number) {
  const rows = await prisma.blueprint.findMany({ where: { authorId: userId, deletedAt: null }, include: summaryInclude, orderBy: { id: 'desc' } })
  return rows.map(toSummary)
}

export async function listBookmarked(userId: number) {
  const rows = await prisma.bookmark.findMany({
    where: { userId, blueprint: { status: 'published', deletedAt: null } },
    include: { blueprint: { include: summaryInclude } },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map((b) => toSummary(b.blueprint))
}

export async function toggleBookmark(userId: number, blueprintId: number) {
  const bp = await prisma.blueprint.findFirst({ where: { id: blueprintId, deletedAt: null } })
  if (!bp) throw ApiError.notFound('Cetak biru tidak ditemukan.')
  const existing = await prisma.bookmark.findUnique({ where: { userId_blueprintId: { userId, blueprintId } } })
  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } })
    await prisma.blueprint.update({ where: { id: blueprintId }, data: { saves: { decrement: 1 } } })
    return { bookmarked: false }
  }
  await prisma.bookmark.create({ data: { userId, blueprintId } })
  await prisma.blueprint.update({ where: { id: blueprintId }, data: { saves: { increment: 1 } } })
  return { bookmarked: true }
}

export async function listReplications(blueprintId: number) {
  const rows = await prisma.replicationReport.findMany({ where: { blueprintId }, include: { user: { include: authorInclude } }, orderBy: { createdAt: 'desc' } })
  return rows.map((r) => ({ id: r.id, user: toAuthor(r.user), outcome: r.outcome, note: r.note, costReal: r.costReal, photoSeed: r.photoSeed, createdAt: r.createdAt.toISOString() }))
}

export async function addReplication(userId: number, blueprintId: number, input: ReplicationInput) {
  const bp = await prisma.blueprint.findFirst({ where: { id: blueprintId, deletedAt: null }, include: { reports: { select: { outcome: true } } } })
  if (!bp) throw ApiError.notFound('Cetak biru tidak ditemukan.')
  await prisma.replicationReport.create({ data: { blueprintId, userId, outcome: input.outcome, note: input.note, costReal: input.costReal ?? null, photoSeed: input.photoSeed ?? null } })
  const rep = breakdown([...bp.reports, { outcome: input.outcome }])
  const total = rep.success + rep.partial + rep.fail
  const rate = total ? Math.round((rep.success / total) * 100) : 0
  if (bp.maturity === 'curated' && rep.success >= 5 && rate >= 60) {
    await prisma.blueprint.update({ where: { id: blueprintId }, data: { maturity: 'validated' } })
  }
  return getById(blueprintId, userId)
}

export async function proposeVariant(blueprintId: number, region: string, title: string) {
  const bp = await prisma.blueprint.findFirst({ where: { id: blueprintId, deletedAt: null } })
  if (!bp) throw ApiError.notFound('Cetak biru tidak ditemukan.')
  await prisma.blueprintVariant.create({ data: { blueprintId, region, title } })
  return getById(blueprintId)
}

export async function listSubmitted() {
  const rows = await prisma.blueprint.findMany({ where: { status: 'submitted', deletedAt: null }, include: summaryInclude, orderBy: { id: 'desc' } })
  return rows.map(toSummary)
}

export async function curate(blueprintId: number, action: 'approve' | 'reject') {
  const bp = await prisma.blueprint.findFirst({ where: { id: blueprintId } })
  if (!bp) throw ApiError.notFound('Cetak biru tidak ditemukan.')
  await prisma.blueprint.update({
    where: { id: blueprintId },
    data: action === 'approve' ? { status: 'published', maturity: 'curated' } : { status: 'rejected' },
  })
}

export async function valueTree() {
  const [nodes, published] = await Promise.all([
    prisma.valueNode.findMany(),
    prisma.blueprint.findMany({ where: { status: 'published', deletedAt: null }, select: { wasteKind: true, product: true } }),
  ])
  return nodes
    .map((n) => {
      let count = 0
      if (n.type === 'root') count = published.length
      else if (n.type === 'waste') count = published.filter((b) => b.wasteKind === n.slug).length
      else count = published.filter((b) => slugify(b.product) === n.slug).length
      return { id: n.id, parentId: n.parentId, type: n.type, name: n.name, slug: n.slug, icon: n.icon, blueprintCount: count }
    })
    .sort((a, b) => a.id - b.id)
}
