import type { NextFunction, Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'
import { ApiError } from '../lib/http.js'
import { isProd } from '../env.js'

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound('Endpoint tidak ditemukan.'))
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // Validasi zod → 422
  if (err instanceof ZodError) {
    return res.status(422).json({
      error: { code: 'VALIDATION_ERROR', message: 'Input tidak valid.', details: err.issues.map((i) => `${i.path.join('.')}: ${i.message}`) },
    })
  }
  // Prisma unique constraint → 409
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    return res.status(409).json({ error: { code: 'CONFLICT', message: 'Data sudah ada (duplikat).' } })
  }
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } })
  }
  // Tak terduga → 500 (jangan bocorkan detail di produksi)
  console.error('Unhandled error:', err)
  return res.status(500).json({
    error: { code: 'INTERNAL', message: 'Terjadi kesalahan pada server.', ...(isProd ? {} : { detail: String(err) }) },
  })
}
