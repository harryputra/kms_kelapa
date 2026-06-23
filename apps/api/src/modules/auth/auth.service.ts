import { prisma } from '../../prisma.js'
import { ApiError } from '../../lib/http.js'
import { hashPassword, verifyPassword } from '../../lib/password.js'
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt.js'
import { env } from '../../env.js'
import type { LoginInput, RegisterInput } from './auth.schema.js'

type UserWithRel = Awaited<ReturnType<typeof findUserFull>>

function findUserFull(where: { id: number } | { email: string }) {
  return prisma.user.findUnique({ where, include: { role: true, profile: true } })
}

export async function toUserDetail(user: NonNullable<UserWithRel>) {
  const publishedCount = await prisma.blueprint.count({ where: { authorId: user.id, status: 'published' } })
  return {
    id: user.id,
    email: user.email,
    display_name: user.profile?.displayName ?? user.email,
    role: user.role.name,
    avatar_url: user.profile?.avatarPath ?? null,
    bio: user.profile?.bio ?? '',
    job_title: user.profile?.jobTitle ?? '',
    department: user.profile?.department ?? '',
    division: user.profile?.division ?? '',
    badges: [] as unknown[],
    stats: { articles_published: publishedCount, comments_count: 0, likes_given: 0, followers: 0 },
  }
}

async function issueTokens(userId: number, role: string) {
  const accessToken = signAccessToken({ sub: userId, role })
  const refreshToken = signRefreshToken({ sub: userId, role })
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 86_400_000)
  await prisma.refreshToken.create({ data: { userId, tokenHash: hashToken(refreshToken), expiresAt } })
  return { accessToken, refreshToken }
}

export async function register(input: RegisterInput) {
  const exists = await prisma.user.findUnique({ where: { email: input.email } })
  if (exists) throw ApiError.conflict('Email sudah terdaftar.')
  const userRole = await prisma.role.findUnique({ where: { name: 'user' } })
  if (!userRole) throw new ApiError(500, 'INTERNAL', 'Role dasar belum ter-seed.')
  await prisma.user.create({
    data: {
      email: input.email,
      password: await hashPassword(input.password),
      roleId: userRole.id, // peran selalu di-set server (anti privilege escalation)
      emailVerified: true, // demo: aktif langsung (produksi: verifikasi email)
      profile: { create: { displayName: input.display_name } },
    },
  })
  return { message: 'Registrasi berhasil. Silakan login.' }
}

export async function login(input: LoginInput) {
  const user = await findUserFull({ email: input.email })
  // Pesan seragam untuk kurangi enumerasi akun.
  if (!user || !(await verifyPassword(input.password, user.password))) {
    throw ApiError.unauthorized('Email atau kata sandi salah.')
  }
  if (user.status === 'suspended') throw ApiError.forbidden('Akun Anda dinonaktifkan. Hubungi admin.')
  const tokens = await issueTokens(user.id, user.role.name)
  return { ...tokens, user: await toUserDetail(user) }
}

export async function refresh(token: string | undefined) {
  if (!token) throw ApiError.unauthorized('Refresh token tidak ada.')
  let payload
  try {
    payload = verifyRefreshToken(token)
  } catch {
    throw ApiError.unauthorized('Refresh token tidak valid/kedaluwarsa.')
  }
  const stored = await prisma.refreshToken.findFirst({
    where: { userId: payload.sub, tokenHash: hashToken(token), revokedAt: null, expiresAt: { gt: new Date() } },
  })
  if (!stored) throw ApiError.unauthorized('Sesi tidak dikenali. Silakan login kembali.')
  // Rotasi: cabut yang lama, terbitkan baru.
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } })
  return issueTokens(payload.sub, payload.role)
}

export async function logout(token: string | undefined) {
  if (token) {
    await prisma.refreshToken.updateMany({ where: { tokenHash: hashToken(token), revokedAt: null }, data: { revokedAt: new Date() } })
  }
}

export async function me(userId: number) {
  const user = await findUserFull({ id: userId })
  if (!user) throw ApiError.unauthorized()
  return toUserDetail(user)
}
