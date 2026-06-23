import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler, sendSuccess } from '../../lib/http.js'
import { validate } from '../../middleware/validate.js'
import { authenticate } from '../../middleware/auth.js'
import * as s from './exchange.service.js'

export const exchangeRoutes = Router()

const listingSchema = z.object({
  kind: z.enum(['surplus', 'need']),
  material: z.string().min(1).max(120),
  category: z.enum(['sabut', 'tempurung', 'air', 'ampas', 'produk']),
  quantity: z.string().min(1).max(60),
  price: z.string().max(60).optional(),
  region: z.string().min(1).max(80),
  note: z.string().max(500).optional(),
})

exchangeRoutes.get('/listings', asyncHandler(async (req, res) => sendSuccess(res, await s.listListings({ kind: req.query.kind as string, category: req.query.category as string, region: req.query.region as string, search: req.query.search as string }))))
exchangeRoutes.post('/listings', authenticate, validate({ body: listingSchema }), asyncHandler(async (req, res) => sendSuccess(res, await s.createListing(req.user!.id, req.body), undefined, 201)))
exchangeRoutes.get('/directory', asyncHandler(async (req, res) => sendSuccess(res, await s.listDirectory({ region: req.query.region as string, search: req.query.search as string }))))
exchangeRoutes.get('/regions', asyncHandler(async (_req, res) => sendSuccess(res, await s.regionStats())))
