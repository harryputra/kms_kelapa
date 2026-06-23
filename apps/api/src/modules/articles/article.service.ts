import type { Prisma } from '@prisma/client'
import { prisma } from '../../prisma.js'
import { ApiError } from '../../lib/http.js'
import { slugify, toAuthor, userInclude } from '../../lib/dto.js'
import { notify } from '../notifications/notification.service.js'

export const inc = {
  author: userInclude,
  category: true,
  votes: { select: { type: true, userId: true } },
  _count: { select: { comments: { where: { status: 'approved' } }, bookmarks: true } },
} satisfies Prisma.ArticleInclude

type Row = Prisma.ArticleGetPayload<{ include: typeof inc }>

function likes(v: { type: string }[]) {
  return { likes: v.filter((x) => x.type === 'like').length, dislikes: v.filter((x) => x.type === 'dislike').length }
}

export function summary(a: Row) {
  const { likes: l, dislikes: d } = likes(a.votes)
  return {
    id: a.id, title: a.title, slug: a.slug, author: toAuthor(a.author),
    category: a.category?.name ?? '-', tags: (a.tags as string[]) ?? [],
    excerpt: a.excerpt, thumbnail_url: a.thumbnail ?? null, status: a.status,
    published_at: a.publishedAt ? a.publishedAt.toISOString() : null,
    stats: { views: a.views, likes: l, dislikes: d, comments: a._count.comments },
  }
}

function full(a: Row, userId?: number) {
  const mine = userId ? a.votes.find((v) => v.userId === userId) : undefined
  return {
    ...summary(a),
    content: a.content,
    sources: [] as string[],
    review_notes: a.reviewNotes ?? null,
    user_vote: (mine?.type as 'like' | 'dislike' | undefined) ?? null,
    is_bookmarked: false, // diisi ulang di getArticle untuk user login
  }
}

export async function listPublished(p: { page?: number; limit?: number; search?: string; category?: string; sort?: string }) {
  const page = Math.max(1, p.page ?? 1)
  const limit = Math.min(50, Math.max(1, p.limit ?? 9))
  const where: Prisma.ArticleWhereInput = { status: 'published', deletedAt: null }
  if (p.search) where.OR = [{ title: { contains: p.search } }, { excerpt: { contains: p.search } }]
  if (p.category) where.category = { slug: p.category }
  const orderBy: Prisma.ArticleOrderByWithRelationInput =
    p.sort === 'oldest' ? { publishedAt: 'asc' } : p.sort === 'popular' ? { views: 'desc' } : { publishedAt: 'desc' }
  const [rows, total] = await Promise.all([
    prisma.article.findMany({ where, include: inc, orderBy, skip: (page - 1) * limit, take: limit }),
    prisma.article.count({ where }),
  ])
  return { data: rows.map(summary), meta: { current_page: page, per_page: limit, total_items: total, total_pages: Math.max(1, Math.ceil(total / limit)) } }
}

export async function getArticle(id: number, userId?: number) {
  const a = await prisma.article.findFirst({ where: { id, deletedAt: null }, include: inc })
  if (!a) throw ApiError.notFound('Artikel tidak ditemukan.')
  await prisma.article.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => undefined)
  // Guest (tanpa userId) hanya 50% konten
  if (!userId && a.status === 'published') {
    const s = summary(a)
    return { ...s, content_preview: a.content.slice(0, Math.ceil(a.content.length * 0.5)), is_truncated: true as const }
  }
  const f = full(a, userId)
  if (userId) {
    const bm = await prisma.articleBookmark.findUnique({ where: { userId_articleId: { userId, articleId: id } } })
    f.is_bookmarked = !!bm
  }
  return f
}

export async function myArticles(userId: number) {
  const rows = await prisma.article.findMany({ where: { authorId: userId, deletedAt: null }, include: inc, orderBy: { id: 'desc' } })
  return rows.map(summary)
}

