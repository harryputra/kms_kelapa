// Implementasi mock API in-memory. Mensimulasikan latensi & paginasi.
// Semua fungsi async agar antarmuka identik dengan klien HTTP nyata.
import type {
  AdminUserItem,
  AppNotification,
  ArticleDetail,
  ArticleFull,
  ArticleSummary,
  AssistantReply,
  AuditLog,
  AuthResult,
  BlueprintCreateInput,
  BlueprintFacets,
  BlueprintFull,
  BlueprintSummary,
  Category,
  ListingCategory,
  ListingKind,
  QnaAnswer,
  QnaQuestion,
  RegionStat,
  ReplicationInput,
  ReplicationReport,
  UmkmDirectoryEntry,
  WasteListing,
  WasteListingInput,
  AiProvider,
  AiSettings,
  AiSettingsInput,
  AiTestResult,
  Comment,
  ContentTemplate,
  ForumReply,
  ForumTopic,
  ForumTopicDetail,
  MenuItem,
  Paginated,
  PaginationMeta,
  ProductEconomics,
  ProductHub,
  RecycleBinItem,
  ReportItem,
  Role,
  SystemSettings,
  UserProfileDetail,
  ValueNode,
  VoteType,
  WasteKind,
} from '@/types'
import * as db from './data'
import { blueprintsFull, valueNodes } from './blueprints'
import { questions, reportsByBlueprint } from './community'
import { directory, listings, regionGeo } from './exchange'
import { MARKETING } from './marketing'
import { projectPct } from '@/lib/indonesiaMap'
import { DIFFICULTY, MATURITY, WASTE, computeEconomics, formatRupiah } from '@/lib/blueprint'

const delay = (ms = 320) => new Promise((r) => setTimeout(r, ms))

