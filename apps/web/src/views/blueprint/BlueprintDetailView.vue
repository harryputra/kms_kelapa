<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import {
  ArrowLeft, Bookmark, BookmarkCheck, Wallet, Clock, BarChart3, ShieldAlert,
  ListChecks, FlaskConical, Timer, Thermometer, Scale, CheckCircle2, Repeat2,
  GitBranch, Share2, Sparkles, MessageCircleQuestion, History, Image as ImageIcon, Plus,
} from 'lucide-vue-next'
import { api, ApiError } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import type { BlueprintFull, BlueprintSummary, ReplicationReport } from '@/types'
import { CAPITAL, DIFFICULTY, WASTE, formatRupiah } from '@/lib/blueprint'
import { gradientFor, relativeTime, formatDate } from '@/lib/format'
import AppAvatar from '@/components/ui/AppAvatar.vue'
import ArticleCover from '@/components/ui/ArticleCover.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import MaturityBadge from '@/components/common/MaturityBadge.vue'
import MaturityMeter from '@/components/common/MaturityMeter.vue'
import BlueprintCalculator from '@/components/common/BlueprintCalculator.vue'
import BlueprintCard from '@/components/common/BlueprintCard.vue'
import QnaSection from '@/components/common/QnaSection.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()

const bp = ref<BlueprintFull | null>(null)
const related = ref<BlueprintSummary[]>([])
const loading = ref(true)
const id = computed(() => Number(route.params.id))

type Tab = 'langkah' | 'ekonomi' | 'mutu' | 'validasi' | 'tanya'
const tab = ref<Tab>('langkah')
const tabs: { key: Tab; label: string; icon: unknown }[] = [
  { key: 'langkah', label: 'Bahan & Langkah', icon: ListChecks },
  { key: 'ekonomi', label: 'Ekonomi', icon: BarChart3 },
  { key: 'mutu', label: 'Mutu & K3', icon: ShieldAlert },
  { key: 'validasi', label: 'Validasi', icon: CheckCircle2 },
  { key: 'tanya', label: 'Tanya Pakar', icon: MessageCircleQuestion },
]

const done = ref<Set<number>>(new Set())
const reports = ref<ReplicationReport[]>([])

// Modal "Sudah Saya Coba"
const replicateOpen = ref(false)
const repForm = reactive({ outcome: 'success' as 'success' | 'partial' | 'fail', note: '', costReal: null as number | null, photoSeed: '' })

// Modal "Usulkan Varian"
const variantOpen = ref(false)
const variantForm = reactive({ region: '', title: '' })
const processing = ref(false)

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
    reports.value = await api.getReplications(id.value)
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

function openReplicate() {
  if (!auth.isAuthenticated) return ui.warning('Login untuk melaporkan praktik.')
  repForm.outcome = 'success'
  repForm.note = ''
  repForm.costReal = null
  repForm.photoSeed = ''
  replicateOpen.value = true
}
async function submitReplicate() {
  if (!repForm.note.trim()) return ui.error('Ceritakan sedikit hasil praktik Anda.')
  processing.value = true
  try {
    bp.value = await api.addReplicationReport(id.value, {
      outcome: repForm.outcome,
      note: repForm.note.trim(),
      costReal: repForm.costReal,
      photoSeed: repForm.photoSeed.trim() || (repForm.outcome + '-' + Date.now()),
    })
    reports.value = await api.getReplications(id.value)
    replicateOpen.value = false
    ui.success('Terima kasih! Laporan praktik Anda memperkuat validasi cetak biru ini.')
  } finally {
    processing.value = false
  }
}

function openVariant() {
  if (!auth.isAuthenticated) return ui.warning('Login untuk mengusulkan varian.')
  variantForm.region = ''
  variantForm.title = ''
  variantOpen.value = true
}
async function submitVariant() {
  if (!variantForm.region.trim() || !variantForm.title.trim()) return ui.error('Lengkapi daerah & deskripsi varian.')
  processing.value = true
  try {
    bp.value = await api.proposeVariant(id.value, variantForm.region.trim(), variantForm.title.trim())
    variantOpen.value = false
    ui.success('Usulan varian terkirim. Terima kasih telah menyempurnakan pengetahuan!')
  } finally {
    processing.value = false
  }
}

