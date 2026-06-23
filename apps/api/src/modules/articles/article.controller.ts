import type { Request, Response } from 'express'
import { sendSuccess } from '../../lib/http.js'
import * as s from './article.service.js'

export const list = async (req: Request, res: Response) => {
  const { data, meta } = await s.listPublished({
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    search: req.query.search as string | undefined,
    category: req.query.category as string | undefined,
    sort: req.query.sort as string | undefined,
  })
  sendSuccess(res, data, meta)
}
export const detail = async (req: Request, res: Response) => sendSuccess(res, await s.getArticle(Number(req.params.id), req.user?.id))
export const mine = async (req: Request, res: Response) => sendSuccess(res, await s.myArticles(req.user!.id))
export const bookmarks = async (req: Request, res: Response) => sendSuccess(res, await s.myBookmarks(req.user!.id))
export const submit = async (req: Request, res: Response) => sendSuccess(res, await s.submitArticle(req.user!.id, req.body), undefined, 201)
export const vote = async (req: Request, res: Response) => sendSuccess(res, await s.vote(req.user!.id, Number(req.params.id), req.body.vote_type))
export const bookmark = async (req: Request, res: Response) => sendSuccess(res, await s.toggleBookmark(req.user!.id, Number(req.params.id)))
export const report = async (req: Request, res: Response) => sendSuccess(res, await s.report(req.user!.id, 'article', Number(req.params.id), req.body.reason, req.body.description))
export const comments = async (req: Request, res: Response) => sendSuccess(res, await s.getComments(Number(req.params.id)))
export const addComment = async (req: Request, res: Response) => sendSuccess(res, await s.addComment(req.user!.id, Number(req.params.id), req.body.content, req.body.parent_id ?? null), undefined, 201)
