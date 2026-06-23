import type { Prisma } from '@prisma/client'
import { prisma } from '../../prisma.js'

// Buat notifikasi (observer ringan dipanggil dari service lain).
export async function notify(userId: number, type: string, data: Record<string, unknown>) {
  await prisma.notification.create({ data: { userId, type, data: data as Prisma.InputJsonValue } }).catch(() => undefined)
}

export async function list(userId: number) {
  const rows = await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 })
  return rows.map((n) => ({ id: n.id, type: n.type, data: n.data, is_read: !!n.readAt, created_at: n.createdAt.toISOString() }))
}

export async function markRead(userId: number, id: number) {
  await prisma.notification.updateMany({ where: { id, userId, readAt: null }, data: { readAt: new Date() } })
}

export async function markAllRead(userId: number) {
  await prisma.notification.updateMany({ where: { userId, readAt: null }, data: { readAt: new Date() } })
}
