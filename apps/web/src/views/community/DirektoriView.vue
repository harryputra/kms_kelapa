<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { Search, BadgeCheck, MapPin, Phone, Lock, Wrench, Users } from 'lucide-vue-next'
import { useDebounceFn } from '@vueuse/core'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import type { RegionStat, UmkmDirectoryEntry } from '@/types'
import PageHeader from '@/components/common/PageHeader.vue'
import SebaranMap from '@/components/common/SebaranMap.vue'
import AppAvatar from '@/components/ui/AppAvatar.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const auth = useAuthStore()
const entries = ref<UmkmDirectoryEntry[]>([])
const regions = ref<RegionStat[]>([])
const loading = ref(true)
const selected = ref('')
const search = ref('')

async function load() {
  loading.value = true
  try {
    entries.value = await api.listDirectory({ region: selected.value, search: search.value })
  } finally {
    loading.value = false
  }
}
const debouncedLoad = useDebounceFn(load, 300)
watch(selected, load)

onMounted(async () => {
  regions.value = await api.regionStats()
  load()
})
</script>

<template>
  <div class="container-page py-10">
    <PageHeader title="Direktori UMKM Kelapa" subtitle="Temukan mitra, pemasok, dan pembeli di seluruh sentra kelapa Indonesia." />

    <div class="mb-6">
      <SebaranMap :regions="regions" :selected="selected" @select="selected = $event" />
    </div>

    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div class="relative flex-1">
        <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input v-model="search" type="search" placeholder="Cari nama UMKM, produk, atau bahan…" class="field pl-10" @input="debouncedLoad" />
      </div>
      <p class="text-sm text-muted">{{ entries.length }} UMKM<span v-if="selected"> · {{ selected }}</span></p>
    </div>

    <LoadingBlock v-if="loading" />
    <template v-else>
      <div v-if="entries.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="d in entries" :key="d.id" class="premium-card flex flex-col p-5">
          <div class="flex items-start gap-3">
            <AppAvatar :name="d.businessName" size="lg" />
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <h3 class="truncate font-display font-semibold text-ink">{{ d.businessName }}</h3>
                <BadgeCheck v-if="d.verified" class="h-4 w-4 shrink-0 text-info" />
              </div>
              <p class="inline-flex items-center gap-1 text-xs text-muted"><MapPin class="h-3 w-3" />{{ d.region }}</p>
            </div>
          </div>

          <p class="mt-3 line-clamp-2 text-sm text-muted">{{ d.bio }}</p>

          <div class="mt-3 space-y-1.5 text-xs">
            <div class="flex flex-wrap items-center gap-1">
              <span class="text-muted">Limbah:</span>
              <span v-for="m in d.materials" :key="m" class="chip bg-primary-50 text-primary-700">{{ m }}</span>
            </div>
            <div class="flex flex-wrap items-center gap-1">
              <span class="text-muted">Produk:</span>
              <span v-for="p in d.products" :key="p" class="chip bg-gold-100 text-gold-700">{{ p }}</span>
            </div>
          </div>

          <div class="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3 text-xs">
            <span class="inline-flex items-center gap-1 text-muted"><Wrench class="h-3 w-3" />{{ d.blueprintsCount }} cetak biru · {{ d.capacity }}</span>
          </div>
          <p v-if="auth.isAuthenticated" class="mt-2 inline-flex items-center gap-1 text-xs text-primary-600"><Phone class="h-3 w-3" />{{ d.contact }}</p>
          <RouterLink v-else to="/login" class="mt-2 inline-flex items-center gap-1 text-xs text-muted hover:text-primary-600"><Lock class="h-3 w-3" />Login untuk lihat kontak</RouterLink>
        </div>
      </div>
      <EmptyState v-else :icon="Users" title="Tidak ada UMKM ditemukan" description="Coba pilih wilayah lain atau ubah kata kunci.">
        <button class="btn-secondary btn-md" @click="selected = ''; search = ''; load()">Reset</button>
      </EmptyState>
    </template>
  </div>
</template>
