<script setup lang="ts">
import { computed } from 'vue'
import { Sprout, SearchCheck, BadgeCheck, Award, Check } from 'lucide-vue-next'
import type { Maturity, ReplicationBreakdown } from '@/types'
import { MATURITY, MATURITY_ORDER } from '@/lib/blueprint'

const props = defineProps<{ maturity: Maturity; replications?: ReplicationBreakdown; successRate?: number }>()

const icons = { sprout: Sprout, 'search-check': SearchCheck, 'badge-check': BadgeCheck, award: Award }
const currentLevel = computed(() => MATURITY[props.maturity].level)
const total = computed(() =>
  props.replications ? props.replications.success + props.replications.partial + props.replications.fail : 0,
)
</script>

<template>
  <div class="premium-card p-5">
    <h3 class="mb-1 font-display font-semibold text-ink">Kematangan Pengetahuan</h3>
    <p class="mb-4 text-xs text-muted">Kepercayaan berbasis kurasi & validasi lapangan UMKM.</p>

    <!-- Tangga 4 level -->
    <ol class="relative space-y-0">
      <li v-for="(m, i) in MATURITY_ORDER" :key="m" class="flex gap-3">
        <div class="flex flex-col items-center">
          <span
            class="flex h-9 w-9 items-center justify-center rounded-full ring-4 ring-canvas transition-colors"
            :class="MATURITY[m].level <= currentLevel ? MATURITY[m].chip : 'bg-line text-muted/60'"
          >
            <Check v-if="MATURITY[m].level < currentLevel" class="h-4 w-4" />
            <component :is="icons[MATURITY[m].icon as keyof typeof icons]" v-else class="h-4 w-4" />
          </span>
          <span v-if="i < MATURITY_ORDER.length - 1" class="h-6 w-0.5" :class="MATURITY[m].level < currentLevel ? MATURITY[m].bar : 'bg-line'" />
        </div>
        <div class="pb-2 pt-1">
          <p class="text-sm font-medium" :class="MATURITY[m].level <= currentLevel ? 'text-ink' : 'text-muted/70'">
            {{ MATURITY[m].label }}
            <span v-if="MATURITY[m].level === currentLevel" class="chip ml-1 align-middle text-[10px]" :class="MATURITY[m].chip">saat ini</span>
          </p>
          <p class="text-xs text-muted">{{ MATURITY[m].short }}</p>
        </div>
      </li>
    </ol>

    <!-- Statistik replikasi -->
    <div v-if="replications" class="mt-4 border-t border-line pt-4">
      <div class="mb-2 flex items-center justify-between text-sm">
        <span class="text-muted">Validasi lapangan</span>
        <span class="font-semibold text-success">{{ successRate ?? 0 }}% berhasil</span>
      </div>
      <div class="flex h-2.5 overflow-hidden rounded-full bg-line">
        <div class="bg-success" :style="{ width: total ? `${(replications.success / total) * 100}%` : '0%' }" />
        <div class="bg-warning" :style="{ width: total ? `${(replications.partial / total) * 100}%` : '0%' }" />
        <div class="bg-danger" :style="{ width: total ? `${(replications.fail / total) * 100}%` : '0%' }" />
      </div>
      <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <span class="inline-flex items-center gap-1"><i class="inline-block h-2 w-2 rounded-full bg-success" />{{ replications.success }} berhasil</span>
        <span class="inline-flex items-center gap-1"><i class="inline-block h-2 w-2 rounded-full bg-warning" />{{ replications.partial }} sebagian</span>
        <span class="inline-flex items-center gap-1"><i class="inline-block h-2 w-2 rounded-full bg-danger" />{{ replications.fail }} gagal</span>
      </div>
    </div>
  </div>
</template>
