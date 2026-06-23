// Klien LLM provider-agnostik. Satu abstraksi "OpenAI-compatible" mencakup
// OpenAI, OpenRouter, Groq, Together, Ollama (/v1), OpenWebUI, LM Studio — semuanya
// memakai endpoint Chat Completions. Plus provider Anthropic native.
import { ApiError } from '../../lib/http.js'
import type { AiConfig } from './ai.settings.js'

export interface ChatResult { text: string; model: string }

const TIMEOUT_MS = 45_000

function assertUrl(u: string) {
  let parsed: URL
  try { parsed = new URL(u) } catch { throw new ApiError(400, 'AI_CONFIG', 'Base URL AI tidak valid.') }
  if (!/^https?:$/.test(parsed.protocol)) throw new ApiError(400, 'AI_CONFIG', 'Base URL AI harus http/https.')
}

async function postJson(url: string, headers: Record<string, string>, body: unknown) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body), signal: ctrl.signal })
    const text = await res.text()
    let json: any = null
    try { json = text ? JSON.parse(text) : null } catch { /* non-JSON */ }
    if (!res.ok) {
      const msg = json?.error?.message || json?.message || text?.slice(0, 200) || `HTTP ${res.status}`
      throw new ApiError(502, 'AI_UPSTREAM', `Provider AI menolak: ${msg}`)
    }
    return json
  } catch (e) {
    if (e instanceof ApiError) throw e
    const m = (e as Error)?.name === 'AbortError' ? 'Provider AI tidak merespons (timeout).' : `Gagal menghubungi provider AI: ${(e as Error)?.message ?? e}`
    throw new ApiError(502, 'AI_UPSTREAM', m)
  } finally {
    clearTimeout(t)
  }
}

export async function chat(config: AiConfig, system: string, user: string): Promise<ChatResult> {
  const base = config.baseUrl.replace(/\/+$/, '')
  assertUrl(base)

  if (config.provider === 'anthropic') {
    if (!config.apiKey) throw new ApiError(400, 'AI_CONFIG', 'API key Anthropic belum diisi.')
    const json = await postJson(`${base}/v1/messages`, { 'x-api-key': config.apiKey, 'anthropic-version': '2023-06-01' }, {
      model: config.model, max_tokens: config.maxTokens, temperature: config.temperature,
      system, messages: [{ role: 'user', content: user }],
    })
    const text = json?.content?.map((c: any) => c?.text ?? '').join('').trim()
    if (!text) throw new ApiError(502, 'AI_UPSTREAM', 'Respons AI kosong.')
    return { text, model: json?.model ?? config.model }
  }

  // OpenAI-compatible (default): OpenAI/OpenRouter/Ollama/OpenWebUI/LM Studio/Groq…
  const headers: Record<string, string> = {}
  if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`
  const json = await postJson(`${base}/chat/completions`, headers, {
    model: config.model, temperature: config.temperature, max_tokens: config.maxTokens, stream: false,
    messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
  })
  const text = (json?.choices?.[0]?.message?.content ?? '').trim()
  if (!text) throw new ApiError(502, 'AI_UPSTREAM', 'Respons AI kosong.')
  return { text, model: json?.model ?? config.model }
}
