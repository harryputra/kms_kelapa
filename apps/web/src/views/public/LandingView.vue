<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  ArrowRight, Sparkles, PenLine, ShieldCheck, TrendingUp, Recycle, Network,
  Layers, Shell, Droplets, Wheat, BadgeCheck, Calculator, Repeat2, Users, MapPin,
} from 'lucide-vue-next'
import { api } from '@/api'
import type { BlueprintSummary } from '@/types'
import BlueprintCard from '@/components/common/BlueprintCard.vue'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
import { gradientFor } from '@/lib/format'

const blueprints = ref<BlueprintSummary[]>([])
const loading = ref(true)

const wasteTeasers = [
  { slug: 'sabut', label: 'Sabut', desc: 'Cocopeat, cocofiber, pot', icon: Layers },
  { slug: 'tempurung', label: 'Tempurung', desc: 'Briket, arang aktif', icon: Shell },
  { slug: 'air', label: 'Air Kelapa', desc: 'Nata de coco, cuka', icon: Droplets },
  { slug: 'ampas', label: 'Ampas', desc: 'Tepung, pakan ternak', icon: Wheat },
]

const pembeda = [
  { icon: BadgeCheck, title: 'Tervalidasi Lapangan', desc: 'Bukan sekadar artikel — tiap cetak biru diuji & direplikasi UMKM nyata.' },
  { icon: Calculator, title: 'Terhitung Ekonominya', desc: 'Kalkulator modal, hasil, dan titik impas sesuai skala limbah Anda.' },
  { icon: Network, title: 'Terpetakan', desc: 'Pohon Nilai memandu dari limbah → produk → teknik pengolahan.' },
]

