<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Bot, Save, PlugZap, KeyRound, Server, Cloud, SlidersHorizontal, CheckCircle2, XCircle, Sparkles, Info } from 'lucide-vue-next'
import { api } from '@/api'
import { useUiStore } from '@/stores/ui'
import type { AiSettingsInput, AiTestResult } from '@/types'
import PageHeader from '@/components/common/PageHeader.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppToggle from '@/components/ui/AppToggle.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'

const ui = useUiStore()
const loading = ref(true)
const saving = ref(false)
const testing = ref(false)
const keySet = ref(false)
const apiKey = ref('')
const testResult = ref<AiTestResult | null>(null)

const form = reactive<Required<Omit<AiSettingsInput, 'api_key'>>>({
  enabled: false, provider: 'openai', base_url: 'https://api.openai.com/v1', model: 'gpt-4o-mini',
  temperature: 0.3, max_tokens: 700, top_k: 4, system_prompt: '',
})

type Preset = { label: string; icon: typeof Cloud; provider: 'openai' | 'anthropic'; base_url: string; model: string; tag: string; key: 'wajib' | 'opsional' }
const presets: Preset[] = [
  { label: 'OpenAI', icon: Cloud, provider: 'openai', base_url: 'https://api.openai.com/v1', model: 'gpt-4o-mini', tag: 'Berbayar', key: 'wajib' },
  { label: 'Anthropic', icon: Cloud, provider: 'anthropic', base_url: 'https://api.anthropic.com', model: 'claude-3-5-haiku-20241022', tag: 'Berbayar', key: 'wajib' },
  { label: 'OpenRouter', icon: Cloud, provider: 'openai', base_url: 'https://openrouter.ai/api/v1', model: 'meta-llama/llama-3.1-8b-instruct', tag: 'Berbayar/Gratis', key: 'wajib' },
  { label: 'Groq', icon: Cloud, provider: 'openai', base_url: 'https://api.groq.com/openai/v1', model: 'llama-3.1-8b-instant', tag: 'Gratis (cepat)', key: 'wajib' },
  { label: 'Ollama (lokal)', icon: Server, provider: 'openai', base_url: 'http://localhost:11434/v1', model: 'llama3.1', tag: 'Self-hosted', key: 'opsional' },
  { label: 'OpenWebUI', icon: Server, provider: 'openai', base_url: 'http://localhost:3000/api', model: 'llama3.1', tag: 'Self-hosted', key: 'wajib' },
]

function applyPreset(p: Preset) {
  form.provider = p.provider
  form.base_url = p.base_url
  form.model = p.model
  testResult.value = null
}

onMounted(async () => {
  const s = await api.getAiSettings()
  form.enabled = s.enabled
  form.provider = s.provider
  form.base_url = s.base_url
  form.model = s.model
  form.temperature = s.temperature
  form.max_tokens = s.max_tokens
  form.top_k = s.top_k
  form.system_prompt = s.system_prompt
  keySet.value = s.api_key_set
  loading.value = false
})

async function save() {
  saving.value = true
  try {
    const patch: AiSettingsInput = { ...form }
    if (apiKey.value.trim()) patch.api_key = apiKey.value.trim()
    const s = await api.updateAiSettings(patch)
    keySet.value = s.api_key_set
    apiKey.value = ''
    ui.success('Konfigurasi AI disimpan & langsung berlaku.')
  } finally {
    saving.value = false
  }
}

async function clearKey() {
  await api.updateAiSettings({ api_key: '' })
  keySet.value = false
  apiKey.value = ''
  ui.info('API key dihapus.')
}

