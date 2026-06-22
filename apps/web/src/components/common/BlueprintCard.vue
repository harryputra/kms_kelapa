<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Wallet, Clock, Repeat2 } from 'lucide-vue-next'
import type { BlueprintSummary } from '@/types'
import { CAPITAL, DIFFICULTY, WASTE, formatRupiah } from '@/lib/blueprint'
import ArticleCover from '@/components/ui/ArticleCover.vue'
import MaturityBadge from './MaturityBadge.vue'

defineProps<{ blueprint: BlueprintSummary }>()
</script>

<template>
  <RouterLink :to="`/cetak-biru/${blueprint.id}`" class="premium-card premium-card-hover group flex flex-col overflow-hidden">
    <ArticleCover :seed="blueprint.title">
      <span class="absolute left-3 top-3"><MaturityBadge :maturity="blueprint.maturity" /></span>
    </ArticleCover>
    <div class="flex flex-1 flex-col p-4">
      <p class="mb-1.5 flex items-center gap-1 text-xs font-medium text-primary-700">
        {{ WASTE[blueprint.wasteKind].label }} <span class="text-muted">→</span> {{ blueprint.product }}
      </p>
      <h3 class="line-clamp-2 font-display text-[17px] font-semibold leading-snug text-ink transition-colors group-hover:text-primary-700">
        {{ blueprint.title }}
      </h3>
      <p class="mt-1.5 line-clamp-2 text-sm text-muted">{{ blueprint.excerpt }}</p>

      <!-- Fakta teknis (pembeda dari artikel biasa) -->
      <div class="mt-3 flex flex-wrap gap-1.5">
        <span class="chip" :class="DIFFICULTY[blueprint.difficulty].chip">{{ DIFFICULTY[blueprint.difficulty].label }}</span>
        <span class="chip" :class="CAPITAL[blueprint.capitalTier].chip">{{ CAPITAL[blueprint.capitalTier].label }}</span>
      </div>

      <div class="mt-auto flex items-center justify-between gap-2 pt-4 text-xs text-muted">
        <span class="inline-flex items-center gap-1"><Wallet class="h-3.5 w-3.5" />{{ formatRupiah(blueprint.minCapital) }}</span>
        <span class="inline-flex items-center gap-1"><Clock class="h-3.5 w-3.5" />{{ blueprint.estTime }}</span>
        <span class="inline-flex items-center gap-1"><Repeat2 class="h-3.5 w-3.5" />{{ blueprint.stats.replications }}× coba</span>
      </div>
    </div>
  </RouterLink>
</template>
