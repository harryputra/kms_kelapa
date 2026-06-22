<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Eye, ThumbsUp, MessageSquare } from 'lucide-vue-next'
import type { ArticleSummary } from '@/types'
import { compactNumber, relativeTime } from '@/lib/format'
import ArticleCover from '@/components/ui/ArticleCover.vue'
import AppAvatar from '@/components/ui/AppAvatar.vue'

defineProps<{ article: ArticleSummary }>()
</script>

<template>
  <RouterLink
    :to="`/articles/${article.id}`"
    class="premium-card premium-card-hover group flex flex-col overflow-hidden"
  >
    <ArticleCover :seed="article.title" :label="article.category" />
    <div class="flex flex-1 flex-col p-4">
      <div class="mb-2 flex flex-wrap gap-1.5">
        <span v-for="t in article.tags.slice(0, 2)" :key="t" class="chip bg-primary-50 text-primary-700">#{{ t }}</span>
      </div>
      <h3 class="line-clamp-2 font-display text-[17px] font-semibold leading-snug text-ink transition-colors group-hover:text-primary-700">
        {{ article.title }}
      </h3>
      <p class="mt-1.5 line-clamp-2 text-sm text-muted">{{ article.excerpt }}</p>

      <div class="mt-auto flex items-center justify-between pt-4">
        <div class="flex items-center gap-2">
          <AppAvatar :name="article.author.display_name" :src="article.author.avatar_url" size="sm" />
          <div class="leading-tight">
            <p class="text-xs font-medium text-ink">{{ article.author.display_name }}</p>
            <p class="text-[11px] text-muted">{{ relativeTime(article.published_at) }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3 text-xs text-muted">
          <span class="inline-flex items-center gap-1"><Eye class="h-3.5 w-3.5" />{{ compactNumber(article.stats.views) }}</span>
          <span class="inline-flex items-center gap-1"><ThumbsUp class="h-3.5 w-3.5" />{{ compactNumber(article.stats.likes) }}</span>
          <span class="inline-flex items-center gap-1"><MessageSquare class="h-3.5 w-3.5" />{{ article.stats.comments }}</span>
        </div>
      </div>
    </div>
  </RouterLink>
</template>
