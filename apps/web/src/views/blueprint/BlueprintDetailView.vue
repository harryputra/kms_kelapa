<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import {
  ArrowLeft, Bookmark, BookmarkCheck, Wallet, Clock, BarChart3, ShieldAlert,
  ListChecks, FlaskConical, Timer, Thermometer, Scale, CheckCircle2, Repeat2,
  GitBranch, Share2, Sparkles,
} from 'lucide-vue-next'
import { api, ApiError } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import type { BlueprintFull, BlueprintSummary } from '@/types'
import { CAPITAL, DIFFICULTY, WASTE, formatRupiah } from '@/lib/blueprint'
import AppAvatar from '@/components/ui/AppAvatar.vue'
import ArticleCover from '@/components/ui/ArticleCover.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppButton from '@/components/ui/AppButton.vue'
import MaturityBadge from '@/components/common/MaturityBadge.vue'
import MaturityMeter from '@/components/common/MaturityMeter.vue'
import BlueprintCalculator from '@/components/common/BlueprintCalculator.vue'
import BlueprintCard from '@/components/common/BlueprintCard.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()

const bp = ref<BlueprintFull | null>(null)
const related = ref<BlueprintSummary[]>([])
const loading = ref(true)
const id = computed(() => Number(route.params.id))

type Tab = 'langkah' | 'ekonomi' | 'mutu' | 'validasi'
const tab = ref<Tab>('langkah')
const tabs: { key: Tab; label: string; icon: unknown }[] = [
  { key: 'langkah', label: 'Bahan & Langkah', icon: ListChecks },
  { key: 'ekonomi', label: 'Ekonomi', icon: BarChart3 },
  { key: 'mutu', label: 'Mutu & K3', icon: ShieldAlert },
  { key: 'validasi', label: 'Validasi', icon: CheckCircle2 },
]

const done = ref<Set<number>>(new Set())
const replicateOpen = ref(false)

function toggleStep(order: number) {
  if (done.value.has(order)) done.value.delete(order)
  else done.value.add(order)
  done.value = new Set(done.value)
}
const progress = computed(() => (bp.value ? Math.round((done.value.size / bp.value.steps.length) * 100) : 0))

async function load() {
  loading.value = true
  try {
    bp.value = await api.getBlueprint(id.value)
    related.value = (await api.listBlueprints({ wasteKind: bp.value.wasteKind }))
      .filter((x) => x.id !== id.value)
      .slice(0, 3)
  } catch (e) {
    ui.error(e instanceof ApiError ? e.message : 'Gagal memuat.')
    router.replace('/cetak-biru')
  } finally {
    loading.value = false
  }
}

async function toggleBookmark() {
  if (!auth.isAuthenticated || !bp.value) return ui.warning('Login untuk menyimpan cetak biru.')
  const res = await api.toggleBlueprintBookmark(id.value)
  bp.value.isBookmarked = res.bookmarked
  ui.success(res.bookmarked ? 'Disimpan ke Bacaan Saya.' : 'Bookmark dihapus.')
}

async function replicate(outcome: 'success' | 'partial' | 'fail') {
  if (!bp.value) return
  bp.value = await api.addReplication(id.value, outcome)
  replicateOpen.value = false
  ui.success('Terima kasih! Laporan praktik Anda memperkuat validasi cetak biru ini.')
}

function share() {
  navigator.clipboard?.writeText(window.location.href)
  ui.success('Tautan disalin.')
}

watch(id, load)
onMounted(load)
</script>

