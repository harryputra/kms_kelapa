import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../lib/http.js'
import { verifyAccessToken } from '../lib/jwt.js'

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return next(ApiError.unauthorized('Token tidak ditemukan.'))
  try {
    const payload = verifyAccessToken(header.slice(7))
    req.user = { id: payload.sub, role: payload.role }
    next()
  } catch {
    next(new ApiError(401, 'UNAUTHORIZED', 'Sesi Anda berakhir. Silakan login kembali.'))
  }
}

// Autentikasi opsional — set req.user bila token valid, tapi tidak menolak bila tidak ada.
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    try {
      const payload = verifyAccessToken(header.slice(7))
      req.user = { id: payload.sub, role: payload.role }
    } catch {
      /* abaikan token tidak valid pada rute publik */
    }
  }
  next()
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized())
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden())
    next()
  }
}
