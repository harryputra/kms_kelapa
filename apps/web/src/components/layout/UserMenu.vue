<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { onClickOutside } from '@vueuse/core'
import { LayoutDashboard, User, Bookmark, LogOut, ChevronDown, ShieldCheck, Gavel } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import AppAvatar from '@/components/ui/AppAvatar.vue'

const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()
const open = ref(false)
const root = ref<HTMLElement | null>(null)
onClickOutside(root, () => (open.value = false))

async function logout() {
  await auth.logout()
  open.value = false
  ui.success('Anda telah keluar.')
  router.push('/')
}
</script>

<template>
  <div ref="root" class="relative">
    <button class="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 transition-colors hover:bg-line/60" @click="open = !open">
      <AppAvatar :name="auth.user?.display_name ?? ''" :src="auth.user?.avatar_url" size="sm" />
      <span class="hidden text-sm font-medium text-ink sm:block">{{ auth.user?.display_name }}</span>
      <ChevronDown class="h-4 w-4 text-muted" />
    </button>

    <Transition name="dd">
      <div v-if="open" class="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-line bg-surface py-1.5 shadow-dropdown">
        <div class="border-b border-line px-4 py-2.5">
          <p class="truncate text-sm font-semibold text-ink">{{ auth.user?.display_name }}</p>
          <p class="truncate text-xs text-muted">{{ auth.user?.email }}</p>
        </div>
        <RouterLink to="/dashboard" class="menu-link" @click="open = false"><LayoutDashboard class="h-4 w-4" />Dashboard</RouterLink>
        <RouterLink v-if="auth.isModerator" to="/moderator" class="menu-link" @click="open = false"><Gavel class="h-4 w-4" />Panel Moderator</RouterLink>
        <RouterLink v-if="auth.isAdmin" to="/admin" class="menu-link" @click="open = false"><ShieldCheck class="h-4 w-4" />Panel Admin</RouterLink>
        <RouterLink to="/dashboard/bookmarks" class="menu-link" @click="open = false"><Bookmark class="h-4 w-4" />Bacaan Saya</RouterLink>
        <RouterLink to="/dashboard/profile" class="menu-link" @click="open = false"><User class="h-4 w-4" />Profil</RouterLink>
        <button class="menu-link w-full text-danger hover:bg-danger/5" @click="logout"><LogOut class="h-4 w-4" />Keluar</button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.menu-link {
  @apply flex items-center gap-2.5 px-4 py-2 text-sm text-ink transition-colors hover:bg-canvas;
}
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
