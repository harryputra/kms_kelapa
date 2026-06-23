// Mapper bersama: User → UserProfile (bentuk yang dipakai frontend).
// userSelectInclude: untuk query user di TOP-LEVEL (include: { role, profile }).
// userInclude       : untuk RELASI ke user (author: { include: { role, profile } }).
export const userSelectInclude = { role: true, profile: true } as const
export const userInclude = { include: userSelectInclude } as const

export interface UserRow {
  id: number
  email: string
  role: { name: string }
  profile: { displayName: string; avatarPath: string | null } | null
}

export function toAuthor(u: UserRow) {
  return {
    id: u.id,
    email: u.email,
    display_name: u.profile?.displayName ?? u.email,
    role: u.role.name,
    avatar_url: u.profile?.avatarPath ?? null,
  }
}

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
