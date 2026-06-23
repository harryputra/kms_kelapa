<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Wrench, FileText, ThumbsUp, MessageSquare, PenSquare, ArrowRight, Award } from 'lucide-vue-next'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import type { ArticleSummary, BlueprintSummary } from '@/types'
import { BLUEPRINT_STATUS } from '@/lib/blueprint'
import StatCard from '@/components/ui/StatCard.vue'
import StatusChip from '@/components/ui/StatusChip.vue'
import MaturityBadge from '@/components/common/MaturityBadge.vue'
import AppAvatar from '@/components/ui/AppAvatar.vue'
import { relativeTime } from '@/lib/format'

const auth = useAuthStore()
const notif = useNotificationStore()
const myBlueprints = ref<BlueprintSummary[]>([])
const myArticles = ref<ArticleSummary[]>([])

const user = computed(() => auth.user)
const latestBadge = computed(() => user.value?.badges.find((b) => b.awarded_at))

onMounted(async () => {
  const [bp, a] = await Promise.all([api.myBlueprints(), api.myArticles()])
  myBlueprints.value = bp
  myArticles.value = a
  if (!notif.items.length) await notif.fetch()
})
</script>

<template>
  <div>
    <!-- Greeting -->
    <div class="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 p-6 text-white">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <AppAvatar :name="user?.display_name ?? ''" :src="user?.avatar_url" size="lg" />
          <div>
            <p class="text-sm text-white/70">Selamat datang kembali,</p>
            <h1 class="font-display text-2xl font-bold">{{ user?.display_name }} 👋</h1>
          </div>
        </div>
        <RouterLink to="/dashboard/cetak-biru/baru" class="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/25">
          <PenSquare class="h-4 w-4" /> Tulis Cetak Biru
        </RouterLink>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Cetak Biru Saya" :value="myBlueprints.length" :icon="Wrench" tone="primary" />
      <StatCard label="Wawasan Terbit" :value="user?.stats.articles_published ?? 0" :icon="FileText" tone="success" />
      <StatCard label="Like Diberikan" :value="user?.stats.likes_given ?? 0" :icon="ThumbsUp" tone="gold" />
      <StatCard label="Komentar" :value="user?.stats.comments_count ?? 0" :icon="MessageSquare" tone="info" />
    </div>

    <div class="mt-6 grid gap-6 lg:grid-cols-3">
      <!-- Cetak Biru Saya -->
      <div class="premium-card lg:col-span-2">
        <div class="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 class="font-display font-semibold text-ink">Cetak Biru Saya</h2>
          <RouterLink to="/dashboard/cetak-biru" class="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">Semua <ArrowRight class="h-4 w-4" /></RouterLink>
        </div>
        <ul v-if="myBlueprints.length" class="divide-y divide-line">
          <li v-for="b in myBlueprints.slice(0, 4)" :key="b.id" class="flex items-center gap-3 px-5 py-3.5">
            <div class="min-w-0 flex-1">
              <RouterLink :to="`/cetak-biru/${b.id}`" class="line-clamp-1 text-sm font-medium text-ink hover:text-primary-600">{{ b.title }}</RouterLink>
              <p class="text-xs text-muted">{{ b.product }} · {{ b.stats.replications }}× dicoba</p>
            </div>
            <MaturityBadge :maturity="b.maturity" />
            <span class="chip" :class="BLUEPRINT_STATUS[b.status].chip">{{ BLUEPRINT_STATUS[b.status].label }}</span>
          </li>
        </ul>
        <div v-else class="px-5 py-10 text-center">
          <p class="text-sm text-muted">Belum ada cetak biru.</p>
          <RouterLink to="/dashboard/cetak-biru/baru" class="btn-primary btn-sm mt-3"><PenSquare class="h-4 w-4" /> Tulis Cetak Biru</RouterLink>
        </div>
      </div>

      <!-- Notifikasi + Badge -->
      <div class="space-y-6">
        <div v-if="latestBadge" class="premium-card flex items-center gap-3 p-5">
          <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-100 text-gold-600"><Award class="h-5 w-5" /></span>
          <div>
            <p class="text-xs text-muted">Lencana terbaru</p>
            <p class="font-display font-semibold text-ink">{{ latestBadge.name }}</p>
          </div>
        </div>
        <div class="premium-card">
          <div class="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 class="font-display font-semibold text-ink">Notifikasi</h2>
            <RouterLink to="/dashboard/notifications" class="text-sm font-medium text-primary-600 hover:text-primary-700">Semua</RouterLink>
          </div>
          <ul class="divide-y divide-line">
            <li v-for="n in notif.items.slice(0, 4)" :key="n.id" class="px-5 py-3" :class="{ 'bg-primary-50/30': !n.is_read }">
              <p class="line-clamp-2 text-sm leading-snug text-ink">{{ n.data.message }}</p>
              <p class="mt-0.5 text-xs text-muted">{{ relativeTime(n.created_at) }}</p>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Wawasan Saya -->
    <div v-if="myArticles.length" class="premium-card mt-6">
      <div class="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 class="font-display font-semibold text-ink">Wawasan Saya</h2>
        <RouterLink to="/dashboard/articles" class="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">Semua <ArrowRight class="h-4 w-4" /></RouterLink>
      </div>
      <ul class="divide-y divide-line">
        <li v-for="a in myArticles.slice(0, 3)" :key="a.id" class="flex items-center gap-3 px-5 py-3.5">
          <div class="min-w-0 flex-1">
            <RouterLink :to="`/articles/${a.id}`" class="line-clamp-1 text-sm font-medium text-ink hover:text-primary-600">{{ a.title }}</RouterLink>
            <p class="text-xs text-muted">{{ a.category }}</p>
          </div>
          <StatusChip :status="a.status" />
        </li>
      </ul>
    </div>
  </div>
</template>
