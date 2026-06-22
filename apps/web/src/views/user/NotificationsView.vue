<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCheck, Bell } from 'lucide-vue-next'
import { useNotificationStore } from '@/stores/notifications'
import { NOTIFICATION_ICON, relativeTime } from '@/lib/format'
import { icon } from '@/lib/icons'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import type { NotificationType } from '@/types'

const store = useNotificationStore()
const router = useRouter()
const tab = ref<'all' | 'unread'>('all')

const list = computed(() => (tab.value === 'unread' ? store.items.filter((n) => !n.is_read) : store.items))

function iconFor(type: NotificationType) {
  return icon(NOTIFICATION_ICON[type])
}

async function open(id: number, link?: string) {
  await store.markRead(id)
  if (link) router.push(link)
}

onMounted(() => {
  if (!store.items.length) store.fetch()
})
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <PageHeader title="Notifikasi" subtitle="Aktivitas terkait artikel & interaksi Anda.">
      <template #actions>
        <button class="btn-secondary btn-md" @click="store.markAllRead()"><CheckCheck class="h-4 w-4" /> Tandai semua dibaca</button>
      </template>
    </PageHeader>

    <div class="mb-4 inline-flex rounded-xl border border-line bg-surface p-1">
      <button class="rounded-lg px-4 py-1.5 text-sm font-medium transition-colors" :class="tab === 'all' ? 'bg-primary-600 text-white' : 'text-muted'" @click="tab = 'all'">Semua</button>
      <button class="rounded-lg px-4 py-1.5 text-sm font-medium transition-colors" :class="tab === 'unread' ? 'bg-primary-600 text-white' : 'text-muted'" @click="tab = 'unread'">
        Belum dibaca <span v-if="store.unreadCount" class="ml-1">({{ store.unreadCount }})</span>
      </button>
    </div>

    <LoadingBlock v-if="store.loading" />
    <template v-else>
      <ul v-if="list.length" class="space-y-2">
        <li v-for="n in list" :key="n.id">
          <button
            class="flex w-full items-start gap-3 rounded-xl border border-line bg-surface p-4 text-left transition-all hover:border-primary-200 hover:shadow-card"
            :class="{ 'border-l-4 border-l-primary-500': !n.is_read }"
            @click="open(n.id, n.data.link)"
          >
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <component :is="iconFor(n.type)" class="h-5 w-5" />
            </span>
            <span class="flex-1">
              <span class="block text-sm text-ink">{{ n.data.message }}</span>
              <span class="mt-0.5 block text-xs text-muted">{{ relativeTime(n.created_at) }}</span>
            </span>
            <span v-if="!n.is_read" class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary-500" />
          </button>
        </li>
      </ul>
      <EmptyState v-else :icon="Bell" title="Tidak ada notifikasi" description="Semua sudah Anda baca. Kerja bagus!" />
    </template>
  </div>
</template>
