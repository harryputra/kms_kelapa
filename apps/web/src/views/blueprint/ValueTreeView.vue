<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Layers, Shell, Droplets, Wheat, Sprout, Brush, Flower2, Flame, Filter,
  Palette, Cherry, FlaskConical, Cookie, Beef, ChevronRight,
} from 'lucide-vue-next'
import { api } from '@/api'
import type { ValueNode } from '@/types'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import { gradientFor } from '@/lib/format'

const router = useRouter()
const nodes = ref<ValueNode[]>([])
const loading = ref(true)

const iconMap: Record<string, unknown> = {
  layers: Layers, shell: Shell, droplets: Droplets, wheat: Wheat, sprout: Sprout,
  brush: Brush, 'flower-2': Flower2, flame: Flame, filter: Filter, palette: Palette,
  cherry: Cherry, 'flask-conical': FlaskConical, cookie: Cookie, beef: Beef,
}
const ic = (name: string) => iconMap[name] ?? Sprout

const wastes = computed(() => nodes.value.filter((n) => n.type === 'waste'))
const total = computed(() => nodes.value.find((n) => n.type === 'root')?.blueprintCount ?? 0)
const productsOf = (wasteId: number) => nodes.value.filter((n) => n.type === 'product' && n.parentId === wasteId)

function openWaste(slug: string) {
  router.push(`/cetak-biru?wasteKind=${slug}`)
}
function openProduct(_wasteSlug: string, productSlug: string) {
  router.push(`/produk/${productSlug}`)
}

onMounted(async () => {
  nodes.value = await api.valueTree()
  loading.value = false
})
</script>

<template>
  <div class="container-page py-10">
    <div class="mb-8 text-center">
      <h1 class="text-h1">Pohon Nilai Kelapa</h1>
      <p class="mx-auto mt-1 max-w-2xl text-muted">
        Jelajahi peluang dari tiap bagian limbah kelapa. <strong>Klik sebuah produk</strong> untuk membuka rantai nilai lengkapnya — <strong>proses · UMKM produsen · pemasaran · ekonomi</strong>.
      </p>
    </div>

    <LoadingBlock v-if="loading" />
    <div v-else>
      <!-- Simpul akar -->
      <div class="mb-8 flex flex-col items-center">
        <div class="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 px-6 py-4 text-white shadow-card">
          <span class="text-2xl">🥥</span>
          <div class="text-left">
            <p class="font-display text-lg font-bold leading-tight">Kelapa</p>
            <p class="text-xs text-white/80">{{ total }} cetak biru · 4 jenis limbah</p>
          </div>
        </div>
        <span class="mt-2 h-6 w-0.5 bg-line" />
      </div>

      <!-- Cabang limbah -->
      <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div v-for="w in wastes" :key="w.id" class="premium-card overflow-hidden">
          <button class="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-canvas/60" @click="openWaste(w.slug)">
            <span :class="gradientFor(w.name)" class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white">
              <component :is="ic(w.icon)" class="h-6 w-6" />
            </span>
            <div class="flex-1">
              <p class="font-display font-semibold text-ink">{{ w.name }}</p>
              <p class="text-xs text-muted">{{ w.blueprintCount }} cetak biru</p>
            </div>
            <ChevronRight class="h-4 w-4 text-muted" />
          </button>
          <div class="border-t border-line p-3">
            <p class="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted/70">Produk turunan</p>
            <ul class="space-y-1">
              <li v-for="p in productsOf(w.id)" :key="p.id">
                <button
                  class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-primary-50"
                  @click="openProduct(w.slug, p.slug)"
                >
                  <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-primary-600"><component :is="ic(p.icon)" class="h-4 w-4" /></span>
                  <span class="flex-1 font-medium text-ink">{{ p.name }}</span>
                  <span class="chip" :class="p.blueprintCount ? 'bg-primary-50 text-primary-700' : 'bg-line text-muted'">{{ p.blueprintCount }}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
