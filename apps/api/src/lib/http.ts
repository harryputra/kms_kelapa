import type { NextFunction, Request, Response } from 'express'

// Error domain dengan kode & status HTTP — ditangani errorHandler terpusat.
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message)
  }
  static badRequest(msg: string, details?: unknown) { return new ApiError(400, 'BAD_REQUEST', msg, details) }
  static unauthorized(msg = 'Tidak terautentikasi.') { return new ApiError(401, 'UNAUTHORIZED', msg) }
  static forbidden(msg = 'Anda tidak memiliki akses.') { return new ApiError(403, 'FORBIDDEN', msg) }
  static notFound(msg = 'Tidak ditemukan.') { return new ApiError(404, 'NOT_FOUND', msg) }
  static conflict(msg: string) { return new ApiError(409, 'CONFLICT', msg) }
}

export interface PaginationMeta {
  current_page: number
  per_page: number
  total_items: number
  total_pages: number
}

export function sendSuccess<T>(res: Response, data: T, meta?: PaginationMeta, status = 200) {
  res.status(status).json(meta ? { data, meta } : { data })
}

// Bungkus handler async agar error diteruskan ke errorHandler.
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction) => Promise.resolve(fn(req, res, next)).catch(next)
}

export function paginate(page = 1, limit = 20) {
  const p = Math.max(1, page)
  const l = Math.min(100, Math.max(1, limit))
  return { skip: (p - 1) * l, take: l, page: p, limit: l }
}
