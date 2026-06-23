// Facade API tunggal yang dipakai seluruh store/komponen.
//
// VITE_USE_MOCK=true (default)  → mock in-memory (demo tanpa backend).
// VITE_USE_MOCK=false           → backend nyata via http; endpoint yang belum
//                                 diimplementasikan otomatis fallback ke mock.
import { mockApi } from './mock'
import { realApi } from './real'

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export const api = USE_MOCK ? mockApi : realApi

export { ApiError } from './mock'
export { normalizeError, setAccessToken } from './http'
export type Api = typeof mockApi
