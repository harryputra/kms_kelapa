<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Eye, Check, X, Stamp } from 'lucide-vue-next'
import { api } from '@/api'
import { useUiStore } from '@/stores/ui'
import type { BlueprintSummary } from '@/types'
import { CAPITAL, DIFFICULTY, WASTE, formatRupiah } from '@/lib/blueprint'
import PageHeader from '@/components/common/PageHeader.vue'
import AppAvatar from '@/components/ui/AppAvatar.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'

const ui = useUiStore()
const items = ref<BlueprintSummary[]>([])
const loading = ref(true)

onMounted(async () => {
  items.value = await api.submittedBlueprints()
  loading.value = false
})

async function curate(id: number, action: 'approve' | 'reject') {
  await api.curateBlueprint(id, action)
  items.value = items.value.filter((b) => b.id !== id)
  ui.success(action === 'approve' ? 'Cetak biru diterbitkan (kematangan: Terkurasi).' : 'Cetak biru ditolak & dikembalikan ke penulis.')
}
</script>

<template>
  <div>
    <PageHeader title="Kurasi Cetak Biru" subtitle="Telaah kontribusi UMKM — akurasi teknis & keselamatan (K3) — sebelum tayang." />

    <LoadingBlock v-if="loading" />
    <template v-else>
      <div v-if="items.length" class="space-y-3">
        <div v-for="b in items" :key="b.id" class="premium-card p-4">
          <div class="flex flex-wrap items-start gap-4">
            <div class="min-w-0 flex-1">
              <p class="font-medium text-ink">{{ b.title }}</p>
              <p class="mt-0.5 text-sm text-muted">{{ b.excerpt }}</p>
              <div class="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
                <span class="inline-flex items-center gap-1.5"><AppAvatar :name="b.author.display_name" size="sm" />{{ b.author.display_name }}</span>
                <span class="chip bg-primary-50 text-primary-700">{{ WASTE[b.wasteKind].label }} → {{ b.product }}</span>
                <span class="chip" :class="DIFFICULTY[b.difficulty].chip">{{ DIFFICULTY[b.difficulty].label }}</span>
                <span>{{ formatRupiah(b.minCapital) }} · {{ CAPITAL[b.capitalTier].label }}</span>
              </div>
            </div>
            <div class="flex shrink-0 items-center gap-2">
              <RouterLink :to="`/cetak-biru/${b.id}`" class="btn-ghost btn-sm" target="_blank"><Eye class="h-4 w-4" /> Telaah</RouterLink>
              <button class="btn-md inline-flex items-center gap-1.5 rounded-xl bg-danger/10 px-3 text-sm font-medium text-danger transition-colors hover:bg-danger/20" @click="curate(b.id, 'reject')"><X class="h-4 w-4" /> Tolak</button>
              <button class="btn-primary btn-md" @click="curate(b.id, 'approve')"><Check class="h-4 w-4" /> Terbitkan</button>
            </div>
          </div>
        </div>
      </div>
      <EmptyState v-else :icon="Stamp" title="Tidak ada cetak biru menunggu kurasi" description="Semua kontribusi telah ditelaah. Antrean bersih! 🌱" />
    </template>
  </div>
</template>
