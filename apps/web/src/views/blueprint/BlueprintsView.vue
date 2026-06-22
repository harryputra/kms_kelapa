<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { Search, SlidersHorizontal, X, Network, FileSearch } from 'lucide-vue-next'
import { useDebounceFn } from '@vueuse/core'
import { api } from '@/api'
import type { BlueprintSummary, CapitalTier, Difficulty, Maturity, WasteKind } from '@/types'
import { CAPITAL, DIFFICULTY, MATURITY, WASTE } from '@/lib/blueprint'
import BlueprintCard from '@/components/common/BlueprintCard.vue'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const route = useRoute()
const router = useRouter()

const list = ref<BlueprintSummary[]>([])
const loading = ref(true)
const showFilters = ref(false)

interface Facets {
  search: string
  wasteKind: WasteKind | ''
  product: string
  difficulty: Difficulty | ''
  capitalTier: CapitalTier | ''
  maturity: Maturity | ''
  sort: 'popular' | 'newest' | 'maturity' | 'capital'
}
type ToggleKey = 'wasteKind' | 'difficulty' | 'capitalTier' | 'maturity'

const facets = reactive<Facets>({
  search: '',
  wasteKind: (route.query.wasteKind as WasteKind | '') || '',
  product: (route.query.product as string) || '',
  difficulty: '',
  capitalTier: '',
  maturity: '',
  sort: 'popular',
})

const wasteKinds = Object.keys(WASTE) as WasteKind[]
const difficulties = Object.keys(DIFFICULTY) as Difficulty[]
const capitals = Object.keys(CAPITAL) as CapitalTier[]
const maturities = Object.keys(MATURITY) as Maturity[]

async function load() {
  loading.value = true
  try {
    list.value = await api.listBlueprints({ ...facets })
  } finally {
    loading.value = false
  }
}
const debouncedLoad = useDebounceFn(load, 300)

function toggle<K extends ToggleKey>(key: K, value: Facets[K]) {
  facets[key] = (facets[key] === value ? '' : value) as Facets[K]
  load()
}
function resetFacets() {
  facets.wasteKind = ''
  facets.product = ''
  facets.difficulty = ''
  facets.capitalTier = ''
  facets.maturity = ''
  facets.search = ''
  load()
}

const activeCount = () =>
  [facets.wasteKind, facets.product, facets.difficulty, facets.capitalTier, facets.maturity].filter(Boolean).length

watch(() => facets.sort, load)
watch(
  () => route.query,
  (q) => {
    facets.wasteKind = (q.wasteKind as WasteKind) ?? ''
    facets.product = (q.product as string) ?? ''
    load()
  },
)
onMounted(load)
</script>

<template>
  <div class="container-page py-10">
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-h1">Cetak Biru Teknis</h1>
        <p class="mt-1 max-w-2xl text-muted">
          Resep teknis terstruktur — bahan, langkah, mutu, K3, dan hitungan ekonomi — siap direplikasi & diskalakan UMKM.
        </p>
      </div>
      <RouterLink to="/pohon-nilai" class="btn-secondary btn-md"><Network class="h-4 w-4" /> Jelajah Pohon Nilai</RouterLink>
    </div>

    <!-- Search + sort -->
    <div class="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
      <div class="relative flex-1">
        <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input v-model="facets.search" type="search" placeholder="Cari produk, teknik, atau bahan baku…" class="field pl-10" @input="debouncedLoad" />
      </div>
      <button class="btn-secondary btn-md lg:hidden" @click="showFilters = !showFilters">
        <SlidersHorizontal class="h-4 w-4" /> Filter
        <span v-if="activeCount()" class="chip bg-primary-600 px-1.5 text-[10px] text-white">{{ activeCount() }}</span>
      </button>
      <select v-model="facets.sort" class="field lg:w-48">
        <option value="popular">Paling tersimpan</option>
        <option value="maturity">Paling matang</option>
        <option value="capital">Modal termurah</option>
        <option value="newest">Terbaru</option>
      </select>
    </div>

    <div class="grid gap-8 lg:grid-cols-[260px_1fr]">
      <!-- FACETED FILTER -->
      <aside class="lg:block" :class="showFilters ? 'block' : 'hidden'">
        <div class="premium-card sticky top-20 space-y-5 p-5">
          <div class="flex items-center justify-between">
            <h2 class="font-display font-semibold text-ink">Filter</h2>
            <button v-if="activeCount()" class="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline" @click="resetFacets">
              <X class="h-3 w-3" /> Reset
            </button>
          </div>

          <div>
            <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted/70">Jenis Limbah</p>
            <div class="flex flex-wrap gap-1.5">
              <button v-for="w in wasteKinds" :key="w" class="chip border transition-colors" :class="facets.wasteKind === w ? 'border-primary-600 bg-primary-600 text-white' : 'border-line text-muted hover:border-primary-200'" @click="toggle('wasteKind', w)">
                {{ WASTE[w].label }}
              </button>
            </div>
          </div>

          <div>
            <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted/70">Tingkat Kesulitan</p>
            <div class="flex flex-wrap gap-1.5">
              <button v-for="d in difficulties" :key="d" class="chip border transition-colors" :class="facets.difficulty === d ? 'border-primary-600 bg-primary-600 text-white' : 'border-line text-muted hover:border-primary-200'" @click="toggle('difficulty', d)">
                {{ DIFFICULTY[d].label }}
              </button>
            </div>
          </div>

          <div>
            <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted/70">Modal</p>
            <div class="flex flex-wrap gap-1.5">
              <button v-for="c in capitals" :key="c" class="chip border transition-colors" :class="facets.capitalTier === c ? 'border-primary-600 bg-primary-600 text-white' : 'border-line text-muted hover:border-primary-200'" @click="toggle('capitalTier', c)">
                {{ CAPITAL[c].label.replace('Modal ', '') }}
              </button>
            </div>
          </div>

          <div>
            <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted/70">Kematangan</p>
            <div class="flex flex-wrap gap-1.5">
              <button v-for="m in maturities" :key="m" class="chip border transition-colors" :class="facets.maturity === m ? 'border-primary-600 bg-primary-600 text-white' : 'border-line text-muted hover:border-primary-200'" @click="toggle('maturity', m)">
                {{ MATURITY[m].label }}
              </button>
            </div>
          </div>
        </div>
      </aside>

      <!-- HASIL -->
      <div>
        <div v-if="loading" class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <SkeletonCard v-for="i in 6" :key="i" />
        </div>
        <template v-else>
          <p class="mb-4 text-sm text-muted">{{ list.length }} cetak biru ditemukan</p>
          <div v-if="list.length" class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <BlueprintCard v-for="b in list" :key="b.id" :blueprint="b" />
          </div>
          <EmptyState v-else :icon="FileSearch" title="Tidak ada cetak biru yang cocok" description="Coba longgarkan filter atau ubah kata kunci pencarian.">
            <button class="btn-secondary btn-md" @click="resetFacets">Reset filter</button>
          </EmptyState>
        </template>
      </div>
    </div>
  </div>
</template>