onMounted(async () => {
  try {
    blueprints.value = await api.listBlueprints({ sort: 'maturity' })
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
          <Sparkles class="h-3.5 w-3.5" /> Repositori Teknis & Kolaborasi UMKM Kelapa
        </span>
        <h1 class="font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl">
          Bukan sekadar artikel —<br /><span class="text-gradient">cetak biru teknis</span> yang bisa dipraktikkan.
        </h1>
        <p class="mt-5 max-w-lg text-lg leading-relaxed text-muted">
          Repositori resep teknis terstruktur untuk mengolah limbah kelapa: lengkap dengan bahan, langkah, parameter mutu, K3, hitungan ekonomi, dan <strong>validasi lapangan</strong> dari sesama UMKM.
        </p>
        <div class="mt-8 flex flex-wrap items-center gap-3">
          <RouterLink to="/cetak-biru" class="btn-primary btn-lg">Jelajahi Cetak Biru <ArrowRight class="h-4 w-4" /></RouterLink>
          <RouterLink to="/pohon-nilai" class="btn-secondary btn-lg"><Network class="h-4 w-4" /> Pohon Nilai</RouterLink>
        </div>
        <div class="mt-10 flex items-center gap-8">
          <div><p class="font-display text-2xl font-bold text-ink">8</p><p class="text-sm text-muted">Cetak biru teknis</p></div>
          <span class="h-10 w-px bg-line" />
          <div><p class="font-display text-2xl font-bold text-ink">14</p><p class="text-sm text-muted">Produk turunan</p></div>
          <span class="h-10 w-px bg-line" />
          <div><p class="font-display text-2xl font-bold text-ink">500+</p><p class="text-sm text-muted">Pelaku UMKM</p></div>
        </div>
      </div>

      <!-- Kartu hero -->
      <div class="relative hidden lg:block">
        <div class="absolute -left-6 top-6 w-64 rotate-[-6deg] premium-card p-4 shadow-card-hover">
          <div class="mb-2 flex items-center gap-2">
            <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success"><BadgeCheck class="h-5 w-5" /></span>
            <p class="text-sm font-semibold">Tervalidasi 12 UMKM</p>
          </div>
          <div class="h-2 w-full overflow-hidden rounded-full bg-line"><div class="h-full w-3/4 rounded-full bg-success" /></div>
          <p class="mt-1.5 text-xs text-muted">75% berhasil direplikasi</p>
        </div>
        <div class="ml-16 mt-2 w-72 rotate-[4deg] overflow-hidden premium-card shadow-card-hover">
          <div :class="gradientFor('coco-hero')" class="aspect-[16/10] bg-gradient-to-br">
            <div class="flex h-full items-center justify-center"><Recycle class="h-20 w-20 text-white/30" /></div>
          </div>
          <div class="p-4">
            <p class="font-display font-semibold text-ink">Briket Tempurung</p>
            <p class="mt-1 text-xs text-muted">Modal Rp200rb · BEP ≈ 11 batch · Sedang</p>
          </div>
        </div>
        <div class="absolute -bottom-4 left-4 flex items-center gap-2.5 premium-card px-4 py-3 shadow-card-hover">
          <span class="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600"><Calculator class="h-4 w-4" /></span>
          <div><p class="text-sm font-semibold text-ink">Laba Rp1,1jt/mgg</p><p class="text-[11px] text-muted">dari 200 kg tempurung</p></div>
        </div>
      </div>
    </div>
  </section>

  <!-- PEMBEDA -->
  <section class="border-b border-line bg-surface py-12">
    <div class="container-page grid gap-6 md:grid-cols-3">
      <div v-for="(p, i) in pembeda" :key="i" class="flex gap-4">
        <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600"><component :is="p.icon" class="h-6 w-6" /></span>
        <div>
          <h3 class="font-display font-semibold text-ink">{{ p.title }}</h3>
          <p class="mt-1 text-sm leading-relaxed text-muted">{{ p.desc }}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- CETAK BIRU UNGGULAN -->
  <section class="container-page py-16">
    <div class="mb-8 flex items-end justify-between">
      <div>
        <h2 class="text-h1">Cetak Biru Unggulan</h2>
        <p class="mt-1 text-muted">Paling matang & tervalidasi oleh komunitas UMKM.</p>
      </div>
      <RouterLink to="/cetak-biru" class="hidden items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 sm:inline-flex">
        Lihat semua <ArrowRight class="h-4 w-4" />
      </RouterLink>
    </div>
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <template v-if="loading"><SkeletonCard v-for="i in 6" :key="i" /></template>
      <template v-else><BlueprintCard v-for="b in blueprints.slice(0, 6)" :key="b.id" :blueprint="b" /></template>
    </div>
  </section>

  <!-- POHON NILAI TEASER -->
  <section class="border-y border-line bg-surface py-16">
    <div class="container-page">
      <div class="mb-8 text-center">
        <h2 class="text-h1">Mulai dari Limbah yang Anda Punya</h2>
        <p class="mt-1 text-muted">Telusuri Pohon Nilai Kelapa — tiap bagian punya potensi ekonomi.</p>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <RouterLink v-for="w in wasteTeasers" :key="w.slug" :to="`/cetak-biru?wasteKind=${w.slug}`" class="premium-card premium-card-hover group p-5 text-center">
          <span :class="gradientFor(w.label)" class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white"><component :is="w.icon" class="h-7 w-7" /></span>
          <p class="mt-3 font-display font-semibold text-ink group-hover:text-primary-700">{{ w.label }}</p>
          <p class="mt-0.5 text-xs text-muted">{{ w.desc }}</p>
        </RouterLink>
      </div>
      <div class="mt-8 text-center">
        <RouterLink to="/pohon-nilai" class="btn-secondary btn-md"><Network class="h-4 w-4" /> Buka Pohon Nilai Lengkap</RouterLink>
      </div>
    </div>
  </section>

  <!-- SIKLUS KONTRIBUSI -->
  <section class="container-page py-16">
    <div class="mb-10 text-center">
      <h2 class="text-h1">Pengetahuan yang Tumbuh Bersama</h2>
      <p class="mt-1 text-muted">Tiga langkah dari pengalaman lapangan menjadi pengetahuan tervalidasi.</p>
    </div>
    <div class="grid gap-6 md:grid-cols-3">
      <div class="relative premium-card p-6">
        <span class="absolute right-5 top-5 font-display text-5xl font-extrabold text-primary-50">1</span>
        <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white"><PenLine class="h-6 w-6" /></span>
        <h3 class="mt-4 text-h3">Tulis Cetak Biru</h3>
        <p class="mt-2 text-sm leading-relaxed text-muted">UMKM mendokumentasikan resep teknis terstruktur dari praktik lapangan.</p>
      </div>
      <div class="relative premium-card p-6">
        <span class="absolute right-5 top-5 font-display text-5xl font-extrabold text-primary-50">2</span>
        <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white"><ShieldCheck class="h-6 w-6" /></span>
        <h3 class="mt-4 text-h3">Kurasi & Replikasi</h3>
        <p class="mt-2 text-sm leading-relaxed text-muted">Moderator mengkurasi; UMKM lain mencoba & melaporkan hasil ("Sudah Saya Coba").</p>
      </div>
      <div class="relative premium-card p-6">
        <span class="absolute right-5 top-5 font-display text-5xl font-extrabold text-primary-50">3</span>
        <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white"><TrendingUp class="h-6 w-6" /></span>
        <h3 class="mt-4 text-h3">Naik Kematangan</h3>
        <p class="mt-2 text-sm leading-relaxed text-muted">Makin banyak yang berhasil → cetak biru naik dari Mentah → Standar Rujukan.</p>
      </div>
    </div>
  </section>

  <!-- SIMBIOSIS INDUSTRI -->
  <section class="border-y border-line bg-surface py-16">
    <div class="container-page">
      <div class="mb-8 text-center">
        <span class="chip mb-3 bg-primary-50 text-primary-700"><Repeat2 class="h-3.5 w-3.5" /> Simbiosis Industri</span>
        <h2 class="text-h1">Pengetahuan yang Terhubung ke Ekonomi</h2>
        <p class="mx-auto mt-1 max-w-xl text-muted">Bukan sekadar belajar — temukan mitra, jual surplus, dan dapatkan bahan baku.</p>
      </div>
      <div class="grid gap-6 md:grid-cols-2">
        <RouterLink to="/bursa" class="premium-card premium-card-hover group flex items-center gap-5 p-6">
          <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white"><Repeat2 class="h-7 w-7" /></span>
          <div class="flex-1">
            <h3 class="font-display text-h3 group-hover:text-primary-700">Bursa Limbah & Produk</h3>
            <p class="mt-1 text-sm text-muted">Pertemukan surplus limbah dengan kebutuhan bahan baku antar-UMKM.</p>
          </div>
          <ArrowRight class="h-5 w-5 text-muted transition-transform group-hover:translate-x-1" />
        </RouterLink>
        <RouterLink to="/direktori" class="premium-card premium-card-hover group flex items-center gap-5 p-6">
          <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold-500 text-white"><Users class="h-7 w-7" /></span>
          <div class="flex-1">
            <h3 class="font-display text-h3 group-hover:text-primary-700">Direktori & Peta UMKM</h3>
            <p class="mt-1 inline-flex items-center gap-1 text-sm text-muted"><MapPin class="h-3.5 w-3.5" /> Temukan mitra di sentra kelapa seluruh Indonesia.</p>
          </div>
          <ArrowRight class="h-5 w-5 text-muted transition-transform group-hover:translate-x-1" />
        </RouterLink>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="container-page pb-20">
    <div class="relative overflow-hidden rounded-3xl bg-primary-800 px-8 py-14 text-center text-white">
      <div class="hero-mesh absolute inset-0 opacity-60" />
      <div class="relative mx-auto max-w-2xl">
        <h2 class="font-display text-3xl font-bold">Punya teknik andalan mengolah limbah kelapa?</h2>
        <p class="mt-3 text-white/80">Bagikan sebagai cetak biru, bantu ribuan UMKM, dan raih lencana kontributor.</p>
        <div class="mt-7 flex flex-wrap justify-center gap-3">
          <RouterLink to="/register" class="btn-lg inline-flex items-center gap-2 rounded-xl bg-white px-6 font-semibold text-primary-700 transition-transform hover:scale-[1.02]">
            Daftar & Berkontribusi <ArrowRight class="h-4 w-4" />
          </RouterLink>
          <RouterLink to="/cetak-biru" class="btn-lg inline-flex items-center rounded-xl bg-white/15 px-6 font-semibold text-white backdrop-blur transition-colors hover:bg-white/25">Lihat Cetak Biru</RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
