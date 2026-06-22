<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { onClickOutside } from '@vueuse/core'
import { Bell, CheckCheck } from 'lucide-vue-next'
import { useNotificationStore } from '@/stores/notifications'
import { NOTIFICATION_ICON, relativeTime } from '@/lib/format'
import { icon } from '@/lib/icons'

const store = useNotificationStore()
const router = useRouter()
const open = ref(false)
const root = ref<HTMLElement | null>(null)
onClickOutside(root, () => (open.value = false))

onMounted(() => {
  if (!store.items.length) store.fetch()
})

function iconFor(type: keyof typeof NOTIFICATION_ICON) {
  return icon(NOTIFICATION_ICON[type])
}

async function openItem(id: number, link?: string) {
  await store.markRead(id)
  open.value = false
  if (link) router.push(link)
}
</script>

<template>
  <div ref="root" class="relative">
    <button
      class="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink/70 transition-colors hover:bg-line/60 hover:text-ink"
      aria-label="Notifikasi"
      @click="open = !open"
    >
      <Bell class="h-5 w-5" />
      <span
        v-if="store.unreadCount"
        class="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white animate-pop"
      >
        {{ store.unreadCount > 9 ? '9+' : store.unreadCount }}
      </span>
    </button>

    <Transition name="dd">
      <div
        v-if="open"
        class="absolute right-0 z-50 mt-2 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-line bg-surface shadow-dropdown"
      >
        <div class="flex items-center justify-between border-b border-line px-4 py-3">
          <p class="font-display font-semibold text-ink">Notifikasi</p>
          <button class="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700" @click="store.markAllRead()">
            <CheckCheck class="h-3.5 w-3.5" /> Tandai semua
          </button>
        </div>
        <div class="max-h-[60vh] overflow-y-auto">
          <p v-if="!store.items.length" class="px-4 py-10 text-center text-sm text-muted">Belum ada notifikasi.</p>
          <button
            v-for="n in store.items.slice(0, 6)"
            :key="n.id"
            class="flex w-full items-start gap-3 border-b border-line/70 px-4 py-3 text-left transition-colors hover:bg-canvas"
            :class="{ 'bg-primary-50/40': !n.is_read }"
            @click="openItem(n.id, n.data.link)"
          >
            <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <component :is="iconFor(n.type)" class="h-4 w-4" />
            </span>
            <span class="flex-1">
              <span class="block text-sm leading-snug text-ink">{{ n.data.message }}</span>
              <span class="mt-0.5 block text-[11px] text-muted">{{ relativeTime(n.created_at) }}</span>
            </span>
            <span v-if="!n.is_read" class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
          </button>
        </div>
        <RouterLink to="/dashboard/notifications" class="block border-t border-line px-4 py-3 text-center text-sm font-medium text-primary-600 hover:bg-canvas" @click="open = false">
          Lihat semua notifikasi
        </RouterLink>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dd-enter-active,
.dd-leave-active {
  transition: all 0.16s ease;
}
.dd-enter-from,
.dd-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
</style>
