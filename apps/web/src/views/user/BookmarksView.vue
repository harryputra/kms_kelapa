<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { BookmarkX, Bookmark, Wrench, FileText } from 'lucide-vue-next'
import { api } from '@/api'
import { useUiStore } from '@/stores/ui'
import type { ArticleSummary, BlueprintSummary } from '@/types'
import PageHeader from '@/components/common/PageHeader.vue'
import ArticleCard from '@/components/common/ArticleCard.vue'
import BlueprintCard from '@/components/common/BlueprintCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'

const ui = useUiStore()
const blueprints = ref<BlueprintSummary[]>([])
const articles = ref<ArticleSummary[]>([])
const loading = ref(true)

onMounted(async () => {
  const [bp, ar] = await Promise.all([api.myBlueprintBookmarks(), api.myBookmarks()])
  blueprints.value = bp
  articles.value = ar
  loading.value = false
})

async function removeArticle(id: number) {
  await api.toggleBookmark(id)
  articles.value = articles.value.filter((a) => a.id !== id)
  ui.success('Bookmark dihapus.')
}
async function removeBlueprint(id: number) {
  await api.toggleBlueprintBookmark(id)
  blueprints.value = blueprints.value.filter((b) => b.id !== id)
  ui.success('Bookmark dihapus.')
}
</script>

<template>
  <div>
    <PageHeader title="Bacaan Saya" subtitle="Cetak biru & wawasan yang Anda simpan untuk dibaca nanti." />

    <LoadingBlock v-if="loading" />
    <template v-else-if="blueprints.length || articles.length">
      <!-- Cetak Biru tersimpan -->
      <section v-if="blueprints.length" class="mb-10">
        <h2 class="mb-4 flex items-center gap-2 text-h3"><Wrench class="h-5 w-5 text-primary-600" /> Cetak Biru ({{ blueprints.length }})</h2>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="b in blueprints" :key="b.id" class="relative">
            <BlueprintCard :blueprint="b" />
            <button class="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-danger shadow-card backdrop-blur transition-transform hover:scale-105" title="Hapus bookmark" @click="removeBlueprint(b.id)">
              <BookmarkX class="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <!-- Wawasan tersimpan -->
      <section v-if="articles.length">
        <h2 class="mb-4 flex items-center gap-2 text-h3"><FileText class="h-5 w-5 text-primary-600" /> Wawasan ({{ articles.length }})</h2>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="a in articles" :key="a.id" class="relative">
            <ArticleCard :article="a" />
            <button class="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-danger shadow-card backdrop-blur transition-transform hover:scale-105" title="Hapus bookmark" @click="removeArticle(a.id)">
              <BookmarkX class="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </template>

    <EmptyState v-else :icon="Bookmark" title="Belum ada yang tersimpan" description="Simpan cetak biru atau wawasan favorit untuk dibaca kapan saja.">
      <RouterLink to="/cetak-biru" class="btn-primary btn-md">Jelajahi Cetak Biru</RouterLink>
    </EmptyState>
  </div>
</template>
