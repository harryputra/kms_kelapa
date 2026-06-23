<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { PenSquare, Eye, Wrench } from 'lucide-vue-next'
import { api } from '@/api'
import type { BlueprintSummary } from '@/types'
import { BLUEPRINT_STATUS, CAPITAL, DIFFICULTY, WASTE, formatRupiah } from '@/lib/blueprint'
import PageHeader from '@/components/common/PageHeader.vue'
import MaturityBadge from '@/components/common/MaturityBadge.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'

const items = ref<BlueprintSummary[]>([])
const loading = ref(true)

onMounted(async () => {
  items.value = await api.myBlueprints()
  loading.value = false
})
</script>

<template>
  <div>
    <PageHeader title="Cetak Biru Saya" subtitle="Kelola kontribusi resep teknis & pantau status kurasinya.">
      <template #actions>
        <RouterLink to="/dashboard/cetak-biru/baru" class="btn-primary btn-md"><PenSquare class="h-4 w-4" /> Tulis Cetak Biru</RouterLink>
      </template>
    </PageHeader>

    <LoadingBlock v-if="loading" />
    <template v-else>
      <div v-if="items.length" class="space-y-3">
        <div v-for="b in items" :key="b.id" class="premium-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div class="min-w-0 flex-1">
            <div class="mb-1 flex flex-wrap items-center gap-2">
              <span class="chip" :class="BLUEPRINT_STATUS[b.status].chip">{{ BLUEPRINT_STATUS[b.status].label }}</span>
              <MaturityBadge :maturity="b.maturity" />
            </div>
            <p class="line-clamp-1 font-medium text-ink">{{ b.title }}</p>
            <p class="text-xs text-muted">{{ WASTE[b.wasteKind].label }} → {{ b.product }} · {{ DIFFICULTY[b.difficulty].label }} · {{ CAPITAL[b.capitalTier].label }}</p>
          </div>
          <div class="flex shrink-0 items-center gap-4">
            <div class="hidden text-right sm:block">
              <p class="text-sm font-semibold text-ink">{{ formatRupiah(b.minCapital) }}</p>
              <p class="text-[11px] text-muted">{{ b.stats.replications }}× dicoba</p>
            </div>
            <RouterLink :to="`/cetak-biru/${b.id}`" class="btn-secondary btn-sm"><Eye class="h-4 w-4" /> Lihat</RouterLink>
          </div>
        </div>
      </div>
      <EmptyState v-else :icon="Wrench" title="Belum ada cetak biru" description="Bagikan teknik andalan Anda mengolah limbah kelapa menjadi cetak biru terstruktur.">
        <RouterLink to="/dashboard/cetak-biru/baru" class="btn-primary btn-md"><PenSquare class="h-4 w-4" /> Tulis Cetak Biru Pertama</RouterLink>
      </EmptyState>
    </template>
  </div>
</template>
