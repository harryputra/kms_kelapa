// Facade API tunggal yang dipakai seluruh store/komponen.
//
// Saat ini default ke MOCK in-memory (VITE_USE_MOCK !== 'false') agar frontend
// bisa berjalan & didemokan TANPA backend. Ketika backend Express siap:
//   1) set VITE_USE_MOCK=false,
//   2) implementasikan `realApi` (memakai `http` dari ./http) dengan signature
//      yang sama seperti `mockApi`, lalu pilih di bawah.
// Struktur ini menjaga komponen tidak perlu berubah saat migrasi mock → nyata.
import { mockApi } from './mock'

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export const api = mockApi

export { ApiError } from './mock'
export { normalizeError, setAccessToken } from './http'
export type Api = typeof mockApi
