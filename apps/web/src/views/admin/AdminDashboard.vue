<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Users, FileText, MessageSquare, Eye, ScrollText } from 'lucide-vue-next'
import { api } from '@/api'
import type { AuditLog } from '@/types'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/ui/StatCard.vue'
import AppAvatar from '@/components/ui/AppAvatar.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import { relativeTime, compactNumber } from '@/lib/format'

interface Stats {
  total_users: number; total_articles: number; published_articles: number; pending_review: number
  total_comments: number; pending_comments: number; open_reports: number; views_today: number
  views_trend: number[]; signups_trend: number[]
}
const stats = ref<Stats | null>(null)
const logs = ref<AuditLog[]>([])
const loading = ref(true)

const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

onMounted(async () => {
  const [s, l] = await Promise.all([api.stats(), api.auditLogs()])
  stats.value = s as Stats
  logs.value = l
  loading.value = false
})

function barHeight(v: number, arr: number[]) {
  const max = Math.max(...arr)
  return `${Math.max(8, (v / max) * 100)}%`
}
</script>

<template>
  <div>
    <PageHeader title="Dashboard Admin" subtitle="Ringkasan kesehatan & aktivitas platform." />

    <LoadingBlock v-if="loading" />
    <template v-else-if="stats">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Pengguna" :value="stats.total_users" :icon="Users" tone="primary" trend="+9 minggu ini" />
        <StatCard label="Artikel Terbit" :value="stats.published_articles" :icon="FileText" tone="success" />
        <StatCard label="Total Komentar" :value="stats.total_comments" :icon="MessageSquare" tone="info" />
        <StatCard label="Views Hari Ini" :value="compactNumber(stats.views_today)" :icon="Eye" tone="gold" />
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-3">
        <!-- Grafik views -->
        <div class="premium-card p-5 lg:col-span-2">
          <div class="mb-5 flex items-center justify-between">
            <h2 class="font-display font-semibold text-ink">Tren Kunjungan (7 hari)</h2>
            <span class="chip bg-success/10 text-success">▲ 18%</span>
          </div>
          <div class="flex h-44 items-stretch gap-3">
            <div v-for="(v, i) in stats.views_trend" :key="i" class="group flex h-full flex-1 flex-col items-center gap-2">
              <div class="relative flex w-full flex-1 items-end">
                <div class="w-full rounded-t-lg bg-gradient-to-t from-primary-500 to-primary-400 transition-all group-hover:from-primary-600" :style="{ height: barHeight(v, stats.views_trend) }">
                  <span class="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-primary-700 opacity-0 transition-opacity group-hover:opacity-100">{{ compactNumber(v) }}</span>
                </div>
              </div>
              <span class="text-[11px] text-muted">{{ days[i] }}</span>
            </div>
          </div>
        </div>

        <!-- Antrean ringkas -->
        <div class="premium-card p-5">
          <h2 class="mb-4 font-display font-semibold text-ink">Perlu Perhatian</h2>
          <ul class="space-y-3 text-sm">
            <li class="flex items-center justify-between rounded-xl bg-info/5 px-4 py-3">
              <span class="text-info">Artikel menunggu review</span>
              <span class="font-display font-bold text-info">{{ stats.pending_review }}</span>
            </li>
            <li class="flex items-center justify-between rounded-xl bg-warning/5 px-4 py-3">
              <span class="text-gold-700">Komentar pending</span>
              <span class="font-display font-bold text-gold-700">{{ stats.pending_comments }}</span>
            </li>
            <li class="flex items-center justify-between rounded-xl bg-danger/5 px-4 py-3">
              <span class="text-danger">Laporan terbuka</span>
              <span class="font-display font-bold text-danger">{{ stats.open_reports }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Audit terbaru -->
      <div class="premium-card mt-6">
        <div class="flex items-center gap-2 border-b border-line px-5 py-4">
          <ScrollText class="h-4.5 w-4.5 text-primary-600" />
          <h2 class="font-display font-semibold text-ink">Aktivitas Terbaru</h2>
        </div>
        <ul class="divide-y divide-line">
          <li v-for="log in logs.slice(0, 6)" :key="log.id" class="flex items-center gap-3 px-5 py-3">
            <AppAvatar :name="log.user?.display_name ?? 'Sistem'" size="sm" />
            <div class="min-w-0 flex-1">
              <p class="text-sm text-ink"><span class="font-medium">{{ log.user?.display_name }}</span> — {{ log.description }}</p>
              <p class="text-xs text-muted">{{ relativeTime(log.created_at) }} · {{ log.ip_address }}</p>
            </div>
            <code class="hidden rounded bg-canvas px-2 py-1 text-[11px] text-muted sm:block">{{ log.action }}</code>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>
