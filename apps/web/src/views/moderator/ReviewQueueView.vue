<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ClipboardCheck } from 'lucide-vue-next'
import { api } from '@/api'
import type { ArticleSummary } from '@/types'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusChip from '@/components/ui/StatusChip.vue'
import AppAvatar from '@/components/ui/AppAvatar.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import { relativeTime } from '@/lib/format'

const items = ref<ArticleSummary[]>([])
const loading = ref(true)

onMounted(async () => {
  items.value = await api.reviewQueue()
  loading.value = false
})
</script>

<template>
  <div>
    <PageHeader title="Antrean Review" subtitle="Artikel kiriman pengguna yang menunggu tinjauan Anda." />

    <LoadingBlock v-if="loading" />
    <template v-else>
      <div v-if="items.length" class="premium-card overflow-hidden">
        <table class="w-full text-sm">
          <thead class="border-b border-line bg-canvas/60 text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th class="px-5 py-3 font-semibold">Judul</th>
              <th class="hidden px-5 py-3 font-semibold sm:table-cell">Penulis</th>
              <th class="hidden px-5 py-3 font-semibold md:table-cell">Dikirim</th>
              <th class="px-5 py-3 font-semibold">Status</th>
              <th class="px-5 py-3 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr v-for="a in items" :key="a.id" class="transition-colors hover:bg-canvas/50">
              <td class="px-5 py-3.5">
                <p class="line-clamp-1 font-medium text-ink">{{ a.title }}</p>
                <p class="text-xs text-muted sm:hidden">{{ a.author.display_name }}</p>
              </td>
              <td class="hidden px-5 py-3.5 sm:table-cell">
                <div class="flex items-center gap-2">
                  <AppAvatar :name="a.author.display_name" size="sm" />
                  <span class="text-muted">{{ a.author.display_name }}</span>
                </div>
              </td>
              <td class="hidden px-5 py-3.5 text-muted md:table-cell">{{ relativeTime(a.published_at ?? new Date().toISOString()) }}</td>
              <td class="px-5 py-3.5"><StatusChip :status="a.status" /></td>
              <td class="px-5 py-3.5 text-right">
                <RouterLink :to="`/moderator/review/${a.id}`" class="btn-primary btn-sm">Tinjau</RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <EmptyState v-else :icon="ClipboardCheck" title="Antrean review kosong, bagus! 🎉" description="Semua kiriman telah ditinjau. Saatnya rehat sejenak." />
    </template>
  </div>
</template>
