// Klien API NYATA — memanggil backend Express via axios (http).
// Endpoint yang BELUM tersedia di backend otomatis memakai mock (lewat spread),
// sehingga migrasi mock → nyata bisa bertahap per-modul.
import { http, normalizeError, setAccessToken } from './http'
import { ApiError, mockApi } from './mock'
import type {
  AuthResult, BlueprintCreateInput, BlueprintFacets, BlueprintFull, BlueprintSummary,
  Category, QnaAnswer, QnaQuestion, ReplicationInput, ReplicationReport, UserProfileDetail, ValueNode,
} from '@/types'

/* eslint-disable @typescript-eslint/no-explicit-any */
// Unwrap envelope {data} + normalisasi error axios → ApiError (pesan ramah ID).
// Return any: signature publik tetap dijaga ketat oleh `realApi: typeof mockApi`.
async function req<T = any>(p: Promise<any>): Promise<T> {
  try {
    return (await p).data.data
  } catch (e) {
    const n = normalizeError(e)
    throw new ApiError(n.status ?? 500, n.message)
  }
}

// Untuk endpoint berpaginasi (mengembalikan {data, meta}).
async function reqPaged(p: Promise<any>): Promise<any> {
  try {
    const r = await p
    return { data: r.data.data, meta: r.data.meta }
  } catch (e) {
    const n = normalizeError(e)
    throw new ApiError(n.status ?? 500, n.message)
  }
}

function clean(o: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== '' && v != null))
}

