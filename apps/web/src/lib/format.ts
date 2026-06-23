import type { ArticleStatus, CommentStatus, NotificationType } from '@/types'

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return '-'
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return 'baru saja'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} menit lalu`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} jam lalu`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d} hari lalu`
  return formatDate(iso)
}

export function compactNumber(n: number): string {
  if (n < 1000) return String(n)
  if (n < 1_000_000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'rb'
  return (n / 1_000_000).toFixed(1) + 'jt'
}

interface StatusMeta {
  label: string
  chip: string // kelas tailwind untuk chip
  dot: string
}

export const ARTICLE_STATUS: Record<ArticleStatus, StatusMeta> = {
  draft: { label: 'Draft', chip: 'bg-line text-muted', dot: 'bg-muted' },
  submitted: { label: 'Dikirim', chip: 'bg-info/10 text-info', dot: 'bg-info' },
  review: { label: 'Direview', chip: 'bg-info/10 text-info', dot: 'bg-info' },
  revision: { label: 'Revisi', chip: 'bg-warning/15 text-gold-700', dot: 'bg-warning' },
  published: { label: 'Terbit', chip: 'bg-success/10 text-success', dot: 'bg-success' },
  rejected: { label: 'Ditolak', chip: 'bg-danger/10 text-danger', dot: 'bg-danger' },
  archived: { label: 'Arsip', chip: 'bg-line text-muted', dot: 'bg-muted' },
}

export const COMMENT_STATUS: Record<CommentStatus, StatusMeta> = {
  pending: { label: 'Menunggu', chip: 'bg-warning/15 text-gold-700', dot: 'bg-warning' },
  approved: { label: 'Disetujui', chip: 'bg-success/10 text-success', dot: 'bg-success' },
  rejected: { label: 'Ditolak', chip: 'bg-danger/10 text-danger', dot: 'bg-danger' },
}

export const NOTIFICATION_ICON: Record<NotificationType, string> = {
  reply: 'message-circle',
  article_approved: 'check-circle',
  article_revision: 'pencil',
  article_rejected: 'x-circle',
  follow_publish: 'bell',
  badge_awarded: 'award',
}

// Gradien avatar/cover deterministik dari string (tanpa aset eksternal)
const GRADIENTS = [
  'from-primary-500 to-primary-700',
  'from-primary-400 to-primary-600',
  'from-gold-400 to-gold-600',
  'from-primary-600 to-primary-800',
  'from-emerald-400 to-primary-600',
  'from-teal-500 to-primary-700',
]
export function gradientFor(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return GRADIENTS[h % GRADIENTS.length]
}

export function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
