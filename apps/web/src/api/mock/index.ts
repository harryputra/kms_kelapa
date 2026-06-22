// Implementasi mock API in-memory. Mensimulasikan latensi & paginasi.
// Semua fungsi async agar antarmuka identik dengan klien HTTP nyata.
import type {
  AdminUserItem,
  AppNotification,
  ArticleDetail,
  ArticleFull,
  ArticleSummary,
  AuditLog,
  AuthResult,
  Category,
  Comment,
  ContentTemplate,
  ForumReply,
  ForumTopic,
  ForumTopicDetail,
  MenuItem,
  Paginated,
  PaginationMeta,
  RecycleBinItem,
  ReportItem,
  Role,
  SystemSettings,
  UserProfileDetail,
  VoteType,
} from '@/types'
import * as db from './data'

const delay = (ms = 320) => new Promise((r) => setTimeout(r, ms))

function paginate<T>(items: T[], page = 1, limit = 20): Paginated<T> {
  const total = items.length
  const start = (page - 1) * limit
  const meta: PaginationMeta = {
    current_page: page,
    per_page: limit,
    total_items: total,
    total_pages: Math.max(1, Math.ceil(total / limit)),
  }
  return { data: items.slice(start, start + limit), meta }
}

function toSummary(a: ArticleFull): ArticleSummary {
  const { content, sources, user_vote, is_bookmarked, review_notes, ...rest } = a
  void content; void sources; void user_vote; void is_bookmarked; void review_notes
  return rest
}