<template>
  <div class="container-page py-8">
    <RouterLink to="/cetak-biru" class="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary-600">
      <ArrowLeft class="h-4 w-4" /> Kembali ke Cetak Biru
    </RouterLink>

    <LoadingBlock v-if="loading" />

    <div v-else-if="bp" class="grid gap-8 lg:grid-cols-[1fr_320px]">
      <!-- KONTEN -->
      <div class="min-w-0">
        <div class="mb-3 flex flex-wrap items-center gap-2">
          <RouterLink :to="`/cetak-biru?wasteKind=${bp.wasteKind}`" class="chip bg-primary-50 text-primary-700 hover:bg-primary-100">{{ WASTE[bp.wasteKind].label }}</RouterLink>
          <span class="text-muted">→</span>
          <span class="chip bg-gold-100 text-gold-700">{{ bp.product }}</span>
          <MaturityBadge :maturity="bp.maturity" show-level />
        </div>
        <h1 class="font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">{{ bp.title }}</h1>
        <p class="mt-3 text-lg text-muted">{{ bp.excerpt }}</p>

        <div class="mt-5 flex flex-wrap items-center gap-4 border-b border-line pb-5">
          <div class="flex items-center gap-2.5">
            <AppAvatar :name="bp.author.display_name" size="md" />
            <div>
              <p class="text-sm font-semibold text-ink">{{ bp.author.display_name }}</p>
              <p class="text-xs capitalize text-muted">{{ bp.author.role }}</p>
            </div>
          </div>
          <div class="ml-auto flex items-center gap-2">
            <button class="btn-secondary btn-sm" @click="toggleBookmark">
              <component :is="bp.isBookmarked ? BookmarkCheck : Bookmark" class="h-4 w-4" :class="bp.isBookmarked && 'text-primary-600'" />
              {{ bp.isBookmarked ? 'Tersimpan' : 'Simpan' }}
            </button>
            <button class="btn-ghost btn-sm" @click="share"><Share2 class="h-4 w-4" /></button>
          </div>
        </div>

        <ArticleCover :seed="bp.title" class="mt-6 rounded-2xl" ratio="wide" :label="`${WASTE[bp.wasteKind].label} → ${bp.product}`" />

        <!-- Tabs -->
        <div class="mt-6 flex gap-1 overflow-x-auto border-b border-line no-scrollbar">
          <button
            v-for="t in tabs"
            :key="t.key"
            class="flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors"
            :class="tab === t.key ? 'border-primary-600 text-primary-700' : 'border-transparent text-muted hover:text-ink'"
            @click="tab = t.key"
          >
            <component :is="t.icon" class="h-4 w-4" /> {{ t.label }}
          </button>
        </div>

        <!-- TAB: Bahan & Langkah -->
        <section v-show="tab === 'langkah'" class="mt-6">
          <h2 class="mb-3 text-h3">Alat & Bahan</h2>
          <div class="premium-card divide-y divide-line overflow-hidden">
            <div v-for="(m, i) in bp.materials" :key="i" class="flex items-center gap-3 px-4 py-3">
              <span class="chip shrink-0" :class="{ wajib: 'bg-primary-50 text-primary-700', murah: 'bg-success/10 text-success', mahal: 'bg-gold-100 text-gold-700' }[m.tier]">{{ m.tier }}</span>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-ink">{{ m.name }}</p>
                <p v-if="m.note" class="text-xs text-muted">{{ m.note }}</p>
              </div>
              <span class="shrink-0 text-sm text-muted">{{ m.qty }}</span>
              <span class="w-24 shrink-0 text-right text-sm font-medium text-ink">{{ m.price ? formatRupiah(m.price) : '—' }}</span>
            </div>
          </div>

          <div class="mb-3 mt-8 flex items-center justify-between">
            <h2 class="text-h3">Langkah (Mode Praktik)</h2>
            <span class="text-sm font-medium text-primary-700">{{ progress }}% selesai</span>
          </div>
          <div class="mb-4 h-2 overflow-hidden rounded-full bg-line">
            <div class="h-full rounded-full bg-primary-500 transition-all" :style="{ width: `${progress}%` }" />
          </div>
          <ol class="space-y-3">
            <li
              v-for="s in bp.steps"
              :key="s.order"
              class="flex cursor-pointer gap-3 rounded-xl border p-4 transition-all"
              :class="done.has(s.order) ? 'border-primary-200 bg-primary-50/40' : 'border-line bg-surface hover:border-primary-200'"
              @click="toggleStep(s.order)"
            >
              <button class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors" :class="done.has(s.order) ? 'border-primary-600 bg-primary-600 text-white' : 'border-line text-muted'">
                <CheckCircle2 v-if="done.has(s.order)" class="h-4 w-4" />
                <span v-else class="text-xs font-semibold">{{ s.order }}</span>
              </button>
              <div class="flex-1">
                <p class="font-medium text-ink" :class="done.has(s.order) && 'line-through opacity-60'">{{ s.title }}</p>
                <p class="mt-0.5 text-sm text-muted">{{ s.detail }}</p>
                <div class="mt-2 flex flex-wrap gap-2 text-xs">
                  <span v-if="s.duration" class="inline-flex items-center gap-1 rounded-md bg-canvas px-2 py-0.5 text-muted"><Timer class="h-3 w-3" />{{ s.duration }}</span>
                  <span v-if="s.temperature" class="inline-flex items-center gap-1 rounded-md bg-canvas px-2 py-0.5 text-muted"><Thermometer class="h-3 w-3" />{{ s.temperature }}</span>
                  <span v-if="s.dose" class="inline-flex items-center gap-1 rounded-md bg-canvas px-2 py-0.5 text-muted"><Scale class="h-3 w-3" />{{ s.dose }}</span>
                </div>
              </div>
            </li>
          </ol>
        </section>

        <!-- TAB: Ekonomi -->
        <section v-show="tab === 'ekonomi'" class="mt-6 space-y-5">
          <BlueprintCalculator :economic="bp.economic" :waste-label="bp.wasteLabel" :product="bp.product" />
          <div class="premium-card p-5">
            <h3 class="mb-3 font-display font-semibold text-ink">Parameter Dasar (per batch)</h3>
            <dl class="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div><dt class="text-muted">Limbah / batch</dt><dd class="font-medium text-ink">{{ bp.economic.batchInputKg }} kg</dd></div>
              <div><dt class="text-muted">Hasil / batch</dt><dd class="font-medium text-ink">{{ bp.economic.batchOutputKg }} kg</dd></div>
              <div><dt class="text-muted">Harga jual</dt><dd class="font-medium text-ink">{{ formatRupiah(bp.economic.sellPricePerKg) }}/kg</dd></div>
              <div><dt class="text-muted">Biaya / batch</dt><dd class="font-medium text-ink">{{ formatRupiah(bp.economic.costPerBatch) }}</dd></div>
              <div><dt class="text-muted">Modal alat</dt><dd class="font-medium text-ink">{{ formatRupiah(bp.economic.capital) }}</dd></div>
            </dl>
          </div>
        </section>

        <!-- TAB: Mutu & K3 -->
        <section v-show="tab === 'mutu'" class="mt-6 grid gap-5 md:grid-cols-2">
          <div class="premium-card p-5">
            <h3 class="mb-3 flex items-center gap-2 font-display font-semibold text-ink"><FlaskConical class="h-4.5 w-4.5 text-primary-600" /> Parameter Mutu</h3>
            <ul class="space-y-3">
              <li v-for="(q, i) in bp.quality" :key="i" class="rounded-xl bg-canvas p-3">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-ink">{{ q.name }}</p>
                  <span class="chip bg-success/10 text-success">{{ q.target }}</span>
                </div>
                <p class="mt-1 text-xs text-muted">Cara uji: {{ q.method }}</p>
              </li>
            </ul>
          </div>
          <div class="premium-card p-5">
            <h3 class="mb-3 flex items-center gap-2 font-display font-semibold text-ink"><ShieldAlert class="h-4.5 w-4.5 text-danger" /> Keselamatan (K3)</h3>
            <ul class="space-y-3">
              <li v-for="(s, i) in bp.safety" :key="i" class="rounded-xl border border-danger/20 bg-danger/5 p-3">
                <p class="text-sm font-medium text-danger">⚠ {{ s.risk }}</p>
                <p class="mt-1 text-xs text-ink/80">Mitigasi: {{ s.mitigation }}</p>
              </li>
            </ul>
          </div>
        </section>

        <!-- TAB: Validasi -->
        <section v-show="tab === 'validasi'" class="mt-6 space-y-5">
          <MaturityMeter :maturity="bp.maturity" :replications="bp.replications" :success-rate="bp.stats.successRate" />

          <div class="premium-card flex flex-col items-center gap-3 p-6 text-center sm:flex-row sm:text-left">
            <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white"><Repeat2 class="h-6 w-6" /></span>
            <div class="flex-1">
              <p class="font-display font-semibold text-ink">Sudah pernah mempraktikkan cetak biru ini?</p>
              <p class="text-sm text-muted">Laporkan hasil Anda — bukti lapangan meningkatkan kematangan & membantu UMKM lain.</p>
            </div>
            <AppButton @click="auth.isAuthenticated ? (replicateOpen = true) : ui.warning('Login untuk melaporkan praktik.')">
              <template #icon><Sparkles class="h-4 w-4" /></template> Sudah Saya Coba
            </AppButton>
          </div>

          <div v-if="bp.variants.length" class="premium-card p-5">
            <h3 class="mb-3 flex items-center gap-2 font-display font-semibold text-ink"><GitBranch class="h-4.5 w-4.5 text-primary-600" /> Varian Daerah</h3>
            <ul class="space-y-2">
              <li v-for="v in bp.variants" :key="v.id" class="flex items-center gap-3 rounded-xl bg-canvas p-3">
                <span class="chip bg-info/10 text-info">{{ v.region }}</span>
                <span class="text-sm text-ink">{{ v.title }}</span>
              </li>
            </ul>
          </div>
        </section>
      </div>

      <!-- SIDEBAR -->
      <aside class="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <div class="premium-card p-5">
          <h3 class="mb-3 font-display font-semibold text-ink">Ringkasan Teknis</h3>
          <dl class="space-y-3 text-sm">
            <div class="flex items-center justify-between"><dt class="text-muted">Bahan baku</dt><dd><span class="chip bg-primary-50 text-primary-700">{{ WASTE[bp.wasteKind].label }}</span></dd></div>
            <div class="flex items-center justify-between"><dt class="text-muted">Produk</dt><dd class="font-medium text-ink">{{ bp.product }}</dd></div>
            <div class="flex items-center justify-between"><dt class="text-muted">Kesulitan</dt><dd><span class="chip" :class="DIFFICULTY[bp.difficulty].chip">{{ DIFFICULTY[bp.difficulty].label }}</span></dd></div>
            <div class="flex items-center justify-between"><dt class="text-muted">Modal</dt><dd><span class="chip" :class="CAPITAL[bp.capitalTier].chip">{{ CAPITAL[bp.capitalTier].label }}</span></dd></div>
            <div class="flex items-center justify-between"><dt class="inline-flex items-center gap-1 text-muted"><Wallet class="h-3.5 w-3.5" />Modal minimum</dt><dd class="font-semibold text-ink">{{ formatRupiah(bp.minCapital) }}</dd></div>
            <div class="flex items-center justify-between"><dt class="inline-flex items-center gap-1 text-muted"><Clock class="h-3.5 w-3.5" />Estimasi waktu</dt><dd class="font-medium text-ink">{{ bp.estTime }}</dd></div>
          </dl>
          <button class="btn-primary btn-md mt-4 w-full" @click="tab = 'ekonomi'"><BarChart3 class="h-4 w-4" /> Hitung Kelayakan</button>
        </div>

        <div class="premium-card p-5">
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted">Validasi lapangan</span>
            <span class="font-semibold text-success">{{ bp.stats.successRate }}%</span>
          </div>
          <div class="mt-1 flex items-center justify-between text-sm">
            <span class="text-muted">Total dicoba</span>
            <span class="font-medium text-ink">{{ bp.stats.replications }}×</span>
          </div>
          <button class="btn-secondary btn-sm mt-3 w-full" @click="tab = 'validasi'">Lihat Kematangan</button>
        </div>
      </aside>
    </div>

    <!-- Cetak biru terkait -->
    <section v-if="bp && related.length" class="mt-12">
      <h2 class="mb-5 text-h2">Cetak Biru Terkait</h2>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <BlueprintCard v-for="r in related" :key="r.id" :blueprint="r" />
      </div>
    </section>

    <!-- Modal "Sudah Saya Coba" -->
    <AppModal :open="replicateOpen" title="Laporkan Hasil Praktik" size="sm" @close="replicateOpen = false">
      <p class="mb-4 text-sm text-muted">Bagaimana hasil ketika Anda mempraktikkan cetak biru ini?</p>
      <div class="space-y-2">
        <button class="flex w-full items-center gap-3 rounded-xl border border-line p-3 text-left transition-colors hover:border-success hover:bg-success/5" @click="replicate('success')">
          <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success">✓</span>
          <div><p class="text-sm font-medium text-ink">Berhasil</p><p class="text-xs text-muted">Sesuai harapan</p></div>
        </button>
        <button class="flex w-full items-center gap-3 rounded-xl border border-line p-3 text-left transition-colors hover:border-warning hover:bg-warning/5" @click="replicate('partial')">
          <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/15 text-gold-700">≈</span>
          <div><p class="text-sm font-medium text-ink">Sebagian berhasil</p><p class="text-xs text-muted">Ada kendala/modifikasi</p></div>
        </button>
        <button class="flex w-full items-center gap-3 rounded-xl border border-line p-3 text-left transition-colors hover:border-danger hover:bg-danger/5" @click="replicate('fail')">
          <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-danger/10 text-danger">✕</span>
          <div><p class="text-sm font-medium text-ink">Belum berhasil</p><p class="text-xs text-muted">Perlu penyempurnaan</p></div>
        </button>
      </div>
    </AppModal>
  </div>
</template>
