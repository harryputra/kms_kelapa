import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../prisma.js'
import { asyncHandler, sendSuccess } from '../../lib/http.js'
import { validate } from '../../middleware/validate.js'
import { authenticate, requireRole } from '../../middleware/auth.js'

export const templateRoutes = Router()
const mod = [authenticate, requireRole('moderator', 'admin')]
const tplSchema = z.object({ name: z.string().min(1).max(120), content: z.string().min(1) })

const map = (t: { id: number; name: string; content: string; createdAt: Date }) => ({ id: t.id, name: t.name, content: t.content, created_at: t.createdAt.toISOString() })

templateRoutes.get('/', asyncHandler(async (_req, res) => sendSuccess(res, (await prisma.contentTemplate.findMany({ orderBy: { id: 'desc' } })).map(map))))
templateRoutes.post('/', ...mod, validate({ body: tplSchema }), asyncHandler(async (req, res) => sendSuccess(res, map(await prisma.contentTemplate.create({ data: req.body })), undefined, 201)))
templateRoutes.put('/:id', ...mod, validate({ body: tplSchema }), asyncHandler(async (req, res) => sendSuccess(res, map(await prisma.contentTemplate.update({ where: { id: Number(req.params.id) }, data: req.body })))))
templateRoutes.delete('/:id', ...mod, asyncHandler(async (req, res) => { await prisma.contentTemplate.delete({ where: { id: Number(req.params.id) } }); sendSuccess(res, { message: 'ok' }) }))
