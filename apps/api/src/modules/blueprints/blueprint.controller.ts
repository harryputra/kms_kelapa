import type { Request, Response } from 'express'
import { sendSuccess } from '../../lib/http.js'
import * as service from './blueprint.service.js'
import type { ListQuery } from './blueprint.schema.js'

export async function list(req: Request, res: Response) {
  const data = await service.listPublished(req.query as unknown as ListQuery)
  sendSuccess(res, data)
}

export async function detail(req: Request, res: Response) {
  const data = await service.getById(Number(req.params.id))
  sendSuccess(res, data)
}

export async function valueTree(_req: Request, res: Response) {
  sendSuccess(res, await service.valueTree())
}
