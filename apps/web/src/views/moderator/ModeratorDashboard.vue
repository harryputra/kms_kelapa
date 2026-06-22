<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ClipboardCheck, MessageSquareWarning, Flag, CheckCircle2, ArrowRight } from 'lucide-vue-next'
import { api } from '@/api'
import type { ArticleSummary, Comment, ReportItem } from '@/types'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/ui/StatCard.vue'
import AppAvatar from '@/components/ui/AppAvatar.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import { relativeTime } from '@/lib/format'

const queue = ref<ArticleSummary[]>([])
const comments = ref<Comment[]>([])
const reports = ref<ReportItem[]>([])
const loading = ref(true)

onMounted(async () => {
  const [q, c, r] = await Promise.all([api.reviewQueue(), api.pendingComments(), api.reports()])
  queue.value = q
  comments.value = c
  reports.value = r
  loading.value = false
})
</script>

<template>
  <div>
    <PageHeader title="Dashboard Moderator" subtitle="Pantau antrean review, komentar, dan laporan komunitas." />

    <LoadingBlock v-if="loading" />
    <template v-else>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Menunggu Review" :value="queue.length" :icon="ClipboardCheck" tone="info" />
        <StatCard label="Komentar Pending" :value="comments.length" :icon="MessageSquareWarning" tone="gold" />
        <StatCard label="Laporan Terbuka" :value="reports.length" :icon="Flag" tone="primary" />
        <StatCard label="Disetujui (bulan ini)" :value="24" :icon="CheckCircle2" tone="success" />
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-2">
        <div class="premium-card">
          <div class="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 class="font-display font-semibold text-ink">Antrean Review</h2>
            <RouterLink to="/moderator/review" class="inline-flex items-center gap-1 text-sm font-medium text-primary-600">Semua <ArrowRight class="h-4 w-4" /></RouterLink>
          </div>
          <ul v-if="queue.length" class="divide-y divide-line">
            <li v-for="a in queue.slice(0, 5)" :key="a.id" class="flex items-center gap-3 px-5 py-3.5">
              <AppAvatar :name="a.author.display_name" size="sm" />
              <div class="min-w-0 flex-1">
                <p class="line-clamp-1 text-sm font-medium text-ink">{{ a.title }}</p>
                <p class="text-xs text-muted">{{ a.author.display_name }} · {{ a.category }}</p>
              </div>
              <RouterLink :to="`/moderator/review/${a.id}`" class="btn-secondary btn-sm">Tinjau</RouterLink>
            </li>
          </ul>
          <p v-else class="px-5 py-10 text-center text-sm text-muted">🎉 Antrean review kosong, bagus!</p>
        </div>

        <div class="premium-card">
          <div class="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 class="font-display font-semibold text-ink">Komentar Menunggu</h2>
            <RouterLink to="/moderator/comments" class="inline-flex items-center gap-1 text-sm font-medium text-primary-600">Moderasi <ArrowRight class="h-4 w-4" /></RouterLink>
          </div>
          <ul v-if="comments.length" class="divide-y divide-line">
            <li v-for="c in comments.slice(0, 5)" :key="c.id" class="flex items-start gap-3 px-5 py-3.5">
              <AppAvatar :name="c.user.display_name" size="sm" />
              <div class="min-w-0 flex-1">
                <p class="line-clamp-2 text-sm text-ink">{{ c.content }}</p>
                <p class="text-xs text-muted">{{ c.user.display_name }} · {{ relativeTime(c.created_at) }}</p>
              </div>
            </li>
          </ul>
          <p v-else class="px-5 py-10 text-center text-sm text-muted">Tidak ada komentar tertunda.</p>
        </div>
      </div>
    </template>
  </div>
</template>
