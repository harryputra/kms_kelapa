import { Router } from 'express'
import { prisma } from './prisma.js'
import { asyncHandler, sendSuccess } from './lib/http.js'
import { authRoutes } from './modules/auth/auth.routes.js'
import { blueprintRoutes } from './modules/blueprints/blueprint.routes.js'
import { valueTree } from './modules/blueprints/blueprint.controller.js'
import { qnaRoutes } from './modules/qna/qna.routes.js'
import { articleRoutes } from './modules/articles/article.routes.js'
import { templateRoutes } from './modules/templates/template.routes.js'
import { notificationRoutes } from './modules/notifications/notification.routes.js'
import { forumRoutes } from './modules/forum/forum.routes.js'
import { moderatorRoutes } from './modules/moderator/moderator.routes.js'
import { adminRoutes } from './modules/admin/admin.routes.js'
import { exchangeRoutes } from './modules/exchange/exchange.routes.js'
import * as settings from './modules/admin/admin.service.js'
import * as assistant from './modules/assistant/assistant.service.js'

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
    const cats = await prisma.category.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { articles: true } } } })
    sendSuccess(res, cats.map((c) => ({ id: c.id, name: c.name, slug: c.slug, description: c.description ?? '', articles_count: c._count.articles })))
  }),
)

// Pengaturan situs (publik: hanya info non-sensitif)
apiRouter.get('/settings', asyncHandler(async (_req, res) => sendSuccess(res, await settings.getSettings())))

// Asisten AI (grounded ke repositori)
apiRouter.post('/assistant/ask', asyncHandler(async (req, res) => sendSuccess(res, await assistant.ask(req.body?.question ?? ''))))

apiRouter.use('/auth', authRoutes)
apiRouter.use('/blueprints', blueprintRoutes)
apiRouter.use('/qna', qnaRoutes)
apiRouter.use('/articles', articleRoutes)
apiRouter.use('/templates', templateRoutes)
apiRouter.use('/notifications', notificationRoutes)
apiRouter.use('/forum', forumRoutes)
apiRouter.use('/moderator', moderatorRoutes)
apiRouter.use('/admin', adminRoutes)
apiRouter.use('/exchange', exchangeRoutes)
apiRouter.get('/value-tree', asyncHandler(valueTree))
