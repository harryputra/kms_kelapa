<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Pin, Lock, MessageSquare, Plus, MessagesSquare } from 'lucide-vue-next'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import type { ForumTopic } from '@/types'
import AppAvatar from '@/components/ui/AppAvatar.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { relativeTime } from '@/lib/format'

const auth = useAuthStore()
const topics = ref<ForumTopic[]>([])
const loading = ref(true)

onMounted(async () => {
  topics.value = await api.forumTopics()
  loading.value = false
})
</script>

<template>
  <div class="container-page py-10">
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-h1">Forum Diskusi</h1>
        <p class="mt-1 text-muted">Community of Practice — bertanya, berbagi, dan berdiskusi.</p>
      </div>
      <RouterLink v-if="auth.isAuthenticated" to="/forum/baru" class="btn-primary btn-md"><Plus class="h-4 w-4" /> Topik Baru</RouterLink>
      <RouterLink v-else to="/login" class="btn-secondary btn-md">Masuk untuk berdiskusi</RouterLink>
    </div>

    <LoadingBlock v-if="loading" />
    <template v-else>
      <ul v-if="topics.length" class="space-y-3">
        <li v-for="t in topics" :key="t.id">
          <RouterLink :to="`/forum/${t.id}`" class="premium-card premium-card-hover flex items-center gap-4 p-4">
            <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <MessageSquare class="h-6 w-6" />
            </span>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <Pin v-if="t.is_pinned" class="h-3.5 w-3.5 text-gold-500" />
                <Lock v-if="t.is_locked" class="h-3.5 w-3.5 text-muted" />
                <h3 class="line-clamp-1 font-display font-semibold text-ink">{{ t.title }}</h3>
              </div>
              <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                <AppAvatar :name="t.author.display_name" size="sm" />
                <span>{{ t.author.display_name }}</span>
                <span>·</span>
                <span class="chip bg-line/70 text-muted">{{ t.category }}</span>
                <span>·</span>
                <span>aktif {{ relativeTime(t.last_activity) }}</span>
              </div>
            </div>
            <div class="hidden shrink-0 text-center sm:block">
              <p class="font-display text-lg font-bold text-ink">{{ t.replies_count }}</p>
              <p class="text-[11px] text-muted">balasan</p>
            </div>
          </RouterLink>
        </li>
      </ul>
      <EmptyState v-else :icon="MessagesSquare" title="Belum ada topik" description="Jadilah yang pertama memulai diskusi.">
        <RouterLink v-if="auth.isAuthenticated" to="/forum/baru" class="btn-primary btn-md">Buat Topik</RouterLink>
      </EmptyState>
    </template>
  </div>
</template>
