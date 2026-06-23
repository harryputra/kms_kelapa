import type { Request, Response } from 'express'
import { sendSuccess } from '../../lib/http.js'
import * as service from './qna.service.js'

export async function list(req: Request, res: Response) {
  const blueprintId = req.query.blueprintId ? Number(req.query.blueprintId) : undefined
  sendSuccess(res, await service.list(blueprintId, req.user?.id))
}

export async function ask(req: Request, res: Response) {
  sendSuccess(res, await service.ask(req.user!.id, req.body), undefined, 201)
}

export async function answer(req: Request, res: Response) {
  sendSuccess(res, await service.answer(req.user!.id, req.user!.role, Number(req.params.id), req.body.content), undefined, 201)
}

export async function vote(req: Request, res: Response) {
  sendSuccess(res, await service.vote(req.user!.id, Number(req.params.id)))
}

export async function markBest(req: Request, res: Response) {
  sendSuccess(res, await service.markBest(req.user!.id, req.user!.role, Number(req.params.id)))
}
