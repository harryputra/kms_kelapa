<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { Search, PenSquare, SlidersHorizontal } from 'lucide-vue-next'
import { useDebounceFn } from '@vueuse/core'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import type { ArticleSummary, Category, PaginationMeta } from '@/types'
import ArticleCard from '@/components/common/ArticleCard.vue'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { FileSearch } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const articles = ref<ArticleSummary[]>([])
const categories = ref<Category[]>([])
const meta = ref<PaginationMeta | null>(null)
const loading = ref(true)

const search = ref((route.query.search as string) ?? '')
const category = ref((route.query.category as string) ?? '')
const sort = ref<'newest' | 'popular' | 'oldest'>((route.query.sort as 'newest') ?? 'newest')
const page = ref(Number(route.query.page) || 1)

async function load() {
  loading.value = true
  try {
    const res = await api.listPublished({
      page: page.value,
      limit: 9,
      search: search.value || undefined,
      category: category.value || undefined,
      sort: sort.value,
    })
    articles.value = res.data
    meta.value = res.meta
  } finally {
    loading.value = false
  }
}

const debouncedLoad = useDebounceFn(() => {
  page.value = 1
  syncQuery()
  load()
}, 350)

function syncQuery() {
  router.replace({
    query: {
      ...(search.value ? { search: search.value } : {}),
      ...(category.value ? { category: category.value } : {}),
      ...(sort.value !== 'newest' ? { sort: sort.value } : {}),
      ...(page.value > 1 ? { page: String(page.value) } : {}),
    },
  })
}

function setCategory(slug: string) {
  category.value = category.value === slug ? '' : slug
  page.value = 1
  syncQuery()
  load()
}
function changePage(p: number) {
  page.value = p
  syncQuery()
  load()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(sort, () => {
  page.value = 1
  syncQuery()
  load()
})
watch(() => route.query.category, (v) => {
  if ((v as string) !== category.value) {
    category.value = (v as string) ?? ''
    load()
  }
})

onMounted(async () => {
  categories.value = await api.categories()
  load()
})
</script>

<template>
  <div class="container-page py-10">
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-h1">Artikel Pengetahuan</h1>
        <p class="mt-1 text-muted">Temukan teknik & praktik pengolahan limbah kelapa.</p>
      </div>
      <RouterLink v-if="auth.isAuthenticated" to="/dashboard/submit" class="btn-primary btn-md">
        <PenSquare class="h-4 w-4" /> Tulis Artikel
      </RouterLink>
    </div>

    <!-- Filter bar -->
    <div class="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
      <div class="relative flex-1">
        <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          v-model="search"
          type="search"
          placeholder="Cari judul, tag, atau topik…"
          class="field pl-10"
          @input="debouncedLoad"
        />
      </div>
      <div class="flex items-center gap-2">
        <SlidersHorizontal class="h-4 w-4 text-muted" />
        <select v-model="sort" class="field w-auto">
          <option value="newest">Terbaru</option>
          <option value="popular">Terpopuler</option>
          <option value="oldest">Terlama</option>
        </select>
      </div>
    </div>

    <!-- Kategori chips -->
    <div class="mb-8 flex flex-wrap gap-2">
      <button
        class="chip border transition-colors"
        :class="!category ? 'border-primary-600 bg-primary-600 text-white' : 'border-line bg-surface text-muted hover:border-primary-200'"
        @click="setCategory('')"
      >
        Semua
      </button>
      <button
        v-for="c in categories"
        :key="c.id"
        class="chip border transition-colors"
        :class="category === c.slug ? 'border-primary-600 bg-primary-600 text-white' : 'border-line bg-surface text-muted hover:border-primary-200'"
        @click="setCategory(c.slug)"
      >
        {{ c.name }}
      </button>
    </div>

    <!-- Grid -->
    <div v-if="loading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <SkeletonCard v-for="i in 9" :key="i" />
    </div>
    <template v-else>
      <div v-if="articles.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ArticleCard v-for="a in articles" :key="a.id" :article="a" />
      </div>
      <EmptyState
        v-else
        :icon="FileSearch"
        title="Tidak ada artikel ditemukan"
        description="Coba ubah kata kunci pencarian atau pilih kategori lain."
      >
        <button class="btn-secondary btn-md" @click="search = ''; setCategory('')">Reset filter</button>
      </EmptyState>

      <div v-if="meta && meta.total_pages > 1" class="mt-10">
        <AppPagination :page="meta.current_page" :total-pages="meta.total_pages" @change="changePage" />
      </div>
    </template>
  </div>
</template>
