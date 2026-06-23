<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Menu, X, ChevronDown, MessagesSquare, MessageCircleQuestion, Repeat2, Users, Bot } from 'lucide-vue-next'
import { onClickOutside } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import BrandLogo from './BrandLogo.vue'
import UserMenu from './UserMenu.vue'
import NotificationBell from '@/components/common/NotificationBell.vue'

const auth = useAuthStore()
const route = useRoute()
const mobileOpen = ref(false)
const komunitasOpen = ref(false)
const komunitasRef = ref<HTMLElement | null>(null)
onClickOutside(komunitasRef, () => (komunitasOpen.value = false))

const nav = [
  { label: 'Beranda', to: '/' },
  { label: 'Cetak Biru', to: '/cetak-biru' },
  { label: 'Pohon Nilai', to: '/pohon-nilai' },
  { label: 'Wawasan', to: '/articles' },
]
const komunitas = [
  { label: 'Asisten AI (Tanya COCO)', to: '/asisten', icon: Bot, desc: 'Rekomendasi dari repositori tervalidasi' },
  { label: 'Tanya Pakar', to: '/tanya', icon: MessageCircleQuestion, desc: 'Q&A teknis dengan jawaban terverifikasi' },
  { label: 'Forum Diskusi', to: '/forum', icon: MessagesSquare, desc: 'Tanya jawab & obrolan komunitas' },
  { label: 'Bursa Limbah', to: '/bursa', icon: Repeat2, desc: 'Surplus ↔ kebutuhan bahan baku' },
  { label: 'Direktori UMKM', to: '/direktori', icon: Users, desc: 'Temukan mitra & peta sebaran' },
]
const isActive = (to: string) => (to === '/' ? route.path === '/' : route.path.startsWith(to))
const komunitasActive = () => komunitas.some((k) => route.path.startsWith(k.to))
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

          <!-- Komunitas dropdown -->
          <div ref="komunitasRef" class="relative">
            <button
              class="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              :class="komunitasActive() ? 'text-primary-700' : 'text-muted hover:text-ink'"
              @click="komunitasOpen = !komunitasOpen"
            >
              Komunitas <ChevronDown class="h-4 w-4 transition-transform" :class="komunitasOpen && 'rotate-180'" />
            </button>
            <Transition name="dd">
              <div v-if="komunitasOpen" class="absolute left-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-dropdown" @click="komunitasOpen = false">
                <RouterLink v-for="k in komunitas" :key="k.to" :to="k.to" class="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-canvas">
                  <span class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600"><component :is="k.icon" class="h-4.5 w-4.5" /></span>
                  <span>
                    <span class="block text-sm font-medium text-ink">{{ k.label }}</span>
                    <span class="block text-xs text-muted">{{ k.desc }}</span>
                  </span>
                </RouterLink>
              </div>
            </Transition>
          </div>
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
          <p class="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted/60">Komunitas</p>
          <RouterLink
            v-for="k in komunitas"
            :key="k.to"
            :to="k.to"
            class="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium"
            :class="isActive(k.to) ? 'bg-primary-50 text-primary-700' : 'text-muted'"
            @click="mobileOpen = false"
          >
            <component :is="k.icon" class="h-4 w-4" /> {{ k.label }}
          </RouterLink>
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
