<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight, BookOpen, Users, Sparkles, PenLine, ShieldCheck, TrendingUp, Recycle } from 'lucide-vue-next'
import { api } from '@/api'
import type { ArticleSummary, Category } from '@/types'
import ArticleCard from '@/components/common/ArticleCard.vue'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
import { gradientFor } from '@/lib/format'

const articles = ref<ArticleSummary[]>([])
const categories = ref<Category[]>([])
const loading = ref(true)

const steps = [
  { icon: PenLine, title: 'Tulis & Kirim', desc: 'Dokumentasikan praktik olah limbah kelapa Anda, lalu kirim untuk direview.' },
  { icon: ShieldCheck, title: 'Kurasi Moderator', desc: 'Tim moderator menjaga mutu — konten kredibel dan dapat dipercaya.' },
  { icon: TrendingUp, title: 'Berbagi & Berkembang', desc: 'Artikel tayang, dinilai komunitas, dan Anda meraih lencana kontributor.' },
]

onMounted(async () => {
  try {
    const [res, cats] = await Promise.all([api.listPublished({ limit: 6, sort: 'newest' }), api.categories()])
    articles.value = res.data
    categories.value = cats
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <!-- HERO -->
  <section class="relative overflow-hidden border-b border-line">
    <div class="hero-mesh absolute inset-0" />
    <div class="container-page relative grid gap-10 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
      <div>
        <span class="chip mb-5 border border-primary-200 bg-white/70 text-primary-700 backdrop-blur">
          <Sparkles class="h-3.5 w-3.5" /> Knowledge Management System untuk UMKM Kelapa
        </span>
        <h1 class="font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl">
          Dari <span class="text-gradient">limbah kelapa</span>,<br />menuju pengetahuan bernilai.
        </h1>
        <p class="mt-5 max-w-lg text-lg leading-relaxed text-muted">
          Platform kolaboratif tempat pelaku UMKM agroindustri kelapa berbagi, belajar, dan mengkurasi praktik terbaik pengolahan limbah — dari sabut, tempurung, hingga air kelapa.
        </p>
        <div class="mt-8 flex flex-wrap items-center gap-3">
          <RouterLink to="/articles" class="btn-primary btn-lg">
            Jelajahi Artikel <ArrowRight class="h-4 w-4" />
          </RouterLink>
          <RouterLink to="/register" class="btn-secondary btn-lg">Daftar Gratis</RouterLink>
        </div>
        <div class="mt-10 flex items-center gap-8">
          <div>
            <p class="font-display text-2xl font-bold text-ink">150+</p>
            <p class="text-sm text-muted">Artikel pengetahuan</p>
          </div>
          <span class="h-10 w-px bg-line" />
          <div>
            <p class="font-display text-2xl font-bold text-ink">500+</p>
            <p class="text-sm text-muted">Pelaku UMKM</p>
          </div>
          <span class="h-10 w-px bg-line" />
          <div>
            <p class="font-display text-2xl font-bold text-ink">6</p>
            <p class="text-sm text-muted">Kategori limbah</p>
          </div>
        </div>
      </div>

      <!-- Kartu hero dekoratif -->
      <div class="relative hidden lg:block">
        <div class="absolute -left-6 top-8 w-64 rotate-[-6deg] premium-card p-4 shadow-card-hover">
          <div class="mb-3 flex items-center gap-2">
            <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600"><Recycle class="h-5 w-5" /></span>
            <p class="text-sm font-semibold">Cocopeat Ekspor</p>
          </div>
          <div class="space-y-1.5">
            <div class="h-2 w-full rounded bg-line" />
            <div class="h-2 w-2/3 rounded bg-line" />
          </div>
        </div>
        <div class="ml-16 mt-4 w-72 rotate-[4deg] overflow-hidden premium-card shadow-card-hover">
          <div :class="gradientFor('coco-hero')" class="aspect-[16/10] bg-gradient-to-br">
            <div class="flex h-full items-center justify-center">
              <svg class="h-24 w-24 text-white/30" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c5 0 9 4 9 9 0 5-4 9-9 9s-9-4-9-9 4-9 9-9Zm0 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" /></svg>
            </div>
          </div>
          <div class="p-4">
            <p class="font-display font-semibold text-ink">Briket Tempurung</p>
            <p class="mt-1 text-xs text-muted">Panduan lengkap untuk energi terbarukan dari limbah.</p>
          </div>
        </div>
        <div class="absolute -bottom-4 left-4 flex items-center gap-2.5 premium-card px-4 py-3 shadow-card-hover">
          <span class="flex h-9 w-9 items-center justify-center rounded-full bg-success/10 text-success"><TrendingUp class="h-4 w-4" /></span>
          <div>
            <p class="text-sm font-semibold text-ink">+30% pendapatan</p>
            <p class="text-[11px] text-muted">rata-rata UMKM kontributor</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ARTIKEL TERBARU -->
  <section class="container-page py-16">
    <div class="mb-8 flex items-end justify-between">
      <div>
        <h2 class="text-h1">Artikel Terbaru</h2>
        <p class="mt-1 text-muted">Praktik terkini dari komunitas UMKM kelapa.</p>
      </div>
      <RouterLink to="/articles" class="hidden items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 sm:inline-flex">
        Lihat semua <ArrowRight class="h-4 w-4" />
      </RouterLink>
    </div>
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <template v-if="loading">
        <SkeletonCard v-for="i in 6" :key="i" />
      </template>
      <template v-else>
        <ArticleCard v-for="a in articles" :key="a.id" :article="a" />
      </template>
    </div>
  </section>

  <!-- KATEGORI -->
  <section class="border-y border-line bg-surface py-16">
    <div class="container-page">
      <div class="mb-8 text-center">
        <h2 class="text-h1">Jelajahi Berdasarkan Kategori</h2>
        <p class="mt-1 text-muted">Setiap bagian kelapa punya potensi ekonomi.</p>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="c in categories"
          :key="c.id"
          :to="`/articles?category=${c.slug}`"
          class="premium-card premium-card-hover group flex items-center gap-4 p-5"
        >
          <span :class="gradientFor(c.name)" class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white">
            <BookOpen class="h-5 w-5" />
          </span>
          <div class="flex-1">
            <p class="font-display font-semibold text-ink group-hover:text-primary-700">{{ c.name }}</p>
            <p class="text-xs text-muted">{{ c.description }}</p>
          </div>
          <span class="chip bg-primary-50 text-primary-700">{{ c.articles_count }}</span>
        </RouterLink>
      </div>
    </div>
  </section>

  <!-- CARA KERJA -->
  <section class="container-page py-16">
    <div class="mb-10 text-center">
      <h2 class="text-h1">Bagaimana COCONEXUS Bekerja</h2>
      <p class="mt-1 text-muted">Tiga langkah mengubah pengalaman menjadi pengetahuan bersama.</p>
    </div>
    <div class="grid gap-6 md:grid-cols-3">
      <div v-for="(s, i) in steps" :key="i" class="relative premium-card p-6">
        <span class="absolute right-5 top-5 font-display text-5xl font-extrabold text-primary-50">{{ i + 1 }}</span>
        <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-xs">
          <component :is="s.icon" class="h-6 w-6" />
        </span>
        <h3 class="mt-4 text-h3">{{ s.title }}</h3>
        <p class="mt-2 text-sm leading-relaxed text-muted">{{ s.desc }}</p>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="container-page pb-20">
    <div class="relative overflow-hidden rounded-3xl bg-primary-800 px-8 py-14 text-center text-white">
      <div class="hero-mesh absolute inset-0 opacity-60" />
      <div class="relative mx-auto max-w-2xl">
        <span class="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15"><Users class="h-6 w-6" /></span>
        <h2 class="font-display text-3xl font-bold">Jadilah bagian dari ekonomi sirkular kelapa</h2>
        <p class="mt-3 text-white/80">Daftar gratis, bagikan pengalaman lapangan Anda, dan bantu ribuan UMKM lain berkembang.</p>
        <div class="mt-7 flex flex-wrap justify-center gap-3">
          <RouterLink to="/register" class="btn-lg inline-flex items-center gap-2 rounded-xl bg-white px-6 font-semibold text-primary-700 transition-transform hover:scale-[1.02]">
            Mulai Sekarang <ArrowRight class="h-4 w-4" />
          </RouterLink>
          <RouterLink to="/articles" class="btn-lg inline-flex items-center rounded-xl bg-white/15 px-6 font-semibold text-white backdrop-blur transition-colors hover:bg-white/25">
            Lihat Artikel
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
