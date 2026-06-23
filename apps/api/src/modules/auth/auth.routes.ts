import { Router } from 'express'
import { asyncHandler } from '../../lib/http.js'
import { validate } from '../../middleware/validate.js'
import { authenticate } from '../../middleware/auth.js'
import { authLimiter } from '../../middleware/rateLimit.js'
import { loginSchema, registerSchema } from './auth.schema.js'
import * as ctrl from './auth.controller.js'

export const authRoutes = Router()

authRoutes.post('/register', authLimiter, validate({ body: registerSchema }), asyncHandler(ctrl.register))
authRoutes.post('/login', authLimiter, validate({ body: loginSchema }), asyncHandler(ctrl.login))
authRoutes.post('/refresh', asyncHandler(ctrl.refresh))
authRoutes.post('/logout', asyncHandler(ctrl.logout))
authRoutes.get('/me', authenticate, asyncHandler(ctrl.me))
