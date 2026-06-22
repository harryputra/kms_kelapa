<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Search, ScrollText } from 'lucide-vue-next'
import { api } from '@/api'
import type { AuditLog } from '@/types'
import PageHeader from '@/components/common/PageHeader.vue'
import AppAvatar from '@/components/ui/AppAvatar.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'

const logs = ref<AuditLog[]>([])
const loading = ref(true)
const search = ref('')

const filtered = computed(() =>
  logs.value.filter(
    (l) =>
      !search.value ||
      l.action.includes(search.value.toLowerCase()) ||
      l.description.toLowerCase().includes(search.value.toLowerCase()) ||
      (l.user?.display_name ?? '').toLowerCase().includes(search.value.toLowerCase()),
  ),
)

function fmt(iso: string) {
  return new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}

onMounted(async () => {
  logs.value = await api.auditLogs()
  loading.value = false
})
</script>

<template>
  <div>
    <PageHeader title="Audit Log" subtitle="Jejak aktivitas penting sistem — hanya-baca." />

    <div class="relative mb-5 max-w-md">
      <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input v-model="search" type="search" placeholder="Cari aksi, deskripsi, atau pengguna…" class="field pl-10" />
    </div>

    <LoadingBlock v-if="loading" />
    <template v-else>
      <div v-if="filtered.length" class="premium-card overflow-x-auto">
        <table class="w-full min-w-[680px] text-sm">
          <thead class="border-b border-line bg-canvas/60 text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th class="px-5 py-3 font-semibold">Waktu</th>
              <th class="px-5 py-3 font-semibold">Pengguna</th>
              <th class="px-5 py-3 font-semibold">Aksi</th>
              <th class="px-5 py-3 font-semibold">Deskripsi</th>
              <th class="px-5 py-3 font-semibold">IP</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr v-for="l in filtered" :key="l.id" class="transition-colors hover:bg-canvas/50">
              <td class="whitespace-nowrap px-5 py-3 text-muted">{{ fmt(l.created_at) }}</td>
              <td class="px-5 py-3">
                <div class="flex items-center gap-2">
                  <AppAvatar :name="l.user?.display_name ?? 'Sistem'" size="sm" />
                  <span class="text-ink">{{ l.user?.display_name ?? 'Sistem' }}</span>
                </div>
              </td>
              <td class="px-5 py-3"><code class="rounded bg-canvas px-2 py-1 text-[11px] text-primary-700">{{ l.action }}</code></td>
              <td class="px-5 py-3 text-muted">{{ l.description }}</td>
              <td class="px-5 py-3 text-muted">{{ l.ip_address }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <EmptyState v-else :icon="ScrollText" title="Tidak ada log" description="Tidak ada entri yang cocok dengan pencarian." />
    </template>
  </div>
</template>
