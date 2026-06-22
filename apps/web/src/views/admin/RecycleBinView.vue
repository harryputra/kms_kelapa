<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RotateCcw, FileText, MessageSquare, User, Trash2 } from 'lucide-vue-next'
import { api } from '@/api'
import { useUiStore } from '@/stores/ui'
import type { RecycleBinItem } from '@/types'
import PageHeader from '@/components/common/PageHeader.vue'
import AppAvatar from '@/components/ui/AppAvatar.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import { formatDate } from '@/lib/format'

const ui = useUiStore()
const items = ref<RecycleBinItem[]>([])
const loading = ref(true)
const filter = ref<'all' | RecycleBinItem['type']>('all')

const tabs = [
  { key: 'all', label: 'Semua' },
  { key: 'articles', label: 'Artikel' },
  { key: 'comments', label: 'Komentar' },
  { key: 'users', label: 'Pengguna' },
] as const

const typeIcon = { articles: FileText, comments: MessageSquare, users: User }
const filtered = computed(() => (filter.value === 'all' ? items.value : items.value.filter((i) => i.type === filter.value)))

onMounted(async () => {
  items.value = await api.recycleBin()
  loading.value = false
})

async function restore(item: RecycleBinItem) {
  await api.restore(item.id)
  items.value = items.value.filter((i) => i.id !== item.id)
  ui.success('Item berhasil dipulihkan.')
}
</script>

<template>
  <div>
    <PageHeader title="Recycle Bin" subtitle="Pulihkan data terhapus. Otomatis dibersihkan permanen setelah 30 hari." />

    <div class="mb-5 inline-flex flex-wrap gap-2">
      <button
        v-for="t in tabs"
        :key="t.key"
        class="chip border transition-colors"
        :class="filter === t.key ? 'border-primary-600 bg-primary-600 text-white' : 'border-line bg-surface text-muted hover:border-primary-200'"
        @click="filter = t.key"
      >
        {{ t.label }}
      </button>
    </div>

    <LoadingBlock v-if="loading" />
    <template v-else>
      <div v-if="filtered.length" class="space-y-2">
        <div v-for="item in filtered" :key="`${item.type}-${item.id}`" class="flex items-center gap-3 rounded-xl border border-line bg-surface p-4">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-line/70 text-muted">
            <component :is="typeIcon[item.type]" class="h-5 w-5" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="line-clamp-1 font-medium text-ink">{{ item.title }}</p>
            <div class="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
              <AppAvatar :name="item.deleted_by.display_name" size="sm" />
              Dihapus oleh {{ item.deleted_by.display_name }} · {{ formatDate(item.deleted_at) }}
            </div>
          </div>
          <button class="btn-secondary btn-sm" @click="restore(item)"><RotateCcw class="h-4 w-4" /> Pulihkan</button>
        </div>
      </div>
      <EmptyState v-else :icon="Trash2" title="Recycle bin kosong" description="Tidak ada data terhapus untuk dipulihkan." />
    </template>
  </div>
</template>
