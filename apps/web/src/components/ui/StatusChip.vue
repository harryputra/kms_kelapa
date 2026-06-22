<script setup lang="ts">
import { computed } from 'vue'
import { ARTICLE_STATUS, COMMENT_STATUS } from '@/lib/format'
import type { ArticleStatus, CommentStatus } from '@/types'

const props = defineProps<{ status: ArticleStatus | CommentStatus; kind?: 'article' | 'comment' }>()

const meta = computed(() => {
  if (props.kind === 'comment') return COMMENT_STATUS[props.status as CommentStatus]
  return ARTICLE_STATUS[props.status as ArticleStatus] ?? COMMENT_STATUS[props.status as CommentStatus]
})
</script>

<template>
  <span class="chip" :class="meta.chip">
    <span class="h-1.5 w-1.5 rounded-full" :class="meta.dot" />
    {{ meta.label }}
  </span>
</template>
