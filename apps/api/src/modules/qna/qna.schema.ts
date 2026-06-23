import { z } from 'zod'

export const listQnaQuerySchema = z.object({
  blueprintId: z.coerce.number().int().positive().optional(),
})

export const askSchema = z.object({
  blueprintId: z.coerce.number().int().positive().nullable().optional(),
  blueprintTitle: z.string().max(200).nullable().optional(),
  title: z.string().min(8, 'Pertanyaan minimal 8 karakter.').max(200),
  content: z.string().max(2000).optional().default(''),
})

export const answerSchema = z.object({ content: z.string().min(1).max(2000) })

export const idParamSchema = z.object({ id: z.coerce.number().int().positive() })

export type AskInput = z.infer<typeof askSchema>
