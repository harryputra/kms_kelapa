<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { FileText, ThumbsUp, MessageSquare, Bookmark, PenSquare, ArrowRight, Award } from 'lucide-vue-next'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import type { ArticleSummary } from '@/types'
import StatCard from '@/components/ui/StatCard.vue'
import StatusChip from '@/components/ui/StatusChip.vue'
import AppAvatar from '@/components/ui/AppAvatar.vue'
import { relativeTime } from '@/lib/format'

const auth = useAuthStore()
const notif = useNotificationStore()
const myArticles = ref<ArticleSummary[]>([])
const bookmarks = ref<ArticleSummary[]>([])
const loading = ref(true)

const user = computed(() => auth.user)
const latestBadge = computed(() => user.value?.badges.find((b) => b.awarded_at))

onMounted(async () => {
  const [a, b] = await Promise.all([api.myArticles(), api.myBookmarks()])
  myArticles.value = a
  bookmarks.value = b
  if (!notif.items.length) await notif.fetch()
  loading.value = false
})
</script>

<template>
  <div>
    <!-- Greeting -->
    <div class="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 p-6 text-white">
      <div class="hero-mesh absolute" />
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <AppAvatar :name="user?.display_name ?? ''" :src="user?.avatar_url" size="lg" />
          <div>
            <p class="text-sm text-white/70">Selamat datang kembali,</p>
            <h1 class="font-display text-2xl font-bold">{{ user?.display_name }} 👋</h1>
          </div>
        </div>
        <div v-if="latestBadge" class="flex items-center gap-2.5 rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur">
          <Award class="h-5 w-5 text-gold-300" />
          <div class="text-sm">
            <p class="font-semibold">Lencana Terbaru</p>
            <p class="text-white/80">{{ latestBadge.name }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Artikel Terbit" :value="user?.stats.articles_published ?? 0" :icon="FileText" tone="primary" />
      <StatCard label="Like Diberikan" :value="user?.stats.likes_given ?? 0" :icon="ThumbsUp" tone="success" />
      <StatCard label="Komentar" :value="user?.stats.comments_count ?? 0" :icon="MessageSquare" tone="info" />
      <StatCard label="Bookmark" :value="bookmarks.length" :icon="Bookmark" tone="gold" />
    </div>

    <div class="mt-6 grid gap-6 lg:grid-cols-3">
      <!-- Artikel saya -->
      <div class="premium-card lg:col-span-2">
        <div class="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 class="font-display font-semibold text-ink">Artikel Saya</h2>
          <RouterLink to="/dashboard/articles" class="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">
            Semua <ArrowRight class="h-4 w-4" />
          </RouterLink>
        </div>
        <ul v-if="myArticles.length" class="divide-y divide-line">
          <li v-for="a in myArticles.slice(0, 4)" :key="a.id" class="flex items-center gap-3 px-5 py-3.5">
            <div class="min-w-0 flex-1">
              <RouterLink :to="`/articles/${a.id}`" class="line-clamp-1 text-sm font-medium text-ink hover:text-primary-600">{{ a.title }}</RouterLink>
              <p class="text-xs text-muted">{{ a.category }} · {{ relativeTime(a.published_at) }}</p>
            </div>
            <StatusChip :status="a.status" />
          </li>
        </ul>
        <div v-else class="px-5 py-10 text-center">
          <p class="text-sm text-muted">Belum ada artikel.</p>
          <RouterLink to="/dashboard/submit" class="btn-primary btn-sm mt-3"><PenSquare class="h-4 w-4" /> Tulis Artikel</RouterLink>
        </div>
      </div>

      <!-- Notifikasi -->
      <div class="premium-card">
        <div class="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 class="font-display font-semibold text-ink">Notifikasi</h2>
          <RouterLink to="/dashboard/notifications" class="text-sm font-medium text-primary-600 hover:text-primary-700">Semua</RouterLink>
        </div>
        <ul class="divide-y divide-line">
          <li v-for="n in notif.items.slice(0, 5)" :key="n.id" class="px-5 py-3" :class="{ 'bg-primary-50/30': !n.is_read }">
            <p class="text-sm leading-snug text-ink">{{ n.data.message }}</p>
            <p class="mt-0.5 text-xs text-muted">{{ relativeTime(n.created_at) }}</p>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