let currentUserId: number | null = null

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export const mockApi = {
  // ---------- AUTH ----------
  async login(email: string, password: string): Promise<AuthResult> {
    await delay()
    const u = db.users.find((x) => x.email.toLowerCase() === email.toLowerCase())
    if (!u || u.password !== password) throw new ApiError(401, 'Email atau kata sandi salah.')
    if (u.status === 'suspended') throw new ApiError(403, 'Akun Anda dinonaktifkan. Hubungi admin.')
    currentUserId = u.id
    return { access_token: `mock.${u.id}.${Date.now()}`, user: stripPassword(u) }
  },

  async register(email: string, _password: string, display_name: string): Promise<{ message: string }> {
    await delay()
    if (db.users.some((x) => x.email.toLowerCase() === email.toLowerCase()))
      throw new ApiError(409, 'Email sudah terdaftar.')
    void display_name
    return { message: 'Registrasi berhasil. Silakan cek email untuk verifikasi (mode demo: langsung aktif).' }
  },

  async me(): Promise<UserProfileDetail | null> {
    await delay(120)
    if (!currentUserId) return null
    const u = db.users.find((x) => x.id === currentUserId)
    return u ? stripPassword(u) : null
  },

  async logout(): Promise<void> {
    await delay(120)
    currentUserId = null
  },

  setSession(userId: number | null) {
    currentUserId = userId
  },

  // ---------- ARTICLES ----------
  async listPublished(params: {
    page?: number
    limit?: number
    search?: string
    category?: string
    sort?: 'newest' | 'popular' | 'oldest'
  } = {}): Promise<Paginated<ArticleSummary>> {
    await delay()
    let list = db.articles.filter((a) => a.status === 'published')
    if (params.search) {
      const q = params.search.toLowerCase()
      list = list.filter((a) => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q) || a.tags.some((t) => t.includes(q)))
    }
    if (params.category) list = list.filter((a) => slug(a.category) === params.category)
    if (params.sort === 'popular') list = [...list].sort((a, b) => b.stats.likes - a.stats.likes)
    else if (params.sort === 'oldest') list = [...list].sort((a, b) => (a.published_at ?? '').localeCompare(b.published_at ?? ''))
    else list = [...list].sort((a, b) => (b.published_at ?? '').localeCompare(a.published_at ?? ''))
    return paginate(list.map(toSummary), params.page, params.limit)
  },

  async getArticle(id: number, isAuthenticated: boolean): Promise<ArticleDetail> {
    await delay()
    const a = db.articles.find((x) => x.id === id)
    if (!a) throw new ApiError(404, 'Artikel tidak ditemukan.')
    a.stats.views += 1
    if (!isAuthenticated && a.status === 'published') {
      const half = Math.ceil(a.content.length * 0.5)
      const { content, sources, user_vote, is_bookmarked, review_notes, ...rest } = a
      void content; void sources; void user_vote; void is_bookmarked; void review_notes
      return { ...rest, content_preview: a.content.slice(0, half), is_truncated: true }
    }
    return { ...a }
  },

  async myArticles(): Promise<ArticleSummary[]> {
    await delay()
    const list = db.articles.filter((a) => a.author.id === currentUserId)
    return list.map(toSummary)
  },

  async submitArticle(input: { title: string; content: string; category: string; tags: string[] }): Promise<ArticleFull> {
    await delay(500)
    const author = db.users.find((u) => u.id === currentUserId)!
    const id = Math.max(...db.articles.map((a) => a.id)) + 1
    const created: ArticleFull = {
      id,
      title: input.title,
      slug: slug(input.title),
      author: db.pub(author.id),
      category: input.category,
      tags: input.tags,
      excerpt: input.content.replace(/<[^>]+>/g, '').slice(0, 140),
      thumbnail_url: null,
      status: 'submitted',
      published_at: null,
      content: input.content,
      sources: [],
      user_vote: null,
      is_bookmarked: false,
      review_notes: null,
      stats: { views: 0, likes: 0, dislikes: 0, comments: 0 },
    }
    db.articles.unshift(created)
    return created
  },

  async vote(id: number, type: VoteType): Promise<{ likes: number; dislikes: number; user_vote: VoteType | null }> {
    await delay(160)
    const a = db.articles.find((x) => x.id === id)
    if (!a) throw new ApiError(404, 'Artikel tidak ditemukan.')
    if (a.user_vote === type) {
      a.user_vote = null
      if (type === 'like') a.stats.likes--
      else a.stats.dislikes--
    } else {
      if (a.user_vote === 'like') a.stats.likes--
      if (a.user_vote === 'dislike') a.stats.dislikes--
      a.user_vote = type
      if (type === 'like') a.stats.likes++
      else a.stats.dislikes++
    }
    return { likes: a.stats.likes, dislikes: a.stats.dislikes, user_vote: a.user_vote }
  },

  async toggleBookmark(id: number): Promise<{ bookmarked: boolean }> {
    await delay(160)
    const a = db.articles.find((x) => x.id === id)
    if (!a) throw new ApiError(404, 'Artikel tidak ditemukan.')
    a.is_bookmarked = !a.is_bookmarked
    return { bookmarked: a.is_bookmarked }
  },

  async myBookmarks(): Promise<ArticleSummary[]> {
    await delay()
    return db.articles.filter((a) => a.is_bookmarked && a.status === 'published').map(toSummary)
  },

  async report(): Promise<{ message: string }> {
    await delay()
    return { message: 'Laporan terkirim. Tim moderator akan meninjau.' }
  },

  // ---------- COMMENTS ----------
  async getComments(articleId: number): Promise<Comment[]> {
    await delay(200)
    return db.commentsByArticle[articleId] ?? []
  },

  async addComment(articleId: number, content: string, parentId: number | null): Promise<Comment> {
    await delay(220)
    const author = db.users.find((u) => u.id === currentUserId)!
    const c: Comment = {
      id: Date.now(),
      content,
      user: db.pub(author.id),
      created_at: new Date().toISOString(),
      status: 'pending',
      parent_id: parentId,
      replies: [],
    }
    db.pendingComments.unshift(c)
    return c
  },

  // ---------- CATEGORIES / TEMPLATES ----------
  async categories(): Promise<Category[]> {
    await delay(160)
    return db.categories
  },
  async templates(): Promise<ContentTemplate[]> {
    await delay(160)
    return db.templates
  },

  // ---------- NOTIFICATIONS ----------
  async notifications(): Promise<AppNotification[]> {
    await delay(160)
    return [...db.notifications]
  },
  async markRead(id: number): Promise<void> {
    await delay(80)
    const n = db.notifications.find((x) => x.id === id)
    if (n) n.is_read = true
  },
  async markAllRead(): Promise<void> {
    await delay(120)
    db.notifications.forEach((n) => (n.is_read = true))
  },

  // ---------- FORUM ----------
  async forumTopics(): Promise<ForumTopic[]> {
    await delay()
    return [...db.forumTopics]
      .sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned) || b.last_activity.localeCompare(a.last_activity))
      .map(stripReplies)
  },
  async forumTopic(id: number): Promise<ForumTopicDetail> {
    await delay()
    const t = db.forumTopics.find((x) => x.id === id)
    if (!t) throw new ApiError(404, 'Topik tidak ditemukan.')
    return { ...t }
  },
  async addReply(topicId: number, content: string): Promise<ForumReply> {
    await delay(220)
    const t = db.forumTopics.find((x) => x.id === topicId)
    if (!t) throw new ApiError(404, 'Topik tidak ditemukan.')
    if (t.is_locked) throw new ApiError(403, 'Topik terkunci.')
    const author = db.users.find((u) => u.id === currentUserId)!
    const r: ForumReply = { id: Date.now(), content, user: db.pub(author.id), created_at: new Date().toISOString() }
    t.replies.push(r)
    t.replies_count++
    t.last_activity = r.created_at
    return r
  },

  // ---------- MODERATOR ----------
  async reviewQueue(): Promise<ArticleSummary[]> {
    await delay()
    return db.articles.filter((a) => a.status === 'submitted' || a.status === 'review').map(toSummary)
  },
  async reviewArticle(id: number, action: 'approve' | 'reject' | 'revision', notes?: string): Promise<void> {
    await delay(300)
    const a = db.articles.find((x) => x.id === id)
    if (!a) throw new ApiError(404, 'Artikel tidak ditemukan.')
    if ((action === 'reject' || action === 'revision') && !notes?.trim())
      throw new ApiError(400, 'Catatan reviewer wajib diisi untuk revisi/penolakan.')
    if (action === 'approve') {
      a.status = 'published'
      a.published_at = new Date().toISOString()
      a.review_notes = null
    } else if (action === 'revision') {
      a.status = 'revision'
      a.review_notes = notes ?? null
    } else {
      a.status = 'rejected'
      a.review_notes = notes ?? null
    }
  },
  async pendingComments(): Promise<Comment[]> {
    await delay()
    return [...db.pendingComments]
  },
  async moderateComment(id: number, status: 'approved' | 'rejected'): Promise<void> {
    await delay(180)
    const idx = db.pendingComments.findIndex((c) => c.id === id)
    if (idx >= 0) {
      db.pendingComments[idx].status = status
      db.pendingComments.splice(idx, 1)
    }
  },
  async reports(): Promise<ReportItem[]> {
    await delay()
    return [...db.reports]
  },
  async resolveReport(id: number): Promise<void> {
    await delay(160)
    const idx = db.reports.findIndex((r) => r.id === id)
    if (idx >= 0) db.reports.splice(idx, 1)
  },

  // ---------- ADMIN ----------
  async adminUsers(): Promise<AdminUserItem[]> {
    await delay()
    return [...db.adminUsers]
  },
  async changeRole(id: number, role: Role): Promise<void> {
    await delay(160)
    const u = db.adminUsers.find((x) => x.id === id)
    if (u) u.role = role
  },
  async toggleSuspend(id: number): Promise<void> {
    await delay(160)
    const u = db.adminUsers.find((x) => x.id === id)
    if (u) u.status = u.status === 'suspended' ? 'active' : 'suspended'
  },
  async getSettings(): Promise<SystemSettings> {
    await delay(140)
    return { ...db.systemSettings }
  },
  async updateSettings(s: Partial<SystemSettings>): Promise<SystemSettings> {
    await delay(220)
    Object.assign(db.systemSettings, s)
    return { ...db.systemSettings }
  },
  async menu(): Promise<MenuItem[]> {
    await delay(140)
    return [...db.menuItems].sort((a, b) => a.sort_order - b.sort_order)
  },
  async saveMenu(items: MenuItem[]): Promise<void> {
    await delay(180)
    db.menuItems.splice(0, db.menuItems.length, ...items)
  },
  async recycleBin(): Promise<RecycleBinItem[]> {
    await delay()
    return [...db.recycleBin]
  },
  async restore(id: number): Promise<void> {
    await delay(180)
    const idx = db.recycleBin.findIndex((r) => r.id === id)
    if (idx >= 0) db.recycleBin.splice(idx, 1)
  },
  async auditLogs(): Promise<AuditLog[]> {
    await delay()
    return [...db.auditLogs]
  },
  async stats() {
    await delay(180)
    return {
      total_users: db.users.length,
      total_articles: db.articles.length,
      published_articles: db.articles.filter((a) => a.status === 'published').length,
      pending_review: db.articles.filter((a) => a.status === 'submitted' || a.status === 'review').length,
      total_comments: Object.values(db.commentsByArticle).flat().length + db.pendingComments.length,
      pending_comments: db.pendingComments.length,
      open_reports: db.reports.length,
      views_today: 1284,
      // tren 7 hari (untuk grafik mini)
      views_trend: [320, 410, 380, 520, 610, 540, 1284],
      signups_trend: [3, 5, 2, 6, 4, 7, 9],
    }
  },
}

function stripPassword(u: db.SeedUser): UserProfileDetail {
  const { password, status, created_at, ...rest } = u
  void password; void status; void created_at
  return rest
}
function stripReplies(t: ForumTopicDetail): ForumTopic {
  const { content, replies, ...rest } = t
  void content; void replies
  return rest
}
function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
