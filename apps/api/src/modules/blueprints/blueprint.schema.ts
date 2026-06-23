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

const wasteKind = z.enum(['sabut', 'tempurung', 'air', 'ampas'])
const difficulty = z.enum(['mudah', 'sedang', 'sulit'])
const capitalTier = z.enum(['rendah', 'menengah', 'tinggi'])

export const submitSchema = z.object({
  title: z.string().min(8).max(160),
  excerpt: z.string().min(1).max(500),
  summary: z.string().max(2000).optional().default(''),
  wasteKind,
  wasteLabel: z.string().min(1),
  product: z.string().min(1).max(100),
  difficulty,
  capitalTier,
  estTime: z.string().max(60).optional().default('—'),
  tags: z.array(z.string().max(40)).max(8).default([]),
  materials: z
    .array(z.object({ name: z.string().min(1), qty: z.string().default(''), tier: z.enum(['wajib', 'murah', 'mahal']).default('wajib'), price: z.coerce.number().int().nonnegative().default(0), note: z.string().optional() }))
    .min(1),
  steps: z
    .array(z.object({ order: z.coerce.number().optional(), title: z.string().min(1), detail: z.string().default(''), duration: z.string().optional(), temperature: z.string().optional(), dose: z.string().optional() }))
    .min(1),
  quality: z.array(z.object({ name: z.string().min(1), target: z.string().default(''), method: z.string().default('') })).default([]),
  safety: z.array(z.object({ risk: z.string().min(1), mitigation: z.string().default('') })).default([]),
  economic: z.object({
    capital: z.coerce.number().int().nonnegative(),
    costPerBatch: z.coerce.number().int().nonnegative(),
    batchInputKg: z.coerce.number().positive(),
    batchOutputKg: z.coerce.number().positive(),
    sellPricePerKg: z.coerce.number().int().nonnegative(),
  }),
  sources: z.array(z.string()).default([]),
})

export const replicationSchema = z.object({
  outcome: z.enum(['success', 'partial', 'fail']),
  note: z.string().min(1).max(1000),
  costReal: z.coerce.number().int().nonnegative().nullable().optional(),
  photoSeed: z.string().max(80).nullable().optional(),
})

export const variantSchema = z.object({
  region: z.string().min(1).max(80),
  title: z.string().min(1).max(160),
})

export const curateSchema = z.object({ action: z.enum(['approve', 'reject']) })

export type ListQuery = z.infer<typeof listQuerySchema>
export type SubmitInput = z.infer<typeof submitSchema>
export type ReplicationInput = z.infer<typeof replicationSchema>
