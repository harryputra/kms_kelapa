import type { Prisma } from '@prisma/client'
import { prisma } from '../../prisma.js'
import { ApiError } from '../../lib/http.js'
import type { ListQuery } from './blueprint.schema.js'

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

export async function getById(id: number) {
  const bp = await prisma.blueprint.findFirst({ where: { id, deletedAt: null }, include: fullInclude })
  if (!bp) throw ApiError.notFound('Cetak biru tidak ditemukan.')
  await prisma.blueprint.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => undefined)
  return toFull(bp)
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
