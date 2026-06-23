<script setup lang="ts">
import { MapPin } from 'lucide-vue-next'
import type { RegionStat } from '@/types'
import { INDONESIA_PATH, INDONESIA_VIEWBOX } from '@/lib/indonesiaMap'

defineProps<{ regions: RegionStat[]; selected: string }>()
const emit = defineEmits<{ select: [region: string] }>()
</script>

<template>
  <div class="premium-card overflow-hidden p-5">
    <div class="mb-3 flex items-center justify-between">
      <h3 class="flex items-center gap-2 font-display font-semibold text-ink"><MapPin class="h-4.5 w-4.5 text-primary-600" /> Peta Sebaran UMKM</h3>
      <button v-if="selected" class="text-xs font-medium text-primary-600 hover:underline" @click="emit('select', '')">Tampilkan semua</button>
    </div>

    <div class="relative w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary-50 to-canvas" style="aspect-ratio: 1000 / 383">
      <!-- grid laut halus -->
      <div class="absolute inset-0 opacity-30" style="background-image: radial-gradient(circle, rgba(45,106,79,0.14) 1px, transparent 1.5px); background-size: 24px 24px" />

      <!-- siluet Indonesia -->
      <svg class="absolute inset-0 h-full w-full" :viewBox="INDONESIA_VIEWBOX" preserveAspectRatio="none" aria-hidden="true">
        <path :d="INDONESIA_PATH" fill="rgba(45,106,79,0.16)" stroke="rgba(45,106,79,0.45)" stroke-width="1.2" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
      </svg>
      <span class="absolute left-3 top-2 text-[11px] font-medium uppercase tracking-wider text-primary-700/60">Indonesia</span>

      <!-- pin per wilayah -->
      <button
        v-for="r in regions"
        :key="r.region"
        class="group absolute -translate-x-1/2 -translate-y-1/2"
        :style="{ left: r.x + '%', top: r.y + '%' }"
        @click="emit('select', selected === r.region ? '' : r.region)"
      >
        <span
          class="flex items-center justify-center rounded-full border-2 border-white font-bold text-white shadow-card transition-all group-hover:scale-110"
          :class="[
            selected === r.region ? 'bg-gold-500 ring-4 ring-gold-200' : 'bg-primary-600',
            (r.listings + r.umkm) >= 3 ? 'h-9 w-9 text-sm' : 'h-7 w-7 text-xs',
          ]"
        >
          {{ r.listings + r.umkm }}
        </span>
        <span class="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink/85 px-2 py-0.5 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
          {{ r.region }} · {{ r.umkm }} UMKM · {{ r.listings }} iklan
        </span>
      </button>
    </div>

    <!-- legenda wilayah -->
    <div class="mt-4 flex flex-wrap gap-2">
      <button
        v-for="r in regions"
        :key="r.region"
        class="chip border transition-colors"
        :class="selected === r.region ? 'border-primary-600 bg-primary-600 text-white' : 'border-line text-muted hover:border-primary-200'"
        @click="emit('select', selected === r.region ? '' : r.region)"
      >
        {{ r.region }} <span class="opacity-70">({{ r.umkm }})</span>
      </button>
    </div>
  </div>
</template>
