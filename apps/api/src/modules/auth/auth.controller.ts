import type { Request, Response } from 'express'
import { sendSuccess } from '../../lib/http.js'
import { env, isProd } from '../../env.js'
import * as service from './auth.service.js'

const COOKIE = 'coco_rt'

function setRefreshCookie(res: Response, token: string) {
  res.cookie(COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 86_400_000,
    path: '/',
  })
}

export async function register(req: Request, res: Response) {
  const result = await service.register(req.body)
  sendSuccess(res, result, undefined, 201)
}

export async function login(req: Request, res: Response) {
  const { accessToken, refreshToken, user } = await service.login(req.body)
  setRefreshCookie(res, refreshToken)
  sendSuccess(res, { access_token: accessToken, user })
}

export async function refresh(req: Request, res: Response) {
  const token = (req.cookies?.coco_rt as string | undefined) ?? (req.body?.refresh_token as string | undefined)
  const { accessToken, refreshToken } = await service.refresh(token)
  setRefreshCookie(res, refreshToken)
  sendSuccess(res, { access_token: accessToken })
}

export async function logout(req: Request, res: Response) {
  await service.logout(req.cookies?.coco_rt as string | undefined)
  res.clearCookie(COOKIE, { path: '/' })
  sendSuccess(res, { message: 'Logout berhasil.' })
}

export async function me(req: Request, res: Response) {
  sendSuccess(res, await service.me(req.user!.id))
}