// Konfigurasi Asisten AI (simulasi penyimpanan admin di mode mock).
const mockAi = {
  enabled: false,
  provider: 'openai' as AiProvider,
  base_url: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  api_key: '',
  temperature: 0.3,
  max_tokens: 700,
  top_k: 4,
  system_prompt: '',
}
const readAiSettings = (): AiSettings => {
  const { api_key, ...rest } = mockAi
  return { ...rest, api_key_set: api_key.length > 0 }
}

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

  async report(_entityType: 'article' | 'comment', _entityId: number, _reason: string, _description?: string): Promise<{ message: string }> {
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
  async resolveReport(id: number, _resolution?: 'ignore' | 'delete'): Promise<void> {
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
  async getAiSettings(): Promise<AiSettings> {
    await delay(140)
    return readAiSettings()
  },
  async updateAiSettings(patch: AiSettingsInput): Promise<AiSettings> {
    await delay(220)
    if (patch.api_key !== undefined) mockAi.api_key = patch.api_key ?? ''
    const { api_key: _omit, ...rest } = patch
    Object.assign(mockAi, rest)
    return readAiSettings()
  },
  async testAiConnection(): Promise<AiTestResult> {
    await delay(650)
    if (!mockAi.enabled) return { ok: false, message: 'Asisten AI dinonaktifkan. Aktifkan dulu untuk menguji.' }
    if (mockAi.provider === 'anthropic' && !mockAi.api_key) return { ok: false, message: 'API key Anthropic belum diisi.' }
    return { ok: true, latency_ms: 480, model: mockAi.model, sample: 'OK — koneksi simulasi berhasil (mode mock).' }
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
  // ---------- CETAK BIRU TEKNIS (BLUEPRINT) ----------
  async listBlueprints(f: BlueprintFacets = {}): Promise<BlueprintSummary[]> {
    await delay()
    let list = blueprintsFull.filter((b) => b.status === 'published').map(toBlueprintSummary)
    if (f.search) {
      const q = f.search.toLowerCase()
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.excerpt.toLowerCase().includes(q) ||
          b.product.toLowerCase().includes(q) ||
          b.tags.some((t) => t.includes(q)),
      )
    }
    if (f.wasteKind) list = list.filter((b) => b.wasteKind === f.wasteKind)
    if (f.product) list = list.filter((b) => slug(b.product) === f.product)
    if (f.difficulty) list = list.filter((b) => b.difficulty === f.difficulty)
    if (f.capitalTier) list = list.filter((b) => b.capitalTier === f.capitalTier)
    if (f.maturity) list = list.filter((b) => b.maturity === f.maturity)

    const order = { raw: 1, curated: 2, validated: 3, standard: 4 }
    if (f.sort === 'maturity') list = [...list].sort((a, b) => order[b.maturity] - order[a.maturity])
    else if (f.sort === 'capital') list = [...list].sort((a, b) => a.minCapital - b.minCapital)
    else if (f.sort === 'newest') list = [...list].sort((a, b) => b.id - a.id)
    else list = [...list].sort((a, b) => b.stats.saves - a.stats.saves) // popular (default)
    return list
  },

  async getBlueprint(id: number): Promise<BlueprintFull> {
    await delay()
    const b = blueprintsFull.find((x) => x.id === id)
    if (!b) throw new ApiError(404, 'Cetak biru tidak ditemukan.')
    b.stats.views += 1
    return { ...b }
  },

  async toggleBlueprintBookmark(id: number): Promise<{ bookmarked: boolean }> {
    await delay(160)
    const b = blueprintsFull.find((x) => x.id === id)
    if (!b) throw new ApiError(404, 'Cetak biru tidak ditemukan.')
    b.isBookmarked = !b.isBookmarked
    b.stats.saves += b.isBookmarked ? 1 : -1
    return { bookmarked: b.isBookmarked }
  },

  async addReplication(id: number, outcome: 'success' | 'partial' | 'fail'): Promise<BlueprintFull> {
    await delay(260)
    const b = blueprintsFull.find((x) => x.id === id)
    if (!b) throw new ApiError(404, 'Cetak biru tidak ditemukan.')
    b.replications[outcome] += 1
    const total = b.replications.success + b.replications.partial + b.replications.fail
    b.stats.replications = total
    b.stats.successRate = total ? Math.round((b.replications.success / total) * 100) : 0
    return { ...b }
  },

  async valueTree(): Promise<ValueNode[]> {
    await delay(160)
    const pub = blueprintsFull.filter((b) => b.status === 'published')
    return valueNodes.map((n) => {
      let count = 0
      if (n.type === 'root') count = pub.length
      else if (n.type === 'waste') count = pub.filter((b) => b.wasteKind === n.slug).length
      else count = pub.filter((b) => slug(b.product) === n.slug).length
      return { ...n, blueprintCount: count }
    })
  },

  // Hub Rantai Nilai Produk: agregasi proses + UMKM + ekonomi + pemasaran + bursa.
  async productHub(productSlug: string): Promise<ProductHub> {
    await delay()
    const node = valueNodes.find((n) => n.type === 'product' && n.slug === productSlug)
    if (!node) throw new ApiError(404, 'Produk tidak ditemukan.')
    const wasteNode = valueNodes.find((n) => n.id === node.parentId)
    const wasteKind = (wasteNode?.slug ?? 'sabut') as WasteKind
    const bps = blueprintsFull.filter((b) => b.status === 'published' && slug(b.product) === productSlug)
    const umkms = directory.filter((d) => d.products.some((p) => slug(p) === productSlug))
    const list = listings.filter((l) => slug(l.material).includes(productSlug) || l.material.toLowerCase().includes(node.name.toLowerCase()))

    let economics: ProductEconomics
    if (bps.length) {
      const caps = bps.map((b) => b.minCapital)
      const ecos = bps.map((b) => computeEconomics(b.economic, b.economic.batchInputKg * 5))
      const cheapest = bps.reduce((a, b) => (b.minCapital < a.minCapital ? b : a))
      economics = {
        count: bps.length, minCapital: Math.min(...caps), maxCapital: Math.max(...caps),
        avgWeeklyProfit: Math.round(ecos.reduce((s, e) => s + e.grossProfit, 0) / ecos.length),
        bepMin: Math.min(...ecos.map((e) => e.bepBatches)), bepMax: Math.max(...ecos.map((e) => e.bepBatches)),
        cheapestBlueprintId: cheapest.id,
      }
    } else {
      economics = { count: 0, minCapital: 0, maxCapital: 0, avgWeeklyProfit: 0, bepMin: 0, bepMax: 0, cheapestBlueprintId: null }
    }

    return {
      product: { name: node.name, slug: productSlug, wasteKind, wasteLabel: WASTE[wasteKind].label, icon: node.icon },
      blueprints: bps.map(toBlueprintSummary), umkms, economics, marketing: MARKETING[productSlug] ?? null, listings: list,
    }
  },

  // ---- Kontribusi & kurasi Cetak Biru ----
  async myBlueprints(): Promise<BlueprintSummary[]> {
    await delay()
    return blueprintsFull.filter((b) => b.author.id === currentUserId).map(toBlueprintSummary)
  },

  async myBlueprintBookmarks(): Promise<BlueprintSummary[]> {
    await delay()
    return blueprintsFull.filter((b) => b.isBookmarked && b.status === 'published').map(toBlueprintSummary)
  },

  async submitBlueprint(input: BlueprintCreateInput): Promise<BlueprintFull> {
    await delay(500)
    if (!currentUserId) throw new ApiError(401, 'Anda harus login.')
    const author = db.users.find((u) => u.id === currentUserId)!
    const id = Math.max(...blueprintsFull.map((b) => b.id)) + 1
    const created: BlueprintFull = {
      id,
      title: input.title,
      slug: slug(input.title),
      author: db.pub(author.id),
      wasteKind: input.wasteKind,
      wasteLabel: input.wasteLabel,
      product: input.product,
      excerpt: input.excerpt,
      status: 'submitted',
      maturity: 'raw',
      difficulty: input.difficulty,
      capitalTier: input.capitalTier,
      minCapital: input.economic.capital,
      estTime: input.estTime,
      tags: input.tags,
      summary: input.summary,
      materials: input.materials,
      steps: input.steps,
      quality: input.quality,
      safety: input.safety,
      economic: input.economic,
      sources: input.sources,
      isBookmarked: false,
      replications: { success: 0, partial: 0, fail: 0 },
      variants: [],
      versions: [{ version: 1, changelog: 'Versi awal (kontribusi).', author: db.pub(author.id), createdAt: new Date().toISOString() }],
      stats: { views: 0, saves: 0, replications: 0, successRate: 0 },
    }
    blueprintsFull.unshift(created)
    return created
  },

  // ---- Validasi lapangan: laporan replikasi ----
  async getReplications(blueprintId: number): Promise<ReplicationReport[]> {
    await delay(200)
    return [...(reportsByBlueprint[blueprintId] ?? [])]
  },

  async addReplicationReport(blueprintId: number, input: ReplicationInput): Promise<BlueprintFull> {
    await delay(320)
    const b = blueprintsFull.find((x) => x.id === blueprintId)
    if (!b) throw new ApiError(404, 'Cetak biru tidak ditemukan.')
    if (!currentUserId) throw new ApiError(401, 'Anda harus login.')
    b.replications[input.outcome] += 1
    const total = b.replications.success + b.replications.partial + b.replications.fail
    b.stats.replications = total
    b.stats.successRate = total ? Math.round((b.replications.success / total) * 100) : 0
    // promosikan kematangan bila terbukti di lapangan
    if (b.maturity === 'curated' && b.replications.success >= 5 && b.stats.successRate >= 60) b.maturity = 'validated'
    const list = reportsByBlueprint[blueprintId] ?? (reportsByBlueprint[blueprintId] = [])
    list.unshift({
      id: Date.now(),
      user: db.pub(currentUserId),
      outcome: input.outcome,
      note: input.note,
      costReal: input.costReal,
      photoSeed: input.photoSeed,
      createdAt: new Date().toISOString(),
    })
    return { ...b }
  },

  async proposeVariant(blueprintId: number, region: string, title: string): Promise<BlueprintFull> {
    await delay(220)
    const b = blueprintsFull.find((x) => x.id === blueprintId)
    if (!b) throw new ApiError(404, 'Cetak biru tidak ditemukan.')
    b.variants.unshift({ id: Date.now(), region, title })
    return { ...b }
  },

  // ---- Tanya Pakar (Q&A) ----
  async listQuestions(blueprintId?: number | null): Promise<QnaQuestion[]> {
    await delay()
    const list = blueprintId ? questions.filter((q) => q.blueprintId === blueprintId) : questions
    return list.map((q) => ({ ...q, answers: [...q.answers] }))
  },

  async askQuestion(blueprintId: number | null, blueprintTitle: string | null, title: string, content: string): Promise<QnaQuestion> {
    await delay(300)
    if (!currentUserId) throw new ApiError(401, 'Anda harus login.')
    const q: QnaQuestion = {
      id: Date.now(),
      blueprintId,
      blueprintTitle,
      user: db.pub(currentUserId),
      title,
      content,
      solved: false,
      createdAt: new Date().toISOString(),
      answers: [],
    }
    questions.unshift(q)
    return q
  },

  async answerQuestion(questionId: number, content: string): Promise<QnaAnswer> {
    await delay(260)
    const q = questions.find((x) => x.id === questionId)
    if (!q) throw new ApiError(404, 'Pertanyaan tidak ditemukan.')
    if (!currentUserId) throw new ApiError(401, 'Anda harus login.')
    const user = db.users.find((u) => u.id === currentUserId)!
    const a: QnaAnswer = {
      id: Date.now(),
      user: db.pub(user.id),
      content,
      votes: 0,
      isBest: false,
      isExpert: user.role === 'moderator' || user.role === 'admin',
      myVote: false,
      createdAt: new Date().toISOString(),
    }
    q.answers.push(a)
    return a
  },

  async voteAnswer(questionId: number, answerId: number): Promise<void> {
    await delay(120)
    const a = questions.find((q) => q.id === questionId)?.answers.find((x) => x.id === answerId)
    if (!a) return
    a.myVote = !a.myVote
    a.votes += a.myVote ? 1 : -1
  },

  async markBestAnswer(questionId: number, answerId: number): Promise<void> {
    await delay(160)
    const q = questions.find((x) => x.id === questionId)
    if (!q) return
    q.answers.forEach((a) => (a.isBest = a.id === answerId))
    q.solved = true
  },

  async submittedBlueprints(): Promise<BlueprintSummary[]> {
    await delay()
    return blueprintsFull.filter((b) => b.status === 'submitted').map(toBlueprintSummary)
  },

  async curateBlueprint(id: number, action: 'approve' | 'reject'): Promise<void> {
    await delay(280)
    const b = blueprintsFull.find((x) => x.id === id)
    if (!b) throw new ApiError(404, 'Cetak biru tidak ditemukan.')
    if (action === 'approve') {
      b.status = 'published'
      b.maturity = 'curated'
    } else {
      b.status = 'rejected'
    }
  },

  // ---------- SIMBIOSIS INDUSTRI (Bursa, Direktori, Peta) ----------
  async listListings(filter: { kind?: ListingKind | ''; category?: ListingCategory | ''; region?: string; search?: string } = {}): Promise<WasteListing[]> {
    await delay()
    let list = [...listings]
    if (filter.kind) list = list.filter((l) => l.kind === filter.kind)
    if (filter.category) list = list.filter((l) => l.category === filter.category)
    if (filter.region) list = list.filter((l) => l.region === filter.region)
    if (filter.search) {
      const q = filter.search.toLowerCase()
      list = list.filter((l) => l.material.toLowerCase().includes(q) || l.umkmName.toLowerCase().includes(q) || l.note.toLowerCase().includes(q))
    }
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  async createListing(input: WasteListingInput): Promise<WasteListing> {
    await delay(400)
    if (!currentUserId) throw new ApiError(401, 'Anda harus login.')
    const author = db.users.find((u) => u.id === currentUserId)!
    const id = Math.max(0, ...listings.map((l) => l.id)) + 1
    const created: WasteListing = {
      id,
      kind: input.kind,
      material: input.material,
      category: input.category,
      quantity: input.quantity,
      price: input.price || null,
      region: input.region,
      umkmName: author.display_name,
      contact: author.email,
      note: input.note,
      createdAt: new Date().toISOString(),
      user: db.pub(author.id),
    }
    listings.unshift(created)
    return created
  },

  async listDirectory(filter: { region?: string; search?: string } = {}): Promise<UmkmDirectoryEntry[]> {
    await delay()
    let list = [...directory]
    if (filter.region) list = list.filter((d) => d.region === filter.region)
    if (filter.search) {
      const q = filter.search.toLowerCase()
      list = list.filter((d) => d.businessName.toLowerCase().includes(q) || d.products.some((p) => p.toLowerCase().includes(q)) || d.materials.some((m) => m.toLowerCase().includes(q)))
    }
    return list
  },

  async regionStats(): Promise<RegionStat[]> {
    await delay(160)
    return Object.entries(regionGeo).map(([region, geo]) => {
      const { x, y } = projectPct(geo.lng, geo.lat)
      return {
        region,
        listings: listings.filter((l) => l.region === region).length,
        umkm: directory.filter((d) => d.region === region).length,
        x,
        y,
      }
    })
  },

  // ---------- ASISTEN AI "Tanya COCO" (RAG ter-grounding ke repositori) ----------
  async askAssistant(question: string): Promise<AssistantReply> {
    await delay(750)
    const q = question.toLowerCase()
    const pool = blueprintsFull.filter((b) => b.status === 'published')
    const budget = parseBudget(q)

    const wasteHit = (Object.keys(WASTE) as Array<keyof typeof WASTE>).find(
      (k) => q.includes(k) || q.includes(WASTE[k].label.toLowerCase()),
    )
    let scoped = pool
    if (wasteHit) scoped = scoped.filter((b) => b.wasteKind === wasteHit)
    if (q.includes('mudah') || q.includes('pemula') || q.includes('gampang')) scoped = scoped.filter((b) => b.difficulty === 'mudah')
    if (budget != null) scoped = scoped.filter((b) => b.minCapital <= budget)
    if (!scoped.length) scoped = pool

    const order = { raw: 1, curated: 2, validated: 3, standard: 4 }
    const ranked = [...scoped]
      .sort((a, b) => order[b.maturity] - order[a.maturity] || a.minCapital - b.minCapital)
      .slice(0, 3)

    const intro =
      budget != null
        ? `Dengan modal sekitar ${formatRupiah(budget)}${wasteHit ? ' dan bahan ' + WASTE[wasteHit].label.toLowerCase() : ''}, berikut cetak biru paling sesuai & terbukti di lapangan:`
        : wasteHit
          ? `Untuk pengolahan ${WASTE[wasteHit].label.toLowerCase()}, ini rekomendasi cetak biru paling matang:`
          : 'Berikut cetak biru paling relevan dari repositori untuk pertanyaan Anda:'

    const lines = ranked.map((b, i) => {
      const eco = computeEconomics(b.economic, b.economic.batchInputKg * 5)
      return `${i + 1}. ${b.title}\n   • Modal mulai ${formatRupiah(b.minCapital)} · ${DIFFICULTY[b.difficulty].label} · Kematangan: ${MATURITY[b.maturity].label}\n   • Estimasi laba ${formatRupiah(eco.grossProfit)}/minggu (skala 5 batch), BEP ±${eco.bepBatches} batch.`
    })

    const answer = `${intro}\n\n${lines.join('\n\n')}\n\nJawaban ini disusun dari ${ranked.length} cetak biru tervalidasi di repositori COCONEXUS — buka sumber di bawah untuk langkah lengkap, parameter mutu, dan K3.`

    return {
      answer,
      sources: ranked.map(toBlueprintSummary),
      suggestions: ['Mana yang modalnya paling kecil?', wasteHit ? 'Bagaimana cara uji mutunya?' : 'Produk apa dari tempurung?', 'Tampilkan cetak biru paling mudah'],
      model: mockAi.enabled ? mockAi.model : 'repositori',
      grounded: mockAi.enabled,
    }
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
function parseBudget(q: string): number | null {
  let m = q.match(/(\d+(?:[.,]\d+)?)\s*(juta|jt)\b/)
  if (m) return Math.round(parseFloat(m[1].replace(',', '.')) * 1_000_000)
  m = q.match(/(\d+(?:[.,]\d+)?)\s*(ribu|rb)\b/)
  if (m) return Math.round(parseFloat(m[1].replace(',', '.')) * 1_000)
  m = q.match(/rp\s*([\d.]{4,})/)
  if (m) return parseInt(m[1].replace(/\./g, ''), 10) || null
  return null
}

function toBlueprintSummary(b: BlueprintFull): BlueprintSummary {
  const { summary, materials, steps, quality, safety, economic, sources, isBookmarked, replications, variants, ...rest } = b
  void summary; void materials; void steps; void quality; void safety
  void economic; void sources; void isBookmarked; void replications; void variants
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
