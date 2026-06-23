import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler, sendSuccess } from '../../lib/http.js'
import { validate } from '../../middleware/validate.js'
import { authenticate, requireRole } from '../../middleware/auth.js'
import * as s from './moderator.service.js'

export const moderatorRoutes = Router()
moderatorRoutes.use(authenticate, requireRole('moderator', 'admin'))

const reviewSchema = z.object({ action: z.enum(['approve', 'reject', 'revision']), review_notes: z.string().optional() })
const moderateSchema = z.object({ status: z.enum(['approved', 'rejected']) })
const resolveSchema = z.object({ resolution: z.enum(['ignore', 'delete']).default('ignore') })

moderatorRoutes.get('/review-queue', asyncHandler(async (_req, res) => sendSuccess(res, await s.reviewQueue())))
moderatorRoutes.put('/articles/:id/review', validate({ body: reviewSchema }), asyncHandler(async (req, res) => { await s.reviewArticle(Number(req.params.id), req.body.action, req.body.review_notes); sendSuccess(res, { message: 'ok' }) }))
moderatorRoutes.get('/comments', asyncHandler(async (_req, res) => sendSuccess(res, await s.pendingComments())))
moderatorRoutes.put('/comments/:id/moderate', validate({ body: moderateSchema }), asyncHandler(async (req, res) => { await s.moderateComment(Number(req.params.id), req.body.status); sendSuccess(res, { message: 'ok' }) }))
moderatorRoutes.get('/reports', asyncHandler(async (_req, res) => sendSuccess(res, await s.reports())))
moderatorRoutes.put('/reports/:id/resolve', validate({ body: resolveSchema }), asyncHandler(async (req, res) => { await s.resolveReport(Number(req.params.id), req.body.resolution); sendSuccess(res, { message: 'ok' }) }))
