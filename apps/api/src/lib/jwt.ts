import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import { env } from '../env.js'

export interface AccessPayload {
  sub: number
  role: string
}

export function signAccessToken(payload: AccessPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_TTL } as jwt.SignOptions)
}

export function signRefreshToken(payload: AccessPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: `${env.REFRESH_TOKEN_TTL_DAYS}d` })
}

export function verifyAccessToken(token: string): AccessPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as unknown as AccessPayload
}

export function verifyRefreshToken(token: string): AccessPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as unknown as AccessPayload
}

// Simpan hanya hash refresh token di DB (jangan token mentah).
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}
