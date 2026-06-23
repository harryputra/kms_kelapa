import type { Request, Response } from 'express'
import { sendSuccess } from '../../lib/http.js'
import * as service from './blueprint.service.js'
import type { ListQuery } from './blueprint.schema.js'

export async function list(req: Request, res: Response) {
  sendSuccess(res, await service.listPublished(req.query as unknown as ListQuery))
}

export async function detail(req: Request, res: Response) {
  sendSuccess(res, await service.getById(Number(req.params.id), req.user?.id))
}

export async function valueTree(_req: Request, res: Response) {
  sendSuccess(res, await service.valueTree())
}

export async function mine(req: Request, res: Response) {
  sendSuccess(res, await service.listMine(req.user!.id))
}

export async function bookmarked(req: Request, res: Response) {
  sendSuccess(res, await service.listBookmarked(req.user!.id))
}

export async function submitted(_req: Request, res: Response) {
  sendSuccess(res, await service.listSubmitted())
}

export async function submit(req: Request, res: Response) {
  sendSuccess(res, await service.submit(req.user!.id, req.body), undefined, 201)
}

export async function toggleBookmark(req: Request, res: Response) {
  sendSuccess(res, await service.toggleBookmark(req.user!.id, Number(req.params.id)))
}

export async function replications(req: Request, res: Response) {
  sendSuccess(res, await service.listReplications(Number(req.params.id)))
}

export async function addReplication(req: Request, res: Response) {
  sendSuccess(res, await service.addReplication(req.user!.id, Number(req.params.id), req.body), undefined, 201)
}

export async function proposeVariant(req: Request, res: Response) {
  sendSuccess(res, await service.proposeVariant(Number(req.params.id), req.body.region, req.body.title), undefined, 201)
}

export async function curate(req: Request, res: Response) {
  await service.curate(Number(req.params.id), req.body.action)
  sendSuccess(res, { message: 'Kurasi diproses.' })
}
