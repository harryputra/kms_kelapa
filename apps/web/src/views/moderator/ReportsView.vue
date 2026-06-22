<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ShieldCheck, Trash2, FileText, MessageSquare, Flag } from 'lucide-vue-next'
import { api } from '@/api'
import { useUiStore } from '@/stores/ui'
import type { ReportItem, ReportReason } from '@/types'
import PageHeader from '@/components/common/PageHeader.vue'
import AppAvatar from '@/components/ui/AppAvatar.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import { relativeTime } from '@/lib/format'

const ui = useUiStore()
const items = ref<ReportItem[]>([])
const loading = ref(true)

const reasonLabel: Record<ReportReason, string> = {
  spam: 'Spam',
  inappropriate: 'Tidak pantas',
  misinformation: 'Informasi salah',
  other: 'Lainnya',
}

onMounted(async () => {
  items.value = await api.reports()
  loading.value = false
})

async function resolve(id: number, action: 'ignore' | 'delete') {
  await api.resolveReport(id)
  items.value = items.value.filter((r) => r.id !== id)
  ui.success(action === 'ignore' ? 'Laporan diabaikan.' : 'Konten dihapus & laporan diselesaikan.')
}
</script>

<template>
  <div>
    <PageHeader title="Laporan Konten" subtitle="Tangani artikel & komentar yang dilaporkan komunitas." />

    <LoadingBlock v-if="loading" />
    <template v-else>
      <div v-if="items.length" class="space-y-3">
        <div v-for="r in items" :key="r.id" class="premium-card p-4">
          <div class="flex flex-wrap items-start gap-4">
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-danger">
              <component :is="r.entity_type === 'article' ? FileText : MessageSquare" class="h-5 w-5" />
            </span>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="chip bg-danger/10 text-danger">{{ reasonLabel[r.reason] }}</span>
                <span class="text-xs capitalize text-muted">{{ r.entity_type === 'article' ? 'Artikel' : 'Komentar' }}</span>
              </div>
              <p class="mt-1.5 line-clamp-1 text-sm font-medium text-ink">"{{ r.entity_preview }}"</p>
              <p v-if="r.description" class="mt-0.5 text-sm text-muted">{{ r.description }}</p>
              <div class="mt-2 flex items-center gap-2 text-xs text-muted">
                <AppAvatar :name="r.reporter.display_name" size="sm" />
                Dilaporkan oleh {{ r.reporter.display_name }} · {{ relativeTime(r.created_at) }}
              </div>
            </div>
            <div class="flex gap-2">
              <button class="btn-secondary btn-sm" @click="resolve(r.id, 'ignore')"><ShieldCheck class="h-4 w-4" /> Abaikan</button>
              <button class="btn-danger btn-sm" @click="resolve(r.id, 'delete')"><Trash2 class="h-4 w-4" /> Hapus Konten</button>
            </div>
          </div>
        </div>
      </div>
      <EmptyState v-else :icon="Flag" title="Tidak ada laporan" description="Komunitas dalam keadaan sehat. 🌱" />
    </template>
  </div>
</template>
