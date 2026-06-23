import type { NextFunction, Request, Response } from 'express'
import type { ZodTypeAny } from 'zod'

interface Schemas {
  body?: ZodTypeAny
  query?: ZodTypeAny
  params?: ZodTypeAny
}

// Validasi & koersi input; hasil parse ditaruh kembali ke req.* (ZodError → 422 via errorHandler).
export function validate(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.params) req.params = schemas.params.parse(req.params)
      if (schemas.query) Object.assign(req.query, schemas.query.parse(req.query))
      if (schemas.body) req.body = schemas.body.parse(req.body)
      next()
    } catch (e) {
      next(e)
    }
  }
}
