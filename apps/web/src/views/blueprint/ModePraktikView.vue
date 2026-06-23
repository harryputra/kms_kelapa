<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import {
  ArrowLeft, CheckCircle2, Circle, Play, Pause, RotateCcw, Package, Timer,
  Thermometer, Scale, PartyPopper, WifiOff,
} from 'lucide-vue-next'
import { api } from '@/api'
import { useUiStore } from '@/stores/ui'
import type { BlueprintFull } from '@/types'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import GlossaryText from '@/components/common/GlossaryText.vue'

const route = useRoute()
const ui = useUiStore()
const bp = ref<BlueprintFull | null>(null)
const loading = ref(true)
const id = computed(() => Number(route.params.id))
const storeKey = computed(() => `coco_praktik_${id.value}`)

const done = ref<Set<number>>(new Set())
const showMaterials = ref(false)

// Timer sesi
const seconds = ref(0)
const running = ref(false)
let timer: ReturnType<typeof setInterval> | null = null
const elapsed = computed(() => {
  const m = Math.floor(seconds.value / 60)
  const s = seconds.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})
function toggleTimer() {
  running.value = !running.value
  if (running.value && !timer) timer = setInterval(() => running.value && seconds.value++, 1000)
}
function resetTimer() { seconds.value = 0; running.value = false }

const progress = computed(() => (bp.value ? Math.round((done.value.size / bp.value.steps.length) * 100) : 0))
const allDone = computed(() => bp.value && done.value.size === bp.value.steps.length)

function save() {
  try { localStorage.setItem(storeKey.value, JSON.stringify([...done.value])) } catch { /* abaikan */ }
}
function toggle(order: number) {
  if (done.value.has(order)) done.value.delete(order)
  else done.value.add(order)
  done.value = new Set(done.value)
  save()
  if (allDone.value) ui.success('Mantap! Semua langkah selesai 🎉')
}
function resetSteps() { done.value = new Set(); save() }

onMounted(async () => {
  bp.value = await api.getBlueprint(id.value)
  loading.value = false
  try {
    const raw = localStorage.getItem(storeKey.value)
    if (raw) done.value = new Set(JSON.parse(raw) as number[])
  } catch { /* abaikan */ }
})
onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>

<template>
  <div class="container-page py-6">
    <LoadingBlock v-if="loading" />
    <div v-else-if="bp">
      <RouterLink :to="`/cetak-biru/${id}`" class="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary-600">
        <ArrowLeft class="h-4 w-4" /> Kembali ke cetak biru
      </RouterLink>

      <div class="mx-auto max-w-2xl">
        <div class="mb-2 flex items-center gap-2">
          <span class="chip bg-primary-50 text-primary-700">Mode Praktik</span>
          <span class="chip bg-success/10 text-success"><WifiOff class="h-3 w-3" /> Bisa offline</span>
        </div>
        <h1 class="font-display text-2xl font-bold text-ink sm:text-3xl">{{ bp.title }}</h1>

        <!-- Progress + timer (sticky) -->
        <div class="sticky top-16 z-10 mt-4 rounded-2xl border border-line bg-surface/95 p-4 shadow-card backdrop-blur">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-ink">{{ done.size }}/{{ bp.steps.length }} langkah · {{ progress }}%</p>
            <div class="flex items-center gap-2">
              <span class="font-mono text-sm font-semibold text-ink tabular-nums">{{ elapsed }}</span>
              <button class="btn-ghost btn-sm h-8 w-8 !px-0" :title="running ? 'Jeda' : 'Mulai'" @click="toggleTimer"><component :is="running ? Pause : Play" class="h-4 w-4" /></button>
              <button class="btn-ghost btn-sm h-8 w-8 !px-0" title="Reset timer" @click="resetTimer"><RotateCcw class="h-4 w-4" /></button>
            </div>
          </div>
          <div class="mt-2 h-2.5 overflow-hidden rounded-full bg-line">
            <div class="h-full rounded-full bg-primary-500 transition-all" :style="{ width: `${progress}%` }" />
          </div>
        </div>

        <!-- Bahan (collapsible) -->
        <div class="mt-4">
          <button class="flex w-full items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 text-sm font-medium text-ink" @click="showMaterials = !showMaterials">
            <span class="inline-flex items-center gap-2"><Package class="h-4 w-4 text-primary-600" /> Alat & Bahan ({{ bp.materials.length }})</span>
            <span class="text-muted">{{ showMaterials ? '−' : '+' }}</span>
          </button>
          <ul v-if="showMaterials" class="mt-2 divide-y divide-line rounded-xl border border-line">
            <li v-for="(m, i) in bp.materials" :key="i" class="flex items-center justify-between px-4 py-2.5 text-sm">
              <span class="text-ink">{{ m.name }}</span>
              <span class="text-muted">{{ m.qty }}</span>
            </li>
          </ul>
        </div>

        <!-- Langkah besar -->
        <ol class="mt-5 space-y-3">
          <li
            v-for="s in bp.steps"
            :key="s.order"
            class="flex cursor-pointer gap-4 rounded-2xl border-2 p-4 transition-all active:scale-[0.99]"
            :class="done.has(s.order) ? 'border-primary-300 bg-primary-50/50' : 'border-line bg-surface'"
            @click="toggle(s.order)"
          >
            <component :is="done.has(s.order) ? CheckCircle2 : Circle" class="mt-0.5 h-8 w-8 shrink-0" :class="done.has(s.order) ? 'text-primary-600' : 'text-line'" />
            <div class="flex-1">
              <p class="text-lg font-semibold text-ink" :class="done.has(s.order) && 'line-through opacity-60'">{{ s.order }}. {{ s.title }}</p>
              <p class="mt-1 text-[15px] leading-relaxed text-ink/80"><GlossaryText :text="s.detail" /></p>
              <div class="mt-2 flex flex-wrap gap-2 text-sm">
                <span v-if="s.duration" class="inline-flex items-center gap-1 rounded-lg bg-canvas px-2.5 py-1 text-muted"><Timer class="h-4 w-4" />{{ s.duration }}</span>
                <span v-if="s.temperature" class="inline-flex items-center gap-1 rounded-lg bg-canvas px-2.5 py-1 text-muted"><Thermometer class="h-4 w-4" />{{ s.temperature }}</span>
                <span v-if="s.dose" class="inline-flex items-center gap-1 rounded-lg bg-canvas px-2.5 py-1 text-muted"><Scale class="h-4 w-4" />{{ s.dose }}</span>
              </div>
            </div>
          </li>
        </ol>

        <!-- Selesai -->
        <div v-if="allDone" class="mt-5 flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-6 text-center text-white">
          <PartyPopper class="h-8 w-8" />
          <p class="font-display text-lg font-bold">Semua langkah selesai!</p>
          <p class="text-sm text-white/80">Jangan lupa laporkan hasil Anda lewat "Sudah Saya Coba".</p>
          <RouterLink :to="`/cetak-biru/${id}`" class="mt-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/25">Lapor Hasil</RouterLink>
        </div>

        <div class="mt-4 text-center">
          <button class="btn-ghost btn-sm text-muted" @click="resetSteps">Reset progres langkah</button>
        </div>
      </div>
    </div>
  </div>
</template>
