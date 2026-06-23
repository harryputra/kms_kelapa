import { Router } from 'express'
import { asyncHandler, sendSuccess } from '../../lib/http.js'
import { authenticate } from '../../middleware/auth.js'
import * as s from './notification.service.js'

export const notificationRoutes = Router()

notificationRoutes.use(authenticate)
notificationRoutes.get('/', asyncHandler(async (req, res) => sendSuccess(res, await s.list(req.user!.id))))
notificationRoutes.put('/read-all', asyncHandler(async (req, res) => { await s.markAllRead(req.user!.id); sendSuccess(res, { message: 'ok' }) }))
notificationRoutes.put('/:id/read', asyncHandler(async (req, res) => { await s.markRead(req.user!.id, Number(req.params.id)); sendSuccess(res, { message: 'ok' }) }))
