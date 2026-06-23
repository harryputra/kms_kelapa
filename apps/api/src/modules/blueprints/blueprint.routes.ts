import { Router } from 'express'
import { asyncHandler } from '../../lib/http.js'
import { validate } from '../../middleware/validate.js'
import { authenticate, optionalAuth, requireRole } from '../../middleware/auth.js'
import { curateSchema, idParamSchema, listQuerySchema, replicationSchema, submitSchema, variantSchema } from './blueprint.schema.js'
import * as ctrl from './blueprint.controller.js'

export const blueprintRoutes = Router()

// Rute spesifik HARUS sebelum '/:id'
blueprintRoutes.get('/mine', authenticate, asyncHandler(ctrl.mine))
blueprintRoutes.get('/bookmarked', authenticate, asyncHandler(ctrl.bookmarked))
blueprintRoutes.get('/submitted', authenticate, requireRole('moderator', 'admin'), asyncHandler(ctrl.submitted))

blueprintRoutes.get('/', validate({ query: listQuerySchema }), asyncHandler(ctrl.list))
blueprintRoutes.post('/', authenticate, validate({ body: submitSchema }), asyncHandler(ctrl.submit))

blueprintRoutes.get('/:id', validate({ params: idParamSchema }), optionalAuth, asyncHandler(ctrl.detail))
blueprintRoutes.post('/:id/bookmark', authenticate, validate({ params: idParamSchema }), asyncHandler(ctrl.toggleBookmark))
blueprintRoutes.get('/:id/replications', validate({ params: idParamSchema }), asyncHandler(ctrl.replications))
blueprintRoutes.post('/:id/replications', authenticate, validate({ params: idParamSchema, body: replicationSchema }), asyncHandler(ctrl.addReplication))
blueprintRoutes.post('/:id/variants', authenticate, validate({ params: idParamSchema, body: variantSchema }), asyncHandler(ctrl.proposeVariant))
blueprintRoutes.put('/:id/curate', authenticate, requireRole('moderator', 'admin'), validate({ params: idParamSchema, body: curateSchema }), asyncHandler(ctrl.curate))
