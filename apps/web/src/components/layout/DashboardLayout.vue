<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, X } from 'lucide-vue-next'
import BrandLogo from './BrandLogo.vue'
import AppSidebar from './AppSidebar.vue'
import UserMenu from './UserMenu.vue'
import NotificationBell from '@/components/common/NotificationBell.vue'

const route = useRoute()
const drawer = ref(false)
watch(() => route.path, () => (drawer.value = false))
</script>

<template>
  <div class="min-h-screen bg-canvas">
    <!-- Topbar -->
    <header class="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur-md">
      <div class="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <div class="flex items-center gap-3">
          <button class="btn-ghost btn-md h-10 w-10 !px-0 lg:hidden" aria-label="Buka menu" @click="drawer = true">
            <Menu class="h-5 w-5" />
          </button>
          <BrandLogo />
        </div>
        <div class="flex items-center gap-2">
          <NotificationBell />
          <UserMenu />
        </div>
      </div>
    </header>

    <div class="mx-auto flex max-w-[1400px]">
      <!-- Sidebar desktop -->
      <div class="sticky top-16 hidden h-[calc(100vh-4rem)] w-[264px] shrink-0 border-r border-line bg-surface lg:block">
        <AppSidebar />
      </div>

      <!-- Drawer mobile -->
      <Transition name="fade">
        <div v-if="drawer" class="fixed inset-0 z-50 lg:hidden">
          <div class="absolute inset-0 bg-ink/40 backdrop-blur-sm" @click="drawer = false" />
          <div class="absolute left-0 top-0 h-full w-[280px] bg-surface shadow-modal animate-slide-up">
            <div class="flex h-16 items-center justify-between border-b border-line px-4">
              <BrandLogo />
              <button class="btn-ghost btn-md h-9 w-9 !px-0" aria-label="Tutup" @click="drawer = false"><X class="h-5 w-5" /></button>
            </div>
            <AppSidebar />
          </div>
        </div>
      </Transition>

      <!-- Konten -->
      <main class="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
