import { Router } from 'express'
import { asyncHandler } from '../../lib/http.js'
import { validate } from '../../middleware/validate.js'
import { authenticate, optionalAuth } from '../../middleware/auth.js'
import { answerSchema, askSchema, idParamSchema, listQnaQuerySchema } from './qna.schema.js'
import * as ctrl from './qna.controller.js'

export const qnaRoutes = Router()

qnaRoutes.get('/', optionalAuth, validate({ query: listQnaQuerySchema }), asyncHandler(ctrl.list))
qnaRoutes.post('/', authenticate, validate({ body: askSchema }), asyncHandler(ctrl.ask))
qnaRoutes.post('/:id/answers', authenticate, validate({ params: idParamSchema, body: answerSchema }), asyncHandler(ctrl.answer))
qnaRoutes.post('/answers/:id/vote', authenticate, validate({ params: idParamSchema }), asyncHandler(ctrl.vote))
qnaRoutes.post('/answers/:id/best', authenticate, validate({ params: idParamSchema }), asyncHandler(ctrl.markBest))
