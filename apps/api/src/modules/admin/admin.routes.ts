import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler, sendSuccess } from '../../lib/http.js'
import { validate } from '../../middleware/validate.js'
import { authenticate, requireRole } from '../../middleware/auth.js'
import * as s from './admin.service.js'
import * as ai from '../ai/ai.settings.js'
import { testConnection } from '../assistant/assistant.service.js'

export const adminRoutes = Router()
adminRoutes.use(authenticate, requireRole('admin'))

const roleSchema = z.object({ role: z.enum(['guest', 'user', 'moderator', 'admin']) })

const aiSchema = z.object({
  enabled: z.boolean().optional(),
  provider: z.enum(['openai', 'anthropic']).optional(),
  base_url: z.string().url().max(300).optional(),
  model: z.string().max(120).optional(),
  api_key: z.string().max(400).nullable().optional(),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().int().min(64).max(8000).optional(),
  top_k: z.number().int().min(1).max(8).optional(),
  system_prompt: z.string().max(4000).optional(),
})

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

// Konfigurasi Asisten AI (model & provider — berbayar atau self-hosted)
adminRoutes.get('/ai-settings', asyncHandler(async (_req, res) => sendSuccess(res, await ai.getAiSettings())))
adminRoutes.put('/ai-settings', validate({ body: aiSchema }), asyncHandler(async (req, res) => sendSuccess(res, await ai.updateAiSettings(req.body))))
adminRoutes.post('/ai-settings/test', asyncHandler(async (_req, res) => {
  try {
    sendSuccess(res, await testConnection())
  } catch (e) {
    sendSuccess(res, { ok: false, message: (e as Error)?.message ?? 'Gagal menguji koneksi.' })
  }
}))
