import { Router } from 'express'
import { asyncHandler } from '../../lib/http.js'
import { validate } from '../../middleware/validate.js'
import { idParamSchema, listQuerySchema } from './blueprint.schema.js'
import * as ctrl from './blueprint.controller.js'

export const blueprintRoutes = Router()

blueprintRoutes.get('/', validate({ query: listQuerySchema }), asyncHandler(ctrl.list))
blueprintRoutes.get('/:id', validate({ params: idParamSchema }), asyncHandler(ctrl.detail))
