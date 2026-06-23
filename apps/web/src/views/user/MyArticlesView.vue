<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { PenSquare, Eye, Pencil, FileText, AlertTriangle } from 'lucide-vue-next'
import { api } from '@/api'
import type { ArticleStatus, ArticleSummary } from '@/types'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusChip from '@/components/ui/StatusChip.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import { formatDate } from '@/lib/format'

const articles = ref<ArticleSummary[]>([])
const loading = ref(true)
const filter = ref<ArticleStatus | 'all'>('all')

const filters: Array<{ key: ArticleStatus | 'all'; label: string }> = [
  { key: 'all', label: 'Semua' },
  { key: 'published', label: 'Terbit' },
  { key: 'submitted', label: 'Dikirim' },
  { key: 'revision', label: 'Revisi' },
  { key: 'draft', label: 'Draft' },
]

const filtered = computed(() =>
  filter.value === 'all' ? articles.value : articles.value.filter((a) => a.status === filter.value),
)

onMounted(async () => {
  articles.value = await api.myArticles()
  loading.value = false
})
</script>

<template>
  <div>
    <PageHeader title="Wawasan Saya" subtitle="Kelola tulisan naratif & pantau status review Anda.">
      <template #actions>
        <RouterLink to="/dashboard/submit" class="btn-primary btn-md"><PenSquare class="h-4 w-4" /> Tulis Wawasan</RouterLink>
      </template>
    </PageHeader>

    <div class="mb-5 flex flex-wrap gap-2">
      <button
        v-for="f in filters"
        :key="f.key"
        class="chip border transition-colors"
        :class="filter === f.key ? 'border-primary-600 bg-primary-600 text-white' : 'border-line bg-surface text-muted hover:border-primary-200'"
        @click="filter = f.key"
      >
        {{ f.label }}
      </button>
    </div>

    <LoadingBlock v-if="loading" />
    <template v-else>
      <div v-if="filtered.length" class="premium-card overflow-hidden">
        <table class="w-full text-sm">
          <thead class="border-b border-line bg-canvas/60 text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th class="px-5 py-3 font-semibold">Judul</th>
              <th class="hidden px-5 py-3 font-semibold sm:table-cell">Kategori</th>
              <th class="hidden px-5 py-3 font-semibold md:table-cell">Tanggal</th>
              <th class="px-5 py-3 font-semibold">Status</th>
              <th class="px-5 py-3 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr v-for="a in filtered" :key="a.id" class="transition-colors hover:bg-canvas/50">
              <td class="px-5 py-3.5">
                <p class="line-clamp-1 font-medium text-ink">{{ a.title }}</p>
                <p v-if="a.status === 'revision'" class="mt-0.5 inline-flex items-center gap-1 text-xs text-gold-600">
                  <AlertTriangle class="h-3 w-3" /> Perlu revisi — lihat catatan moderator
                </p>
              </td>
              <td class="hidden px-5 py-3.5 text-muted sm:table-cell">{{ a.category }}</td>
              <td class="hidden px-5 py-3.5 text-muted md:table-cell">{{ formatDate(a.published_at) }}</td>
              <td class="px-5 py-3.5"><StatusChip :status="a.status" /></td>
              <td class="px-5 py-3.5">
                <div class="flex items-center justify-end gap-1">
                  <RouterLink :to="`/articles/${a.id}`" class="btn-ghost btn-sm h-8 w-8 !px-0" title="Lihat"><Eye class="h-4 w-4" /></RouterLink>
                  <RouterLink to="/dashboard/submit" class="btn-ghost btn-sm h-8 w-8 !px-0" title="Edit"><Pencil class="h-4 w-4" /></RouterLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <EmptyState v-else :icon="FileText" title="Belum ada artikel di kategori ini" description="Mulai berbagi pengalaman Anda dengan menulis artikel baru.">
        <RouterLink to="/dashboard/submit" class="btn-primary btn-md"><PenSquare class="h-4 w-4" /> Tulis Artikel</RouterLink>
      </EmptyState>
    </template>
  </div>
</template>
