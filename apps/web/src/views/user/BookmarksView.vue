<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { BookmarkX, Bookmark } from 'lucide-vue-next'
import { api } from '@/api'
import { useUiStore } from '@/stores/ui'
import type { ArticleSummary } from '@/types'
import PageHeader from '@/components/common/PageHeader.vue'
import ArticleCard from '@/components/common/ArticleCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'

const ui = useUiStore()
const items = ref<ArticleSummary[]>([])
const loading = ref(true)

onMounted(async () => {
  items.value = await api.myBookmarks()
  loading.value = false
})

async function remove(id: number) {
  await api.toggleBookmark(id)
  items.value = items.value.filter((a) => a.id !== id)
  ui.success('Bookmark dihapus.')
}
</script>

<template>
  <div>
    <PageHeader title="Bacaan Saya" subtitle="Artikel yang Anda simpan untuk dibaca nanti." />

    <LoadingBlock v-if="loading" />
    <template v-else>
      <div v-if="items.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="a in items" :key="a.id" class="relative">
          <ArticleCard :article="a" />
          <button
            class="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-danger shadow-card backdrop-blur transition-transform hover:scale-105"
            title="Hapus bookmark"
            @click="remove(a.id)"
          >
            <BookmarkX class="h-4 w-4" />
          </button>
        </div>
      </div>
      <EmptyState v-else :icon="Bookmark" title="Belum ada artikel tersimpan" description="Simpan artikel favorit Anda untuk dibaca kapan saja.">
        <RouterLink to="/articles" class="btn-primary btn-md">Jelajahi Artikel</RouterLink>
      </EmptyState>
    </template>
  </div>
</template>
