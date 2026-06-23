<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Sparkles, Send, Bot, User, Loader2, ShieldCheck, Wallet, ArrowRight } from 'lucide-vue-next'
import { api } from '@/api'
import type { BlueprintSummary } from '@/types'
import { MATURITY, formatRupiah } from '@/lib/blueprint'
import MaturityBadge from '@/components/common/MaturityBadge.vue'

interface Msg {
  role: 'user' | 'assistant'
  text: string
  sources?: BlueprintSummary[]
  suggestions?: string[]
  model?: string
  grounded?: boolean
}

const messages = ref<Msg[]>([
  {
    role: 'assistant',
    text: 'Halo! Saya COCO 🥥 — asisten yang menjawab dari repositori cetak biru tervalidasi. Tanyakan, misalnya, produk apa yang cocok dengan modal & limbah Anda.',
    suggestions: ['Modal 5 juta, produk apa yang cocok?', 'Olah tempurung jadi apa saja?', 'Cara paling mudah dari sabut kelapa'],
  },
])
const input = ref('')
const thinking = ref(false)
const scroller = ref<HTMLElement | null>(null)

async function scrollDown() {
  await nextTick()
  scroller.value?.scrollTo({ top: scroller.value.scrollHeight, behavior: 'smooth' })
}

async function send(text?: string) {
  const q = (text ?? input.value).trim()
  if (!q || thinking.value) return
  messages.value.push({ role: 'user', text: q })
  input.value = ''
  thinking.value = true
  scrollDown()
  try {
    const reply = await api.askAssistant(q)
    messages.value.push({ role: 'assistant', text: reply.answer, sources: reply.sources, suggestions: reply.suggestions, model: reply.model, grounded: reply.grounded })
  } finally {
    thinking.value = false
    scrollDown()
  }
}
</script>

<template>
  <div class="container-page py-8">
    <div class="mx-auto flex h-[calc(100vh-9rem)] max-w-3xl flex-col">
      <!-- Header -->
      <div class="mb-3">
        <div class="flex items-center gap-3">
          <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white"><Bot class="h-6 w-6" /></span>
          <div>
            <h1 class="font-display text-xl font-bold text-ink">Tanya COCO <span class="chip ml-1 bg-gold-100 align-middle text-[10px] text-gold-700">Mode Demo</span></h1>
            <p class="text-xs text-muted">Asisten AI ter-<em>grounding</em> ke repositori — tidak mengarang.</p>
          </div>
        </div>
      </div>

      <!-- Disclaimer -->
      <div class="mb-3 flex items-start gap-2 rounded-xl bg-info/5 p-3 text-xs leading-relaxed text-info">
        <ShieldCheck class="mt-0.5 h-4 w-4 shrink-0" />
        <p>Jawaban hanya disusun dari <strong>cetak biru tervalidasi</strong> + selalu menyertakan sumber. Versi produksi memakai Claude (mis. Haiku) dengan retrieval ke repositori; mode demo ini memakai pencocokan deterministik.</p>
      </div>

      <!-- Percakapan -->
      <div ref="scroller" class="flex-1 space-y-5 overflow-y-auto rounded-2xl border border-line bg-canvas/40 p-4">
        <div v-for="(m, i) in messages" :key="i" class="flex gap-3" :class="m.role === 'user' && 'flex-row-reverse'">
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" :class="m.role === 'user' ? 'bg-primary-600 text-white' : 'bg-primary-50 text-primary-600'">
            <component :is="m.role === 'user' ? User : Bot" class="h-4 w-4" />
          </span>
          <div class="min-w-0 max-w-[85%]" :class="m.role === 'user' && 'text-right'">
            <div class="inline-block rounded-2xl px-4 py-2.5 text-left text-sm leading-relaxed" :class="m.role === 'user' ? 'bg-primary-600 text-white' : 'bg-surface text-ink shadow-xs'">
              <p class="whitespace-pre-line">{{ m.text }}</p>
            </div>
            <p v-if="m.role === 'assistant' && m.model" class="mt-1 text-[11px] text-muted">
              <span v-if="m.grounded" class="inline-flex items-center gap-1"><Sparkles class="h-3 w-3 text-primary-500" /> {{ m.model }} · RAG ter-grounding</span>
              <span v-else class="inline-flex items-center gap-1">Ringkasan langsung dari repositori</span>
            </p>

            <!-- Sumber (sitasi) -->
            <div v-if="m.sources?.length" class="mt-2 space-y-2">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-muted">Sumber</p>
              <RouterLink v-for="s in m.sources" :key="s.id" :to="`/cetak-biru/${s.id}`" class="flex items-center gap-3 rounded-xl border border-line bg-surface p-2.5 text-left transition-colors hover:border-primary-200">
                <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600"><Sparkles class="h-4 w-4" /></span>
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-sm font-medium text-ink">{{ s.title }}</span>
                  <span class="inline-flex items-center gap-1 text-xs text-muted"><Wallet class="h-3 w-3" />{{ formatRupiah(s.minCapital) }} · {{ MATURITY[s.maturity].label }}</span>
                </span>
                <MaturityBadge :maturity="s.maturity" />
              </RouterLink>
            </div>

            <!-- Saran lanjutan -->
            <div v-if="m.suggestions?.length" class="mt-2 flex flex-wrap gap-2" :class="m.role === 'user' && 'justify-end'">
              <button v-for="(sug, j) in m.suggestions" :key="j" class="chip border border-primary-200 bg-white text-primary-700 transition-colors hover:bg-primary-50" @click="send(sug)">
                {{ sug }} <ArrowRight class="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        <div v-if="thinking" class="flex items-center gap-3">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600"><Bot class="h-4 w-4" /></span>
          <span class="inline-flex items-center gap-2 rounded-2xl bg-surface px-4 py-2.5 text-sm text-muted shadow-xs"><Loader2 class="h-4 w-4 animate-spin" /> COCO sedang menelusuri repositori…</span>
        </div>
      </div>

      <!-- Input -->
      <form class="mt-3 flex items-center gap-2" @submit.prevent="send()">
        <input v-model="input" type="text" placeholder="Tanya apa saja soal olah limbah kelapa…" class="field flex-1" :disabled="thinking" />
        <button type="submit" class="btn-primary btn-md h-11 w-11 !px-0" :disabled="thinking || !input.trim()" aria-label="Kirim"><Send class="h-5 w-5" /></button>
      </form>
    </div>
  </div>
</template>