async function test() {
  testing.value = true
  testResult.value = null
  try {
    // Simpan dulu agar uji memakai konfigurasi terbaru
    const patch: AiSettingsInput = { ...form }
    if (apiKey.value.trim()) patch.api_key = apiKey.value.trim()
    await api.updateAiSettings(patch)
    keySet.value = (await api.getAiSettings()).api_key_set
    apiKey.value = ''
    testResult.value = await api.testAiConnection()
  } finally {
    testing.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <PageHeader title="Asisten AI — Tanya COCO" subtitle="Pilih model & provider: berbayar (OpenAI/Anthropic) atau self-hosted (Ollama/OpenWebUI). Jawaban selalu di-grounding ke repositori (RAG)." />

    <LoadingBlock v-if="loading" />
    <form v-else class="space-y-5" @submit.prevent="save">
      <!-- Aktifkan -->
      <div class="premium-card p-6">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h3 class="flex items-center gap-2 font-display font-semibold text-ink"><Bot class="h-4.5 w-4.5 text-primary-600" /> Aktifkan AI generatif (RAG)</h3>
            <p class="mt-1 text-sm text-muted">Saat <strong>mati</strong>, Tanya COCO tetap berfungsi memakai ringkasan dari repositori (tanpa biaya). Saat <strong>nyala</strong>, jawaban disusun oleh model yang dipilih dari konteks repositori.</p>
          </div>
          <AppToggle v-model="form.enabled" />
        </div>
      </div>

      <!-- Preset provider -->
      <div class="premium-card space-y-3 p-6">
        <div class="flex items-center gap-2 text-primary-700"><Sparkles class="h-4.5 w-4.5" /><h3 class="font-display font-semibold">Pilih cepat provider</h3></div>
        <div class="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          <button
            v-for="p in presets" :key="p.label" type="button"
            class="flex flex-col gap-1 rounded-xl border p-3 text-left transition-colors"
            :class="form.base_url === p.base_url && form.provider === p.provider ? 'border-primary-600 bg-primary-50' : 'border-line hover:border-primary-300'"
            @click="applyPreset(p)"
          >
            <span class="flex items-center gap-1.5 font-medium text-ink"><component :is="p.icon" class="h-4 w-4 text-primary-600" /> {{ p.label }}</span>
            <span class="text-[11px] text-muted">{{ p.tag }} · API key {{ p.key }}</span>
          </button>
        </div>
        <p class="flex items-start gap-1.5 text-xs text-muted"><Info class="mt-0.5 h-3.5 w-3.5 shrink-0" /> Semua provider self-hosted/berbayar yang kompatibel OpenAI didukung lewat satu endpoint <code class="rounded bg-canvas px-1">/chat/completions</code>. Sesuaikan Base URL bila perlu.</p>
      </div>

      <!-- Detail koneksi -->
      <div class="premium-card space-y-4 p-6">
        <div class="flex items-center gap-2 text-primary-700"><PlugZap class="h-4.5 w-4.5" /><h3 class="font-display font-semibold">Koneksi model</h3></div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="label" for="prov">Tipe provider</label>
            <select id="prov" v-model="form.provider" class="field">
              <option value="openai">OpenAI-compatible (OpenAI/Ollama/OpenWebUI/OpenRouter/Groq/LM Studio)</option>
              <option value="anthropic">Anthropic (Claude)</option>
            </select>
          </div>
          <AppInput id="model" v-model="form.model" label="Nama model" placeholder="gpt-4o-mini / llama3.1 / claude-3-5-haiku" required />
        </div>
        <AppInput id="base" v-model="form.base_url" label="Base URL" placeholder="https://api.openai.com/v1" hint="Untuk Ollama: http://host:11434/v1 · OpenWebUI: http://host:3000/api · Anthropic: https://api.anthropic.com" required />
        <div>
          <label class="label flex items-center gap-1.5" for="key"><KeyRound class="h-3.5 w-3.5" /> API key
            <span v-if="keySet" class="chip bg-success/10 text-success">tersimpan</span>
          </label>
          <input id="key" v-model="apiKey" type="password" autocomplete="off" class="field" :placeholder="keySet ? '•••••••• (biarkan kosong untuk mempertahankan)' : 'Tempel API key (kosongkan untuk Ollama lokal)'" />
          <div class="mt-1 flex items-center justify-between">
            <p class="text-xs text-muted">Disimpan di server, tak pernah ditampilkan kembali. Ollama lokal umumnya tak perlu key.</p>
            <button v-if="keySet" type="button" class="text-xs text-danger hover:underline" @click="clearKey">Hapus key</button>
          </div>
        </div>
      </div>

      <!-- Parameter -->
      <div class="premium-card space-y-4 p-6">
        <div class="flex items-center gap-2 text-primary-700"><SlidersHorizontal class="h-4.5 w-4.5" /><h3 class="font-display font-semibold">Parameter generasi & RAG</h3></div>
        <div class="grid gap-4 sm:grid-cols-3">
          <AppInput id="temp" v-model.number="form.temperature" label="Temperature" type="number" hint="0 = presisi, 1 = kreatif" />
          <AppInput id="maxtok" v-model.number="form.max_tokens" label="Maks token jawaban" type="number" />
          <AppInput id="topk" v-model.number="form.top_k" label="Dokumen RAG (top-K)" type="number" hint="Jumlah cetak biru jadi konteks" />
        </div>
        <AppTextarea id="sysp" v-model="form.system_prompt" label="System prompt (opsional)" :rows="3" hint="Kosongkan untuk memakai prompt grounding bawaan (Bahasa Indonesia, wajib sitasi, anti-mengarang)." />
      </div>

      <!-- Uji koneksi -->
      <div class="premium-card p-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="font-display font-semibold text-ink">Uji koneksi</h3>
            <p class="mt-1 text-sm text-muted">Menyimpan konfigurasi lalu mengirim 1 prompt kecil ke model.</p>
          </div>
          <AppButton type="button" variant="secondary" :loading="testing" @click="test"><template #icon><PlugZap class="h-4 w-4" /></template>Uji sekarang</AppButton>
        </div>
        <div v-if="testResult" class="mt-4 rounded-xl border p-3 text-sm" :class="testResult.ok ? 'border-success/30 bg-success/5' : 'border-danger/30 bg-danger/5'">
          <p class="flex items-center gap-2 font-medium" :class="testResult.ok ? 'text-success' : 'text-danger'">
            <component :is="testResult.ok ? CheckCircle2 : XCircle" class="h-4.5 w-4.5" />
            {{ testResult.ok ? `Berhasil · ${testResult.model ?? form.model} · ${testResult.latency_ms ?? '—'} ms` : 'Gagal terhubung' }}
          </p>
          <p class="mt-1 text-muted">{{ testResult.ok ? testResult.sample : testResult.message }}</p>
        </div>
      </div>

      <div class="flex justify-end">
        <AppButton type="submit" :loading="saving" size="lg"><template #icon><Save class="h-4 w-4" /></template>Simpan Konfigurasi</AppButton>
      </div>
    </form>
  </div>
</template>
