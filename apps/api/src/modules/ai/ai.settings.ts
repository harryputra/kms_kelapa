// Konfigurasi Asisten AI — disimpan di system_settings (key prefix `ai.`).
// API key TIDAK PERNAH dikembalikan mentah ke klien (hanya indikator api_key_set).
import { prisma } from '../../prisma.js'

export type AiProvider = 'openai' | 'anthropic'

export interface AiConfig {
  enabled: boolean
  provider: AiProvider
  baseUrl: string
  model: string
  apiKey: string
  temperature: number
  maxTokens: number
  topK: number
  systemPrompt: string
}

const DEFAULTS: AiConfig = {
  enabled: false,
  provider: 'openai',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  apiKey: '',
  temperature: 0.3,
  maxTokens: 700,
  topK: 4,
  systemPrompt: '',
}

const KEYS = {
  enabled: 'ai.enabled', provider: 'ai.provider', baseUrl: 'ai.base_url', model: 'ai.model',
  apiKey: 'ai.api_key', temperature: 'ai.temperature', maxTokens: 'ai.max_tokens', topK: 'ai.top_k', systemPrompt: 'ai.system_prompt',
} as const

/** Konfigurasi penuh termasuk apiKey — HANYA untuk pemakaian server (LLM client). */
export async function getAiConfig(): Promise<AiConfig> {
  const rows = await prisma.systemSetting.findMany({ where: { key: { in: Object.values(KEYS) } } })
  const m = new Map(rows.map((r) => [r.key, r.value]))
  const num = (k: string, d: number) => (m.has(k) ? Number(m.get(k)) : d)
  return {
    enabled: m.get(KEYS.enabled) === 'true',
    provider: (m.get(KEYS.provider) as AiProvider) || DEFAULTS.provider,
    baseUrl: m.get(KEYS.baseUrl) || DEFAULTS.baseUrl,
    model: m.get(KEYS.model) || DEFAULTS.model,
    apiKey: m.get(KEYS.apiKey) || '',
    temperature: num(KEYS.temperature, DEFAULTS.temperature),
    maxTokens: num(KEYS.maxTokens, DEFAULTS.maxTokens),
    topK: num(KEYS.topK, DEFAULTS.topK),
    systemPrompt: m.get(KEYS.systemPrompt) || '',
  }
}

/** Versi aman untuk admin (tanpa apiKey mentah). */
export async function getAiSettings() {
  const c = await getAiConfig()
  return {
    enabled: c.enabled, provider: c.provider, base_url: c.baseUrl, model: c.model,
    api_key_set: c.apiKey.length > 0, temperature: c.temperature, max_tokens: c.maxTokens,
    top_k: c.topK, system_prompt: c.systemPrompt,
  }
}

export interface AiSettingsInput {
  enabled?: boolean
  provider?: AiProvider
  base_url?: string
  model?: string
  api_key?: string | null
  temperature?: number
  max_tokens?: number
  top_k?: number
  system_prompt?: string
}

export async function updateAiSettings(input: AiSettingsInput) {
  const set: Array<[string, string]> = []
  if (input.enabled !== undefined) set.push([KEYS.enabled, String(input.enabled)])
  if (input.provider !== undefined) set.push([KEYS.provider, input.provider])
  if (input.base_url !== undefined) set.push([KEYS.baseUrl, input.base_url.trim()])
  if (input.model !== undefined) set.push([KEYS.model, input.model.trim()])
  if (input.temperature !== undefined) set.push([KEYS.temperature, String(input.temperature)])
  if (input.max_tokens !== undefined) set.push([KEYS.maxTokens, String(input.max_tokens)])
  if (input.top_k !== undefined) set.push([KEYS.topK, String(input.top_k)])
  if (input.system_prompt !== undefined) set.push([KEYS.systemPrompt, input.system_prompt])
  // api_key: undefined = biarkan; '' atau null = kosongkan; selain itu = set
  if (input.api_key !== undefined) set.push([KEYS.apiKey, input.api_key ?? ''])

  for (const [key, value] of set) {
    await prisma.systemSetting.upsert({ where: { key }, update: { value }, create: { key, value } })
  }
  return getAiSettings()
}
