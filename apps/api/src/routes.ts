import { Router } from 'express'
import { prisma } from './prisma.js'
import { asyncHandler, sendSuccess } from './lib/http.js'
import { authRoutes } from './modules/auth/auth.routes.js'
import { blueprintRoutes } from './modules/blueprints/blueprint.routes.js'
import { valueTree } from './modules/blueprints/blueprint.controller.js'

export const apiRouter = Router()

apiRouter.get(
  '/health',
  asyncHandler(async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`
    sendSuccess(res, { status: 'ok', uptime: Math.round(process.uptime()) })
  }),
)

apiRouter.use('/auth', authRoutes)
apiRouter.use('/blueprints', blueprintRoutes)
apiRouter.get('/value-tree', asyncHandler(valueTree))
