import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../../lib/http.js'
import { validate } from '../../middleware/validate.js'
import { authenticate, optionalAuth } from '../../middleware/auth.js'
import * as ctrl from './article.controller.js'

export const articleRoutes = Router()

const submitSchema = z.object({ title: z.string().min(5).max(160), content: z.string().min(20), category: z.string().optional(), tags: z.array(z.string()).max(8).optional() })
const voteSchema = z.object({ vote_type: z.enum(['like', 'dislike']) })
const commentSchema = z.object({ content: z.string().min(1).max(2000), parent_id: z.coerce.number().int().positive().nullable().optional() })
const reportSchema = z.object({ reason: z.enum(['spam', 'inappropriate', 'misinformation', 'other']), description: z.string().max(500).optional() })

articleRoutes.get('/mine', authenticate, asyncHandler(ctrl.mine))
articleRoutes.get('/bookmarks', authenticate, asyncHandler(ctrl.bookmarks))
articleRoutes.get('/', asyncHandler(ctrl.list))
articleRoutes.post('/', authenticate, validate({ body: submitSchema }), asyncHandler(ctrl.submit))
articleRoutes.get('/:id', optionalAuth, asyncHandler(ctrl.detail))
articleRoutes.post('/:id/vote', authenticate, validate({ body: voteSchema }), asyncHandler(ctrl.vote))
articleRoutes.post('/:id/bookmark', authenticate, asyncHandler(ctrl.bookmark))
articleRoutes.post('/:id/report', authenticate, validate({ body: reportSchema }), asyncHandler(ctrl.report))
articleRoutes.get('/:id/comments', asyncHandler(ctrl.comments))
articleRoutes.post('/:id/comments', authenticate, validate({ body: commentSchema }), asyncHandler(ctrl.addComment))
