import { z } from 'zod'

export const listQuerySchema = z.object({
  search: z.string().optional(),
  wasteKind: z.enum(['sabut', 'tempurung', 'air', 'ampas']).optional(),
  product: z.string().optional(),
  difficulty: z.enum(['mudah', 'sedang', 'sulit']).optional(),
  capitalTier: z.enum(['rendah', 'menengah', 'tinggi']).optional(),
  maturity: z.enum(['raw', 'curated', 'validated', 'standard']).optional(),
  sort: z.enum(['popular', 'newest', 'maturity', 'capital']).default('popular'),
})

export const idParamSchema = z.object({ id: z.coerce.number().int().positive() })

export type ListQuery = z.infer<typeof listQuerySchema>
