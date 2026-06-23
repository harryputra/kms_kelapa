<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Menu, X } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import BrandLogo from './BrandLogo.vue'
import UserMenu from './UserMenu.vue'
import NotificationBell from '@/components/common/NotificationBell.vue'

const auth = useAuthStore()
const route = useRoute()
const mobileOpen = ref(false)

const nav = [
  { label: 'Beranda', to: '/' },
  { label: 'Cetak Biru', to: '/cetak-biru' },
  { label: 'Pohon Nilai', to: '/pohon-nilai' },
  { label: 'Tanya Pakar', to: '/tanya' },
  { label: 'Wawasan', to: '/articles' },
  { label: 'Forum', to: '/forum' },
]
const isActive = (to: string) => (to === '/' ? route.path === '/' : route.path.startsWith(to))
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-line/80 bg-surface/85 backdrop-blur-md">
    <div class="container-page flex h-16 items-center justify-between gap-4">
      <div class="flex items-center gap-8">
        <BrandLogo />
        <nav class="hidden items-center gap-1 lg:flex">
          <RouterLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            class="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            :class="isActive(item.to) ? 'text-primary-700' : 'text-muted hover:text-ink'"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
      </div>

      <div class="flex items-center gap-2">
        <template v-if="auth.isAuthenticated">
          <NotificationBell />
          <UserMenu />
        </template>
        <template v-else>
          <RouterLink to="/login" class="btn-ghost btn-md hidden sm:inline-flex">Masuk</RouterLink>
          <RouterLink to="/register" class="btn-primary btn-md">Daftar Gratis</RouterLink>
        </template>
        <button class="btn-ghost btn-md h-10 w-10 !px-0 lg:hidden" aria-label="Menu" @click="mobileOpen = !mobileOpen">
          <component :is="mobileOpen ? X : Menu" class="h-5 w-5" />
        </button>
      </div>
    </div>

    <Transition name="slide">
      <nav v-if="mobileOpen" class="border-t border-line bg-surface lg:hidden">
        <div class="container-page flex flex-col py-2">
          <RouterLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            class="rounded-lg px-3 py-2.5 text-sm font-medium"
            :class="isActive(item.to) ? 'bg-primary-50 text-primary-700' : 'text-muted'"
            @click="mobileOpen = false"
          >
            {{ item.label }}
          </RouterLink>
          <RouterLink v-if="!auth.isAuthenticated" to="/login" class="rounded-lg px-3 py-2.5 text-sm font-medium text-muted" @click="mobileOpen = false">Masuk</RouterLink>
        </div>
      </nav>
    </Transition>
  </header>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
