// Klien HTTP nyata (axios). Dipakai saat VITE_USE_MOCK=false (backend tersedia).
// PENTING: base URL relatif same-origin — JANGAN hardcode http://localhost:PORT.
import axios, { AxiosError } from 'axios'

export const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export const http = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // kirim cookie refresh (HttpOnly)
  headers: { 'Content-Type': 'application/json' },
})

let accessToken: string | null = null
export function setAccessToken(token: string | null) {
  accessToken = token
}

http.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

// Auto-refresh: pada 401, coba tukar refresh-cookie → access token baru, ulangi sekali.
let refreshing: Promise<string | null> | null = null
function doRefresh(): Promise<string | null> {
  if (!refreshing) {
    refreshing = http
      .post('/auth/refresh')
      .then((r) => {
        const t = r.data?.data?.access_token as string | undefined
        setAccessToken(t ?? null)
        return t ?? null
      })
      .catch(() => {
        setAccessToken(null)
        return null
      })
      .finally(() => {
        refreshing = null
      })
  }
  return refreshing
}

http.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config
    const url: string = original?.url ?? ''
    if (error.response?.status === 401 && original && !original._retry && !url.includes('/auth/')) {
      original._retry = true
      const token = await doRefresh()
      if (token) {
        original.headers.Authorization = `Bearer ${token}`
        return http(original)
      }
    }
    return Promise.reject(error)
  },
)

// Bedakan error JARINGAN ("tidak bisa menghubungi server") vs error HTTP (401/500).
export interface NormalizedError {
  status: number | null
  message: string
  isNetwork: boolean
}

export function normalizeError(err: unknown): NormalizedError {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<{ error?: { message?: string }; message?: string }>
    if (!ax.response) {
      return { status: null, message: 'Tidak dapat menghubungi server. Periksa koneksi Anda.', isNetwork: true }
    }
    const data = ax.response.data
    const message = data?.error?.message ?? data?.message ?? defaultMessage(ax.response.status)
    return { status: ax.response.status, message, isNetwork: false }
  }
  return { status: null, message: (err as Error)?.message ?? 'Terjadi kesalahan tak terduga.', isNetwork: false }
}

function defaultMessage(status: number): string {
  switch (status) {
    case 400:
    case 422:
      return 'Input tidak valid.'
    case 401:
      return 'Sesi Anda berakhir. Silakan login kembali.'
    case 403:
      return 'Anda tidak memiliki akses untuk tindakan ini.'
    case 404:
      return 'Data tidak ditemukan.'
    case 409:
      return 'Terjadi konflik data.'
    case 429:
      return 'Terlalu banyak permintaan. Coba lagi sebentar.'
    default:
      return 'Terjadi kesalahan pada server. Coba beberapa saat lagi.'
  }
}
