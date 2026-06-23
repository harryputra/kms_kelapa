<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  LayoutDashboard, FileText, PenSquare, Bookmark, Bell, User, Wrench,
  ClipboardCheck, LayoutTemplate, MessageSquareWarning, Flag, Stamp,
  Users, Settings, ListTree, Trash2, ScrollText, ShieldCheck, Gavel, Bot,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'

const auth = useAuthStore()
const notif = useNotificationStore()
const route = useRoute()

interface Item { label: string; to: string; icon: unknown; badge?: () => number | undefined }

const userGroup = computed<Item[]>(() => [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Cetak Biru Saya', to: '/dashboard/cetak-biru', icon: Wrench },
  { label: 'Tulis Cetak Biru', to: '/dashboard/cetak-biru/baru', icon: PenSquare },
  { label: 'Wawasan Saya', to: '/dashboard/articles', icon: FileText },
  { label: 'Bacaan Saya', to: '/dashboard/bookmarks', icon: Bookmark },
  { label: 'Notifikasi', to: '/dashboard/notifications', icon: Bell, badge: () => notif.unreadCount || undefined },
  { label: 'Profil', to: '/dashboard/profile', icon: User },
])

const modGroup: Item[] = [
  { label: 'Dashboard Moderator', to: '/moderator', icon: Gavel },
  { label: 'Kurasi Cetak Biru', to: '/moderator/cetak-biru', icon: Stamp },
  { label: 'Antrean Review', to: '/moderator/review', icon: ClipboardCheck },
  { label: 'Template', to: '/moderator/templates', icon: LayoutTemplate },
  { label: 'Moderasi Komentar', to: '/moderator/comments', icon: MessageSquareWarning },
  { label: 'Laporan', to: '/moderator/reports', icon: Flag },
]

const adminGroup: Item[] = [
  { label: 'Dashboard Admin', to: '/admin', icon: ShieldCheck },
  { label: 'Pengguna', to: '/admin/users', icon: Users },
  { label: 'Pengaturan', to: '/admin/settings', icon: Settings },
  { label: 'Asisten AI', to: '/admin/ai', icon: Bot },
  { label: 'Menu Manager', to: '/admin/menu', icon: ListTree },
  { label: 'Recycle Bin', to: '/admin/recycle-bin', icon: Trash2 },
  { label: 'Audit Log', to: '/admin/audit', icon: ScrollText },
]

const isActive = (to: string) => route.path === to
</script>

<template>
  <aside class="flex h-full w-full flex-col gap-6 overflow-y-auto px-3 py-5 no-scrollbar">
    <nav class="space-y-1">
      <p class="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted/70">Menu Utama</p>
      <RouterLink v-for="item in userGroup" :key="item.to" :to="item.to" class="side-link" :class="isActive(item.to) && 'side-link-active'">
        <component :is="item.icon" class="h-[18px] w-[18px]" />
        <span class="flex-1">{{ item.label }}</span>
        <span v-if="item.badge?.()" class="chip bg-danger px-1.5 text-[10px] text-white">{{ item.badge() }}</span>
      </RouterLink>
    </nav>

    <nav v-if="auth.isModerator" class="space-y-1">
      <p class="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted/70">Moderator</p>
      <RouterLink v-for="item in modGroup" :key="item.to" :to="item.to" class="side-link" :class="isActive(item.to) && 'side-link-active'">
        <component :is="item.icon" class="h-[18px] w-[18px]" />
        <span class="flex-1">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <nav v-if="auth.isAdmin" class="space-y-1">
      <p class="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted/70">Administrasi</p>
      <RouterLink v-for="item in adminGroup" :key="item.to" :to="item.to" class="side-link" :class="isActive(item.to) && 'side-link-active'">
        <component :is="item.icon" class="h-[18px] w-[18px]" />
        <span class="flex-1">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="mt-auto rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-4 text-white">
      <p class="text-sm font-semibold">Bagikan pengetahuanmu</p>
      <p class="mt-1 text-xs text-white/80">Tulis pengalaman olah limbah kelapa & raih lencana.</p>
      <RouterLink to="/dashboard/submit" class="mt-3 inline-flex rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur transition-colors hover:bg-white/25">
        Tulis Artikel →
      </RouterLink>
    </div>
  </aside>
</template>

<style scoped>
.side-link {
  @apply flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-all duration-150 hover:bg-line/60 hover:text-ink;
}
.side-link-active {
  @apply bg-primary-50 text-primary-700 shadow-xs;
}
</style>
