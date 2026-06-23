import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler, sendSuccess } from '../../lib/http.js'
import { validate } from '../../middleware/validate.js'
import { authenticate, requireRole } from '../../middleware/auth.js'
import * as s from './forum.service.js'

export const forumRoutes = Router()

const topicSchema = z.object({ title: z.string().min(5).max(160), content: z.string().min(10), category: z.string().optional() })
const replySchema = z.object({ content: z.string().min(1).max(2000) })
const mod = [authenticate, requireRole('moderator', 'admin')]

forumRoutes.get('/topics', asyncHandler(async (_req, res) => sendSuccess(res, await s.topics())))
forumRoutes.post('/topics', authenticate, validate({ body: topicSchema }), asyncHandler(async (req, res) => sendSuccess(res, await s.create(req.user!.id, req.body), undefined, 201)))
forumRoutes.get('/topics/:id', asyncHandler(async (req, res) => sendSuccess(res, await s.topic(Number(req.params.id)))))
forumRoutes.post('/topics/:id/replies', authenticate, validate({ body: replySchema }), asyncHandler(async (req, res) => sendSuccess(res, await s.addReply(req.user!.id, Number(req.params.id), req.body.content), undefined, 201)))
forumRoutes.put('/topics/:id/pin', ...mod, asyncHandler(async (req, res) => { await s.setPin(Number(req.params.id), req.body.pinned !== false); sendSuccess(res, { message: 'ok' }) }))
forumRoutes.put('/topics/:id/lock', ...mod, asyncHandler(async (req, res) => { await s.setLock(Number(req.params.id), req.body.locked !== false); sendSuccess(res, { message: 'ok' }) }))
