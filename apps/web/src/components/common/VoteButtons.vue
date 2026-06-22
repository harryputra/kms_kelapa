<script setup lang="ts">
import { ThumbsUp, ThumbsDown } from 'lucide-vue-next'
import type { VoteType } from '@/types'
import { compactNumber } from '@/lib/format'

defineProps<{ likes: number; dislikes: number; userVote: VoteType | null }>()
const emit = defineEmits<{ vote: [type: VoteType] }>()
</script>

<template>
  <div class="inline-flex items-center gap-1 rounded-xl border border-line bg-surface p-1">
    <button
      class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all active:scale-95"
      :class="userVote === 'like' ? 'bg-primary-50 text-primary-700' : 'text-muted hover:bg-line/60'"
      @click="emit('vote', 'like')"
    >
      <ThumbsUp class="h-4 w-4" :class="userVote === 'like' && 'fill-primary-600 text-primary-600'" />
      {{ compactNumber(likes) }}
    </button>
    <span class="h-5 w-px bg-line" />
    <button
      class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all active:scale-95"
      :class="userVote === 'dislike' ? 'bg-danger/10 text-danger' : 'text-muted hover:bg-line/60'"
      @click="emit('vote', 'dislike')"
    >
      <ThumbsDown class="h-4 w-4" :class="userVote === 'dislike' && 'fill-danger text-danger'" />
      {{ compactNumber(dislikes) }}
    </button>
  </div>
</template>
