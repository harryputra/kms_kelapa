import { prisma } from '../../prisma.js'
import { ApiError } from '../../lib/http.js'
import { toAuthor, userInclude } from '../../lib/dto.js'

export async function topics() {
  const rows = await prisma.forumTopic.findMany({
    include: { author: userInclude, _count: { select: { replies: true } }, replies: { orderBy: { createdAt: 'desc' }, take: 1, select: { createdAt: true } } },
    orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
  })
  return rows.map((t) => ({
    id: t.id, title: t.title, author: toAuthor(t.author), category: t.category ?? '-',
    is_pinned: t.isPinned, is_locked: t.isLocked, replies_count: t._count.replies,
    created_at: t.createdAt.toISOString(), last_activity: (t.replies[0]?.createdAt ?? t.updatedAt).toISOString(),
  }))
}

export async function topic(id: number) {
  const t = await prisma.forumTopic.findUnique({ where: { id }, include: { author: userInclude, replies: { include: { user: userInclude }, orderBy: { createdAt: 'asc' } } } })
  if (!t) throw ApiError.notFound('Topik tidak ditemukan.')
  return {
    id: t.id, title: t.title, author: toAuthor(t.author), category: t.category ?? '-',
    is_pinned: t.isPinned, is_locked: t.isLocked, replies_count: t.replies.length,
    created_at: t.createdAt.toISOString(), last_activity: (t.replies.at(-1)?.createdAt ?? t.updatedAt).toISOString(),
    content: t.content,
    replies: t.replies.map((r) => ({ id: r.id, content: r.content, user: toAuthor(r.user), created_at: r.createdAt.toISOString() })),
  }
}

export async function create(userId: number, input: { title: string; content: string; category?: string }) {
  await prisma.forumTopic.create({ data: { userId, title: input.title, content: input.content, category: input.category ?? null } })
  return topics()
}

export async function addReply(userId: number, topicId: number, content: string) {
  const t = await prisma.forumTopic.findUnique({ where: { id: topicId } })
  if (!t) throw ApiError.notFound('Topik tidak ditemukan.')
  if (t.isLocked) throw ApiError.forbidden('Topik terkunci.')
  const r = await prisma.forumReply.create({ data: { topicId, userId, content }, include: { user: userInclude } })
  await prisma.forumTopic.update({ where: { id: topicId }, data: { updatedAt: new Date() } })
  return { id: r.id, content: r.content, user: toAuthor(r.user), created_at: r.createdAt.toISOString() }
}

export async function setPin(id: number, pinned: boolean) { await prisma.forumTopic.update({ where: { id }, data: { isPinned: pinned } }) }
export async function setLock(id: number, locked: boolean) { await prisma.forumTopic.update({ where: { id }, data: { isLocked: locked } }) }
