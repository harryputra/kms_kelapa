import { prisma } from '../../prisma.js'
import { ApiError } from '../../lib/http.js'
import { toAuthor, userInclude } from '../../lib/dto.js'
import { inc as articleInc, summary as articleSummary } from '../articles/article.service.js'
import { notify } from '../notifications/notification.service.js'

export async function reviewQueue() {
  const rows = await prisma.article.findMany({ where: { status: { in: ['submitted', 'review'] }, deletedAt: null }, include: articleInc, orderBy: { id: 'desc' } })
  return rows.map(articleSummary)
}

export async function reviewArticle(id: number, action: 'approve' | 'reject' | 'revision', notes?: string) {
  const a = await prisma.article.findFirst({ where: { id, deletedAt: null } })
  if (!a) throw ApiError.notFound('Artikel tidak ditemukan.')
  if ((action === 'reject' || action === 'revision') && !notes?.trim()) throw ApiError.badRequest('Catatan reviewer wajib diisi.')
  if (action === 'approve') {
    await prisma.article.update({ where: { id }, data: { status: 'published', publishedAt: new Date(), reviewNotes: null } })
    await notify(a.authorId, 'article_approved', { message: `Artikel "${a.title}" telah disetujui & terbit.`, link: `/articles/${id}` })
  } else if (action === 'revision') {
    await prisma.article.update({ where: { id }, data: { status: 'revision', reviewNotes: notes } })
    await notify(a.authorId, 'article_revision', { message: `Artikel "${a.title}" perlu revisi.`, link: '/dashboard/articles' })
  } else {
    await prisma.article.update({ where: { id }, data: { status: 'rejected', reviewNotes: notes } })
    await notify(a.authorId, 'article_rejected', { message: `Artikel "${a.title}" ditolak.`, link: '/dashboard/articles' })
  }
}

export async function pendingComments() {
  const rows = await prisma.comment.findMany({ where: { status: 'pending', deletedAt: null }, include: { user: userInclude, article: { select: { id: true, title: true } } }, orderBy: { createdAt: 'desc' } })
  return rows.map((c) => ({ id: c.id, article_id: c.articleId, article_title: c.article.title, content: c.content, user: toAuthor(c.user), status: c.status, created_at: c.createdAt.toISOString() }))
}

export async function moderateComment(id: number, status: 'approved' | 'rejected') {
  await prisma.comment.update({ where: { id }, data: { status } })
}

export async function reports() {
  const rows = await prisma.report.findMany({ where: { status: 'open' }, include: { reporter: userInclude }, orderBy: { createdAt: 'desc' } })
  return rows.map((r) => ({ id: r.id, reporter: toAuthor(r.reporter), reason: r.reason, description: r.description ?? '', entity_type: r.entityType, entity_id: r.entityId, entity_preview: r.preview ?? '', created_at: r.createdAt.toISOString() }))
}

export async function resolveReport(id: number, resolution: 'ignore' | 'delete') {
  const r = await prisma.report.findUnique({ where: { id } })
  if (!r) throw ApiError.notFound('Laporan tidak ditemukan.')
  if (resolution === 'delete') {
    if (r.entityType === 'article') await prisma.article.update({ where: { id: r.entityId }, data: { deletedAt: new Date() } }).catch(() => undefined)
    else await prisma.comment.update({ where: { id: r.entityId }, data: { deletedAt: new Date(), status: 'rejected' } }).catch(() => undefined)
  }
  await prisma.report.update({ where: { id }, data: { status: resolution === 'delete' ? 'resolved' : 'ignored' } })
}
