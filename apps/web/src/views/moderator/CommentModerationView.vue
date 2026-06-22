<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Check, X, MessageSquareWarning } from 'lucide-vue-next'
import { api } from '@/api'
import { useUiStore } from '@/stores/ui'
import type { Comment } from '@/types'
import PageHeader from '@/components/common/PageHeader.vue'
import AppAvatar from '@/components/ui/AppAvatar.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import { relativeTime } from '@/lib/format'

const ui = useUiStore()
const items = ref<Comment[]>([])
const loading = ref(true)

onMounted(async () => {
  items.value = await api.pendingComments()
  loading.value = false
})

async function moderate(id: number, status: 'approved' | 'rejected') {
  await api.moderateComment(id, status)
  items.value = items.value.filter((c) => c.id !== id)
  ui.success(status === 'approved' ? 'Komentar disetujui.' : 'Komentar ditolak.')
}
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <PageHeader title="Moderasi Komentar" subtitle="Tinjau komentar yang menunggu persetujuan." />

    <LoadingBlock v-if="loading" />
    <template v-else>
      <ul v-if="items.length" class="space-y-3">
        <li v-for="c in items" :key="c.id" class="premium-card p-4">
          <div class="flex items-start gap-3">
            <AppAvatar :name="c.user.display_name" size="md" />
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <p class="text-sm font-semibold text-ink">{{ c.user.display_name }}</p>
                <span class="text-xs text-muted">· {{ relativeTime(c.created_at) }}</span>
              </div>
              <p class="mt-1 text-sm text-ink/90">{{ c.content }}</p>
              <div class="mt-3 flex gap-2">
                <button class="btn-md inline-flex items-center gap-1.5 rounded-xl bg-success/10 px-4 text-sm font-medium text-success transition-colors hover:bg-success/20" @click="moderate(c.id, 'approved')">
                  <Check class="h-4 w-4" /> Setujui
                </button>
                <button class="btn-md inline-flex items-center gap-1.5 rounded-xl bg-danger/10 px-4 text-sm font-medium text-danger transition-colors hover:bg-danger/20" @click="moderate(c.id, 'rejected')">
                  <X class="h-4 w-4" /> Tolak
                </button>
              </div>
            </div>
          </div>
        </li>
      </ul>
      <EmptyState v-else :icon="MessageSquareWarning" title="Tidak ada komentar tertunda" description="Semua komentar telah dimoderasi." />
    </template>
  </div>
</template>