const REP_OUTCOME = {
  success: { label: 'Berhasil', chip: 'bg-success/10 text-success' },
  partial: { label: 'Sebagian', chip: 'bg-warning/15 text-gold-700' },
  fail: { label: 'Belum berhasil', chip: 'bg-danger/10 text-danger' },
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
            <AppButton @click="openReplicate"><template #icon><Sparkles class="h-4 w-4" /></template> Sudah Saya Coba</AppButton>
          </div>

          <!-- Galeri bukti lapangan -->
          <div v-if="reports.length" class="premium-card p-5">
            <h3 class="mb-4 flex items-center gap-2 font-display font-semibold text-ink"><ImageIcon class="h-4.5 w-4.5 text-primary-600" /> Bukti Praktik Lapangan ({{ reports.length }})</h3>
            <ul class="space-y-4">
              <li v-for="r in reports" :key="r.id" class="flex gap-3">
                <div v-if="r.photoSeed" :class="gradientFor(r.photoSeed || '')" class="hidden h-20 w-24 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white/40 sm:flex">
                  <ImageIcon class="h-7 w-7" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="mb-1 flex flex-wrap items-center gap-2">
                    <AppAvatar :name="r.user.display_name" size="sm" />
                    <span class="text-sm font-semibold text-ink">{{ r.user.display_name }}</span>
                    <span class="chip" :class="REP_OUTCOME[r.outcome].chip">{{ REP_OUTCOME[r.outcome].label }}</span>
                    <span class="text-xs text-muted">· {{ relativeTime(r.createdAt) }}</span>
                  </div>
                  <p class="text-sm text-ink/90">{{ r.note }}</p>
                  <p v-if="r.costReal" class="mt-1 text-xs text-muted">Biaya nyata: <span class="font-medium text-ink">{{ formatRupiah(r.costReal) }}</span></p>
                </div>
              </li>
            </ul>
          </div>

          <!-- Varian daerah + usul -->
          <div class="premium-card p-5">
            <div class="mb-3 flex items-center justify-between">
              <h3 class="flex items-center gap-2 font-display font-semibold text-ink"><GitBranch class="h-4.5 w-4.5 text-primary-600" /> Varian Daerah</h3>
              <button class="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline" @click="openVariant"><Plus class="h-4 w-4" /> Usulkan</button>
            </div>
            <ul v-if="bp.variants.length" class="space-y-2">
              <li v-for="v in bp.variants" :key="v.id" class="flex items-center gap-3 rounded-xl bg-canvas p-3">
                <span class="chip bg-info/10 text-info">{{ v.region }}</span>
                <span class="text-sm text-ink">{{ v.title }}</span>
              </li>
            </ul>
            <p v-else class="text-sm text-muted">Belum ada varian. Punya cara berbeda yang berhasil di daerah Anda? Usulkan!</p>
          </div>

          <!-- Riwayat versi -->
          <div class="premium-card p-5">
            <h3 class="mb-4 flex items-center gap-2 font-display font-semibold text-ink"><History class="h-4.5 w-4.5 text-primary-600" /> Riwayat Versi</h3>
            <ol class="relative space-y-4 border-l-2 border-line pl-5">
              <li v-for="v in [...bp.versions].reverse()" :key="v.version" class="relative">
                <span class="absolute -left-[27px] flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-[10px] font-bold text-primary-700 ring-4 ring-surface">{{ v.version }}</span>
                <p class="text-sm text-ink">{{ v.changelog }}</p>
                <p class="text-xs text-muted">{{ v.author.display_name }} · {{ formatDate(v.createdAt) }}</p>
              </li>
            </ol>
          </div>
        </section>

        <!-- TAB: Tanya Pakar -->
        <section v-show="tab === 'tanya'" class="mt-6">
          <QnaSection v-if="tab === 'tanya'" :blueprint-id="bp.id" :blueprint-title="bp.title" />
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
    <AppModal :open="replicateOpen" title="Laporkan Hasil Praktik" size="md" @close="replicateOpen = false">
      <div class="space-y-4">
        <div>
          <label class="label">Hasil praktik</label>
          <div class="grid grid-cols-3 gap-2">
            <button v-for="o in (['success','partial','fail'] as const)" :key="o" class="rounded-xl border p-3 text-center text-sm font-medium transition-colors" :class="repForm.outcome === o ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-line text-muted hover:border-primary-200'" @click="repForm.outcome = o">
              {{ REP_OUTCOME[o].label }}
            </button>
          </div>
        </div>
        <AppTextarea id="rn" v-model="repForm.note" label="Ceritakan pengalaman Anda" :rows="3" placeholder="mis. Briket nyala stabil; saya modifikasi perekat jadi 6%…" required />
        <div class="grid gap-4 sm:grid-cols-2">
          <div><label class="label">Biaya nyata (opsional)</label><input v-model.number="repForm.costReal" type="number" min="0" class="field" placeholder="Rp" /></div>
          <div>
            <label class="label">Foto bukti (opsional)</label>
            <button type="button" class="flex w-full items-center gap-2 rounded-xl border border-dashed border-line p-2.5 text-sm text-muted transition-colors hover:border-primary-300" @click="repForm.photoSeed = 'foto-' + Date.now()">
              <ImageIcon class="h-4 w-4" /> {{ repForm.photoSeed ? 'Foto terlampir ✓' : 'Lampirkan foto' }}
            </button>
          </div>
        </div>
      </div>
      <template #footer>
        <AppButton variant="ghost" @click="replicateOpen = false">Batal</AppButton>
        <AppButton :loading="processing" @click="submitReplicate"><template #icon><Sparkles class="h-4 w-4" /></template>Kirim Laporan</AppButton>
      </template>
    </AppModal>

    <!-- Modal "Usulkan Varian" -->
    <AppModal :open="variantOpen" title="Usulkan Varian Daerah" size="sm" @close="variantOpen = false">
      <p class="mb-3 text-sm text-muted">Punya cara berbeda yang berhasil di daerah Anda? Bagikan agar pengetahuan berkembang.</p>
      <div class="space-y-3">
        <AppInput id="vr" v-model="variantForm.region" label="Daerah" placeholder="mis. Sulawesi Selatan" required />
        <AppInput id="vt" v-model="variantForm.title" label="Ringkasan varian" placeholder="mis. Karbonisasi pakai tungku drum vertikal" required />
      </div>
      <template #footer>
        <AppButton variant="ghost" @click="variantOpen = false">Batal</AppButton>
        <AppButton :loading="processing" @click="submitVariant"><template #icon><GitBranch class="h-4 w-4" /></template>Kirim Usulan</AppButton>
      </template>
    </AppModal>
  </div>
</template>