export async function submitArticle(userId: number, input: { title: string; content: string; category?: string; tags?: string[] }) {
  let categoryId: number | undefined
  if (input.category) {
    const c = await prisma.category.findFirst({ where: { OR: [{ name: input.category }, { slug: slugify(input.category) }] } })
    categoryId = c?.id
  }
  let slug = slugify(input.title) || 'wawasan'
  let n = 1
  while (await prisma.article.findUnique({ where: { slug } })) slug = `${slugify(input.title)}-${++n}`
  const a = await prisma.article.create({
    data: {
      title: input.title, slug, authorId: userId, categoryId, content: input.content,
      excerpt: input.content.replace(/<[^>]+>/g, '').slice(0, 140), status: 'submitted', tags: input.tags ?? [],
    },
    include: inc,
  })
  return full(a, userId)
}

export async function vote(userId: number, articleId: number, type: 'like' | 'dislike') {
  const a = await prisma.article.findFirst({ where: { id: articleId, deletedAt: null } })
  if (!a) throw ApiError.notFound('Artikel tidak ditemukan.')
  const existing = await prisma.articleVote.findUnique({ where: { userId_articleId: { userId, articleId } } })
  let user_vote: 'like' | 'dislike' | null = type
  if (existing?.type === type) {
    await prisma.articleVote.delete({ where: { id: existing.id } })
    user_vote = null
  } else if (existing) {
    await prisma.articleVote.update({ where: { id: existing.id }, data: { type } })
  } else {
    await prisma.articleVote.create({ data: { userId, articleId, type } })
  }
  const votes = await prisma.articleVote.findMany({ where: { articleId }, select: { type: true } })
  const { likes: l, dislikes: d } = likes(votes)
  return { likes: l, dislikes: d, user_vote }
}

export async function toggleBookmark(userId: number, articleId: number) {
  const existing = await prisma.articleBookmark.findUnique({ where: { userId_articleId: { userId, articleId } } })
  if (existing) {
    await prisma.articleBookmark.delete({ where: { id: existing.id } })
    return { bookmarked: false }
  }
  await prisma.articleBookmark.create({ data: { userId, articleId } })
  return { bookmarked: true }
}

export async function myBookmarks(userId: number) {
  const rows = await prisma.articleBookmark.findMany({
    where: { userId, article: { status: 'published', deletedAt: null } },
    include: { article: { include: inc } },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map((b) => summary(b.article))
}

// ---- Komentar ----
function mapComment(c: Prisma.CommentGetPayload<{ include: { user: typeof userInclude; replies: { include: { user: typeof userInclude } } } }>): unknown {
  return {
    id: c.id, content: c.content, user: toAuthor(c.user), created_at: c.createdAt.toISOString(),
    status: c.status, parent_id: c.parentId,
    replies: c.replies.filter((r) => r.status === 'approved').map((r) => ({ id: r.id, content: r.content, user: toAuthor(r.user), created_at: r.createdAt.toISOString(), status: r.status, parent_id: r.parentId, replies: [] })),
  }
}

export async function getComments(articleId: number) {
  const rows = await prisma.comment.findMany({
    where: { articleId, parentId: null, status: 'approved', deletedAt: null },
    include: { user: userInclude, replies: { include: { user: userInclude } } },
    orderBy: { createdAt: 'asc' },
  })
  return rows.map(mapComment)
}

export async function addComment(userId: number, articleId: number, content: string, parentId: number | null) {
  const a = await prisma.article.findFirst({ where: { id: articleId, deletedAt: null } })
  if (!a) throw ApiError.notFound('Artikel tidak ditemukan.')
  const c = await prisma.comment.create({ data: { articleId, userId, content, parentId: parentId ?? null }, include: { user: userInclude, replies: { include: { user: userInclude } } } })
  // notifikasi balasan ke penulis komentar induk / penulis artikel
  if (parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentId } })
    if (parent && parent.userId !== userId) await notify(parent.userId, 'reply', { message: 'Seseorang membalas komentar Anda.', link: `/articles/${articleId}` })
  }
  return mapComment(c)
}

export async function report(reporterId: number, entityType: 'article' | 'comment', entityId: number, reason: string, description?: string) {
  let preview = ''
  if (entityType === 'article') preview = (await prisma.article.findUnique({ where: { id: entityId } }))?.title ?? ''
  else preview = (await prisma.comment.findUnique({ where: { id: entityId } }))?.content ?? ''
  await prisma.report.create({ data: { reporterId, entityType, entityId, reason, description, preview } })
  return { message: 'Laporan terkirim. Tim moderator akan meninjau.' }
}
