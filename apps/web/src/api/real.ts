// Klien API NYATA — memanggil backend Express via axios (http).
// Endpoint yang BELUM tersedia di backend otomatis memakai mock (lewat spread),
// sehingga migrasi mock → nyata bisa bertahap per-modul.
import { http, normalizeError, setAccessToken } from './http'
import { ApiError, mockApi } from './mock'
import type {
  AuthResult, BlueprintCreateInput, BlueprintFacets, BlueprintFull, BlueprintSummary,
  Category, QnaAnswer, QnaQuestion, ReplicationInput, ReplicationReport, UserProfileDetail, ValueNode,
} from '@/types'

// Unwrap envelope {data} + normalisasi error axios → ApiError (pesan ramah ID).
async function req<T>(p: Promise<{ data: { data: T } }>): Promise<T> {
  try {
    return (await p).data.data
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
}
