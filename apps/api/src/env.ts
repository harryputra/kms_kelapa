import 'dotenv/config'
import { z } from 'zod'

// Validasi env saat boot — gagal cepat bila konfigurasi kurang.
const schema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  JWT_ACCESS_SECRET: z.string().min(8),
  JWT_REFRESH_SECRET: z.string().min(8),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(7),
  ADMIN_EMAIL: z.string().email().default('admin@coconexus.test'),
  ADMIN_PASSWORD: z.string().default('Admin#1234'),
  SEED_DEMO: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
})

const parsed = schema.safeParse(process.env)
if (!parsed.success) {
  console.error('❌ Konfigurasi environment tidak valid:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
export const corsOrigins = env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean)
export const isProd = env.NODE_ENV === 'production'
