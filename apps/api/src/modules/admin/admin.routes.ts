import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler, sendSuccess } from '../../lib/http.js'
import { validate } from '../../middleware/validate.js'
import { authenticate, requireRole } from '../../middleware/auth.js'
import * as s from './admin.service.js'

export const adminRoutes = Router()
adminRoutes.use(authenticate, requireRole('admin'))

const roleSchema = z.object({ role: z.enum(['guest', 'user', 'moderator', 'admin']) })

adminRoutes.get('/users', asyncHandler(async (_req, res) => sendSuccess(res, await s.users())))
adminRoutes.put('/users/:id/role', validate({ body: roleSchema }), asyncHandler(async (req, res) => { await s.changeRole(Number(req.params.id), req.body.role); sendSuccess(res, { message: 'ok' }) }))
adminRoutes.put('/users/:id/suspend', asyncHandler(async (req, res) => { await s.toggleSuspend(Number(req.params.id)); sendSuccess(res, { message: 'ok' }) }))
adminRoutes.put('/settings', asyncHandler(async (req, res) => sendSuccess(res, await s.updateSettings(req.body))))
adminRoutes.get('/menu', asyncHandler(async (_req, res) => sendSuccess(res, await s.menu())))
adminRoutes.put('/menu', asyncHandler(async (req, res) => sendSuccess(res, await s.saveMenu(req.body.items ?? req.body))))
adminRoutes.get('/recycle-bin', asyncHandler(async (req, res) => sendSuccess(res, await s.recycleBin(req.query.type as string | undefined))))
adminRoutes.put('/recycle-bin/restore/:id', asyncHandler(async (req, res) => { await s.restore(Number(req.params.id)); sendSuccess(res, { message: 'ok' }) }))
adminRoutes.get('/audit-logs', asyncHandler(async (_req, res) => sendSuccess(res, await s.auditLogs())))
adminRoutes.get('/stats', asyncHandler(async (_req, res) => sendSuccess(res, await s.stats())))
