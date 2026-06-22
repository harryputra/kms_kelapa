<script setup lang="ts">
import { computed, ref } from 'vue'
import { Calculator, TrendingUp, Target } from 'lucide-vue-next'
import type { EconomicModel } from '@/types'
import { computeEconomics, formatRupiah } from '@/lib/blueprint'

const props = defineProps<{ economic: EconomicModel; wasteLabel: string; product: string }>()

const inputKg = ref(props.economic.batchInputKg * 5) // default skala 5 batch
const result = computed(() => computeEconomics(props.economic, inputKg.value))
</script>

<template>
  <div class="premium-card p-6">
    <div class="mb-1 flex items-center gap-2">
      <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600"><Calculator class="h-5 w-5" /></span>
      <h3 class="font-display font-semibold text-ink">Kalkulator Kelayakan & Skala</h3>
    </div>
    <p class="mb-5 text-sm text-muted">Geser jumlah {{ wasteLabel.toLowerCase() }} yang Anda miliki per minggu — hitung otomatis hasil & titik impas.</p>

    <div class="rounded-xl bg-canvas p-4">
      <div class="flex items-end justify-between">
        <label class="text-sm font-medium text-ink">Limbah tersedia / minggu</label>
        <span class="font-display text-xl font-bold text-primary-700">{{ inputKg }} kg</span>
      </div>
      <input
        v-model.number="inputKg"
        type="range"
        :min="economic.batchInputKg"
        :max="economic.batchInputKg * 40"
        :step="economic.batchInputKg"
        class="mt-3 w-full accent-primary-600"
      />
      <div class="mt-1 flex justify-between text-[11px] text-muted">
        <span>{{ economic.batchInputKg }} kg</span>
        <span>{{ economic.batchInputKg * 40 }} kg</span>
      </div>
    </div>

    <!-- Hasil -->
    <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div class="rounded-xl border border-line p-3">
        <p class="text-xs text-muted">Batch / minggu</p>
        <p class="mt-0.5 font-display text-lg font-bold text-ink">{{ result.batches }}×</p>
      </div>
      <div class="rounded-xl border border-line p-3">
        <p class="text-xs text-muted">Hasil {{ product }}</p>
        <p class="mt-0.5 font-display text-lg font-bold text-ink">{{ result.outputKg }} kg</p>
      </div>
      <div class="rounded-xl border border-line p-3">
        <p class="text-xs text-muted">Omzet / minggu</p>
        <p class="mt-0.5 font-display text-lg font-bold text-ink">{{ formatRupiah(result.revenue) }}</p>
      </div>
      <div class="rounded-xl border border-line bg-success/5 p-3">
        <p class="text-xs text-success">Laba kotor / minggu</p>
        <p class="mt-0.5 font-display text-lg font-bold text-success">{{ formatRupiah(result.grossProfit) }}</p>
      </div>
    </div>

    <!-- Modal & BEP -->
    <div class="mt-4 grid gap-3 sm:grid-cols-2">
      <div class="flex items-center gap-3 rounded-xl bg-canvas p-3.5">
        <TrendingUp class="h-5 w-5 shrink-0 text-primary-600" />
        <div>
          <p class="text-xs text-muted">Modal alat (sekali)</p>
          <p class="text-sm font-semibold text-ink">{{ formatRupiah(result.capital) }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3 rounded-xl bg-canvas p-3.5">
        <Target class="h-5 w-5 shrink-0 text-gold-600" />
        <div>
          <p class="text-xs text-muted">Titik impas (BEP)</p>
          <p class="text-sm font-semibold text-ink">
            {{ result.bepBatches }} batch
            <span class="font-normal text-muted">≈ {{ result.batches ? Math.ceil(result.bepBatches / result.batches) : '—' }} minggu</span>
          </p>
        </div>
      </div>
    </div>

    <p class="mt-4 text-[11px] leading-relaxed text-muted">
      *Estimasi berbasis parameter cetak biru; harga & hasil aktual dapat berbeda menurut kondisi lapangan, mutu bahan, dan pasar setempat.
    </p>
  </div>
</template>