export const realApi: typeof mockApi = {
  ...mockApi, // fallback: artikel, forum, notifikasi, bursa, direktori, admin, asisten

  // ---------- AUTH (sesi via JWT + refresh cookie) ----------
  setSession() {
    /* no-op: sesi dikelola server (access token memori + refresh cookie) */
  },
  async login(email, password) {
    const r = await req<AuthResult>(http.post('/auth/login', { email, password }))
    setAccessToken(r.access_token)
    return r
  },
  async register(email, password, display_name) {
    return req<{ message: string }>(http.post('/auth/register', { email, password, display_name }))
  },
  async me() {
    try {
      return await req<UserProfileDetail>(http.get('/auth/me'))
    } catch {
      return null
    }
  },
  async logout() {
    try {
      await http.post('/auth/logout')
    } catch {
      /* abaikan */
    }
    setAccessToken(null)
  },

  // ---------- CETAK BIRU ----------
  async listBlueprints(f: BlueprintFacets = {}) {
    return req<BlueprintSummary[]>(http.get('/blueprints', { params: clean(f as Record<string, unknown>) }))
  },
  async getBlueprint(id) {
    return req<BlueprintFull>(http.get(`/blueprints/${id}`))
  },
  async valueTree() {
    return req<ValueNode[]>(http.get('/value-tree'))
  },
  async myBlueprints() {
    return req<BlueprintSummary[]>(http.get('/blueprints/mine'))
  },
  async myBlueprintBookmarks() {
    return req<BlueprintSummary[]>(http.get('/blueprints/bookmarked'))
  },
  async submitBlueprint(input: BlueprintCreateInput) {
    return req<BlueprintFull>(http.post('/blueprints', input))
  },
  async toggleBlueprintBookmark(id) {
    return req<{ bookmarked: boolean }>(http.post(`/blueprints/${id}/bookmark`))
  },
  async getReplications(id) {
    return req<ReplicationReport[]>(http.get(`/blueprints/${id}/replications`))
  },
  async addReplicationReport(id, input: ReplicationInput) {
    return req<BlueprintFull>(http.post(`/blueprints/${id}/replications`, input))
  },
  async proposeVariant(id, region, title) {
    return req<BlueprintFull>(http.post(`/blueprints/${id}/variants`, { region, title }))
  },
  async submittedBlueprints() {
    return req<BlueprintSummary[]>(http.get('/blueprints/submitted'))
  },
  async curateBlueprint(id, action) {
    await http.put(`/blueprints/${id}/curate`, { action })
  },
  async categories() {
    return req<Category[]>(http.get('/categories'))
  },

  // ---------- TANYA PAKAR (Q&A) ----------
  async listQuestions(blueprintId) {
    return req<QnaQuestion[]>(http.get('/qna', { params: blueprintId ? { blueprintId } : {} }))
  },
  async askQuestion(blueprintId, blueprintTitle, title, content) {
    return req<QnaQuestion>(http.post('/qna', { blueprintId, blueprintTitle, title, content }))
  },
  async answerQuestion(questionId, content): Promise<QnaAnswer> {
    const q = await req<QnaQuestion>(http.post(`/qna/${questionId}/answers`, { content }))
    return q.answers.reduce((a, b) => (b.id > a.id ? b : a))
  },
  async voteAnswer(_questionId, answerId) {
    await http.post(`/qna/answers/${answerId}/vote`)
  },
  async markBestAnswer(_questionId, answerId) {
    await http.post(`/qna/answers/${answerId}/best`)
  },

  // ---------- WAWASAN / ARTIKEL ----------
  async listPublished(params = {}) {
    return reqPaged(http.get('/articles', { params: clean(params as Record<string, unknown>) }))
  },
  async getArticle(id, _isAuthenticated) {
    return req(http.get(`/articles/${id}`))
  },
  async myArticles() {
    return req(http.get('/articles/mine'))
  },
  async submitArticle(input) {
    return req(http.post('/articles', input))
  },
  async vote(id, type) {
    return req(http.post(`/articles/${id}/vote`, { vote_type: type }))
  },
  async toggleBookmark(id) {
    return req(http.post(`/articles/${id}/bookmark`))
  },
  async myBookmarks() {
    return req(http.get('/articles/bookmarks'))
  },
  async report(entityType, entityId, reason, description) {
    if (entityType === 'article') return req(http.post(`/articles/${entityId}/report`, { reason, description }))
    return { message: 'Laporan terkirim.' }
  },
  async getComments(articleId) {
    return req(http.get(`/articles/${articleId}/comments`))
  },
  async addComment(articleId, content, parentId) {
    return req(http.post(`/articles/${articleId}/comments`, { content, parent_id: parentId }))
  },

  // ---------- TEMPLATE & KATEGORI ----------
  async templates() {
    return req(http.get('/templates'))
  },

  // ---------- NOTIFIKASI ----------
  async notifications() {
    return req(http.get('/notifications'))
  },
  async markRead(id) {
    await http.put(`/notifications/${id}/read`)
  },
  async markAllRead() {
    await http.put('/notifications/read-all')
  },

  // ---------- FORUM ----------
  async forumTopics() {
    return req(http.get('/forum/topics'))
  },
  async forumTopic(id) {
    return req(http.get(`/forum/topics/${id}`))
  },
  async addReply(topicId, content) {
    return req(http.post(`/forum/topics/${topicId}/replies`, { content }))
  },

  // ---------- MODERATOR ----------
  async reviewQueue() {
    return req(http.get('/moderator/review-queue'))
  },
  async reviewArticle(id, action, notes) {
    await http.put(`/moderator/articles/${id}/review`, { action, review_notes: notes })
  },
  async pendingComments() {
    return req(http.get('/moderator/comments'))
  },
  async moderateComment(id, status) {
    await http.put(`/moderator/comments/${id}/moderate`, { status })
  },
  async reports() {
    return req(http.get('/moderator/reports'))
  },
  async resolveReport(id, resolution) {
    await http.put(`/moderator/reports/${id}/resolve`, { resolution })
  },

  // ---------- ADMIN ----------
  async adminUsers() {
    return req(http.get('/admin/users'))
  },
  async changeRole(id, role) {
    await http.put(`/admin/users/${id}/role`, { role })
  },
  async toggleSuspend(id) {
    await http.put(`/admin/users/${id}/suspend`)
  },
  async getSettings() {
    return req(http.get('/settings'))
  },
  async updateSettings(patch) {
    return req(http.put('/admin/settings', patch))
  },
  async menu() {
    return req(http.get('/admin/menu'))
  },
  async saveMenu(items) {
    await http.put('/admin/menu', { items })
  },
  async recycleBin() {
    return req(http.get('/admin/recycle-bin'))
  },
  async restore(id) {
    await http.put(`/admin/recycle-bin/restore/${id}`)
  },
  async auditLogs() {
    return req(http.get('/admin/audit-logs'))
  },
  async stats() {
    return req(http.get('/admin/stats'))
  },
  async getAiSettings() {
    return req(http.get('/admin/ai-settings'))
  },
  async updateAiSettings(patch) {
    return req(http.put('/admin/ai-settings', patch))
  },
  async testAiConnection() {
    return req(http.post('/admin/ai-settings/test'))
  },

  // ---------- SIMBIOSIS ----------
  async listListings(filter = {}) {
    return req(http.get('/exchange/listings', { params: clean(filter as Record<string, unknown>) }))
  },
  async createListing(input) {
    return req(http.post('/exchange/listings', input))
  },
  async listDirectory(filter = {}) {
    return req(http.get('/exchange/directory', { params: clean(filter as Record<string, unknown>) }))
  },
  async regionStats() {
    return req(http.get('/exchange/regions'))
  },

  // ---------- ASISTEN AI ----------
  async askAssistant(question) {
    return req(http.post('/assistant/ask', { question }))
  },
}
