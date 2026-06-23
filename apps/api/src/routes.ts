import { Router } from 'express'
import { prisma } from './prisma.js'
import { asyncHandler, sendSuccess } from './lib/http.js'
import { authRoutes } from './modules/auth/auth.routes.js'
import { blueprintRoutes } from './modules/blueprints/blueprint.routes.js'
import { valueTree } from './modules/blueprints/blueprint.controller.js'
import { qnaRoutes } from './modules/qna/qna.routes.js'

export const apiRouter = Router()

apiRouter.get(
  '/health',
  asyncHandler(async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`
    sendSuccess(res, { status: 'ok', uptime: Math.round(process.uptime()) })
  }),
)

apiRouter.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const cats = await prisma.category.findMany({ orderBy: { name: 'asc' } })
    sendSuccess(res, cats.map((c) => ({ id: c.id, name: c.name, slug: c.slug, description: c.description ?? '', articles_count: 0 })))
  }),
)

apiRouter.use('/auth', authRoutes)
apiRouter.use('/blueprints', blueprintRoutes)
apiRouter.use('/qna', qnaRoutes)
apiRouter.get('/value-tree', asyncHandler(valueTree))
