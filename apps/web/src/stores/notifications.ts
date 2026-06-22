import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { api } from '@/api'
import type { AppNotification } from '@/types'

export const useNotificationStore = defineStore('notifications', () => {
  const items = ref<AppNotification[]>([])
  const loading = ref(false)
  const unreadCount = computed(() => items.value.filter((n) => !n.is_read).length)

  async function fetch() {
    loading.value = true
    try {
      items.value = await api.notifications()
    } finally {
      loading.value = false
    }
  }

  async function markRead(id: number) {
    const n = items.value.find((x) => x.id === id)
    if (n && !n.is_read) {
      n.is_read = true
      await api.markRead(id)
    }
  }

  async function markAllRead() {
    items.value.forEach((n) => (n.is_read = true))
    await api.markAllRead()
  }

  return { items, loading, unreadCount, fetch, markRead, markAllRead }
})
