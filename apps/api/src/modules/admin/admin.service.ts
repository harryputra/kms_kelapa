import { prisma } from '../../prisma.js'
import { ApiError } from '../../lib/http.js'
import { toAuthor, userInclude, userSelectInclude } from '../../lib/dto.js'

export async function users() {
  const rows = await prisma.user.findMany({ include: userSelectInclude, orderBy: { id: 'asc' } })
  return rows.map((u) => ({ id: u.id, email: u.email, display_name: u.profile?.displayName ?? u.email, role: u.role.name, status: u.status, created_at: u.createdAt.toISOString() }))
}

export async function changeRole(id: number, roleName: string) {
  const role = await prisma.role.findUnique({ where: { name: roleName } })
  if (!role) throw ApiError.badRequest('Peran tidak valid.')
  await prisma.user.update({ where: { id }, data: { roleId: role.id } })
}

export async function toggleSuspend(id: number) {
  const u = await prisma.user.findUnique({ where: { id } })
  if (!u) throw ApiError.notFound('Pengguna tidak ditemukan.')
  await prisma.user.update({ where: { id }, data: { status: u.status === 'suspended' ? 'active' : 'suspended' } })
}

const SETTING_DEFAULTS = { site_name: 'COCONEXUS', site_description: 'Platform manajemen pengetahuan limbah kelapa untuk UMKM.', site_logo: '', favicon: '/favicon.svg', posts_per_page: '20', maintenance_mode: 'false' }

export async function getSettings() {
  const rows = await prisma.systemSetting.findMany()
  const map = { ...SETTING_DEFAULTS, ...Object.fromEntries(rows.map((r) => [r.key, r.value])) }
  return {
    site_name: map.site_name, site_description: map.site_description, site_logo: map.site_logo,
    favicon: map.favicon, posts_per_page: Number(map.posts_per_page) || 20, maintenance_mode: map.maintenance_mode === 'true',
  }
}

export async function updateSettings(patch: Record<string, unknown>) {
  for (const [key, value] of Object.entries(patch)) {
    await prisma.systemSetting.upsert({ where: { key }, update: { value: String(value) }, create: { key, value: String(value) } })
  }
  return getSettings()
}

export async function menu() {
  const rows = await prisma.menuItem.findMany({ orderBy: { sortOrder: 'asc' } })
  return rows.map((m) => ({ id: m.id, label: m.label, url: m.url, icon: m.icon ?? '', parent_id: m.parentId, sort_order: m.sortOrder, is_visible: m.isVisible, target: m.target }))
}

export async function saveMenu(items: Array<{ label: string; url: string; icon?: string; target?: string; is_visible?: boolean }>) {
  await prisma.$transaction([
    prisma.menuItem.deleteMany({}),
    prisma.menuItem.createMany({ data: items.map((m, i) => ({ label: m.label, url: m.url, icon: m.icon ?? null, target: m.target ?? '_self', isVisible: m.is_visible ?? true, sortOrder: i + 1 })) }),
  ])
  return menu()
}

export async function recycleBin(type?: string) {
  const out: Array<{ type: string; id: number; title: string; deleted_by: ReturnType<typeof toAuthor>; deleted_at: string }> = []
  if (!type || type === 'articles') {
    const arts = await prisma.article.findMany({ where: { deletedAt: { not: null } }, include: { author: userInclude } })
    arts.forEach((a) => out.push({ type: 'articles', id: a.id, title: a.title, deleted_by: toAuthor(a.author), deleted_at: a.deletedAt!.toISOString() }))
  }
  if (!type || type === 'comments') {
    const cms = await prisma.comment.findMany({ where: { deletedAt: { not: null } }, include: { user: userInclude } })
    cms.forEach((c) => out.push({ type: 'comments', id: c.id, title: c.content.slice(0, 60), deleted_by: toAuthor(c.user), deleted_at: c.deletedAt!.toISOString() }))
  }
  if (!type || type === 'users') {
    const us = await prisma.user.findMany({ where: { deletedAt: { not: null } }, include: userSelectInclude })
    us.forEach((u) => out.push({ type: 'users', id: u.id, title: u.email, deleted_by: toAuthor(u), deleted_at: u.deletedAt!.toISOString() }))
  }
  return out.sort((a, b) => b.deleted_at.localeCompare(a.deleted_at))
}

export async function restore(id: number) {
  const a = await prisma.article.findFirst({ where: { id, deletedAt: { not: null } } })
  if (a) return prisma.article.update({ where: { id }, data: { deletedAt: null } })
  const c = await prisma.comment.findFirst({ where: { id, deletedAt: { not: null } } })
  if (c) return prisma.comment.update({ where: { id }, data: { deletedAt: null } })
  const u = await prisma.user.findFirst({ where: { id, deletedAt: { not: null } } })
  if (u) return prisma.user.update({ where: { id }, data: { deletedAt: null } })
  throw ApiError.notFound('Item tidak ditemukan di recycle bin.')
}

export async function auditLogs() {
  const rows = await prisma.auditLog.findMany({ include: { user: userInclude }, orderBy: { createdAt: 'desc' }, take: 100 })
  return rows.map((l) => ({ id: l.id, user: l.user ? toAuthor(l.user) : null, action: l.action, entity_type: l.entityType ?? '', entity_id: l.entityId, description: l.description ?? '', ip_address: l.ipAddress ?? '', created_at: l.createdAt.toISOString() }))
}

export async function stats() {
  const [total_users, total_articles, published_articles, pending_review, total_comments, pending_comments, open_reports, viewsAgg] = await Promise.all([
    prisma.user.count(), prisma.article.count(), prisma.article.count({ where: { status: 'published' } }),
    prisma.article.count({ where: { status: { in: ['submitted', 'review'] } } }), prisma.comment.count(),
    prisma.comment.count({ where: { status: 'pending' } }), prisma.report.count({ where: { status: 'open' } }),
    prisma.article.aggregate({ _sum: { views: true } }),
  ])
  return {
    total_users, total_articles, published_articles, pending_review, total_comments, pending_comments, open_reports,
    views_today: viewsAgg._sum.views ?? 0,
    views_trend: [320, 410, 380, 520, 610, 540, viewsAgg._sum.views ?? 800],
    signups_trend: [3, 5, 2, 6, 4, 7, Math.max(1, total_users)],
  }
}
