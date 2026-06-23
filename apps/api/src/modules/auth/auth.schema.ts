import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Email tidak valid.').max(255),
  display_name: z.string().min(3, 'Nama minimal 3 karakter.').max(100),
  password: z
    .string()
    .min(8, 'Sandi minimal 8 karakter.')
    .max(72, 'Sandi maksimal 72 karakter.')
    .regex(/[A-Z]/, 'Harus ada huruf besar.')
    .regex(/[a-z]/, 'Harus ada huruf kecil.')
    .regex(/[0-9]/, 'Harus ada angka.'),
})

export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(72),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
