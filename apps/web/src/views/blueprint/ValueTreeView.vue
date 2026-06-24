<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  Layers, Shell, Droplets, Wheat, Sprout, Brush, Flower2, Flame, Filter,
  Palette, Cherry, FlaskConical, Cookie, Beef, ChevronRight, ArrowRight,
} from 'lucide-vue-next'
import { api } from '@/api'
import type { ValueNode } from '@/types'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import CoconutValueDiagram, { type WasteViz } from '@/components/common/CoconutValueDiagram.vue'

const nodes = ref<ValueNode[]>([])
const loading = ref(true)
const selected = ref('sabut')
const productsEl = ref<HTMLElement | null>(null)

const iconMap: Record<string, unknown> = {
  layers: Layers, shell: Shell, droplets: Droplets, wheat: Wheat, sprout: Sprout,
  brush: Brush, 'flower-2': Flower2, flame: Flame, filter: Filter, palette: Palette,
  cherry: Cherry, 'flask-conical': FlaskConical, cookie: Cookie, beef: Beef,
}
const ic = (name: string) => iconMap[name] ?? Sprout

const VIZ: Record<string, { color: string; soft: string; desc: string }> = {
  sabut: { color: '#B45309', soft: '#FEF3C7', desc: 'Serat kuat & ringan: cocopeat, cocofiber, pot sabut, tali, keset, media tanam.' },
  tempurung: { color: '#44403C', soft: '#E7E5E4', desc: 'Keras & tahan lama: arang aktif, briket, kerajinan, dan bahan bakar.' },
  air: { color: '#0E7490', soft: '#CFFAFE', desc: 'Cairan kaya nutrisi: nata de coco, cuka, hingga minuman fungsional.' },
  ampas: { color: '#15803D', soft: '#DCFCE7', desc: 'Sisa parutan kelapa: pakan ternak, pupuk organik, kompos, dan tepung.' },
}

const wastes = computed(() => nodes.value.filter((n) => n.type === 'waste'))
const total = computed(() => nodes.value.find((n) => n.type === 'root')?.blueprintCount ?? 0)
const wasteViz = computed<WasteViz[]>(() =>
  wastes.value.map((w) => ({ slug: w.slug, label: w.name, count: w.blueprintCount, icon: ic(w.icon) as WasteViz['icon'], ...(VIZ[w.slug] ?? { color: '#15803D', soft: '#DCFCE7', desc: '' }) })),
)

const selectedNode = computed(() => wastes.value.find((w) => w.slug === selected.value))
const selectedViz = computed(() => VIZ[selected.value])
const products = computed(() => (selectedNode.value ? nodes.value.filter((n) => n.type === 'product' && n.parentId === selectedNode.value!.id) : []))

function onSelect() {
  nextTick(() => productsEl.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))
}

onMounted(async () => {
  nodes.value = await api.valueTree()
  loading.value = false
})
</script>

<template>
  <div class="container-page py-10">
    <div class="mx-auto mb-8 max-w-2xl text-center">
      <h1 class="text-h1">Anatomi Nilai Kelapa</h1>
      <p class="mt-2 text-muted">
        Setiap bagian kelapa punya nilai. <strong>Arahkan kursor atau klik sebuah lapisan</strong> untuk melihat produk turunannya — lalu telusuri rantai nilai tiap produk.
      </p>
      <p class="mt-3 inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700">
        🥥 {{ total }} cetak biru · 4 bagian bernilai
      </p>
    </div>

    <LoadingBlock v-if="loading" />
    <div v-else>
      <CoconutValueDiagram :wastes="wasteViz" v-model:selected="selected" @select="onSelect" />

      <!-- Produk turunan dari lapisan terpilih -->
      <div ref="productsEl" class="mx-auto mt-10 max-w-5xl scroll-mt-24">
        <transition name="reveal" mode="out-in">
          <div :key="selected">
            <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 class="flex items-center gap-2 text-h2">
                <span class="inline-flex h-7 w-7 items-center justify-center rounded-lg" :style="{ background: selectedViz?.soft, color: selectedViz?.color }">
                  <component :is="ic(selectedNode?.icon ?? 'sprout')" class="h-4 w-4" />
                </span>
                {{ selectedNode?.name }} <span class="text-muted">→ produk turunan</span>
              </h2>
              <RouterLink :to="`/cetak-biru?wasteKind=${selected}`" class="inline-flex items-center gap-1 text-sm font-medium hover:underline" :style="{ color: selectedViz?.color }">
                Semua cetak biru {{ selectedNode?.name }} <ArrowRight class="h-4 w-4" />
              </RouterLink>
            </div>

            <div v-if="products.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <RouterLink
                v-for="p in products" :key="p.id" :to="`/produk/${p.slug}`"
                class="premium-card premium-card-hover flex items-center gap-3 p-4"
              >
                <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" :style="{ background: selectedViz?.soft, color: selectedViz?.color }">
                  <component :is="ic(p.icon)" class="h-5 w-5" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block truncate font-display font-semibold text-ink">{{ p.name }}</span>
                  <span class="text-xs text-muted">{{ p.blueprintCount }} cetak biru</span>
                </span>
                <ChevronRight class="h-4 w-4 shrink-0 text-muted" />
              </RouterLink>
            </div>
            <p v-else class="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">
              Belum ada produk terdokumentasi untuk bagian ini. Jadilah yang pertama menulis cetak birunya.
            </p>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reveal-enter-active { transition: opacity 0.22s ease, transform 0.22s ease; }
.reveal-enter-from { opacity: 0; transform: translateY(8px); }
.reveal-leave-active { transition: opacity 0.12s ease; }
.reveal-leave-to { opacity: 0; }
@media (prefers-reduced-motion: reduce) {
  .reveal-enter-active, .reveal-leave-active { transition: opacity 0.15s ease; }
  .reveal-enter-from { transform: none; }
}
</style>
