<script setup lang="ts">
import { Search, Lightbulb, FolderTree, Share2, Rocket } from 'lucide-vue-next'

const cycle = [
  { icon: Search, title: 'Discovery', desc: 'Menemukan pengetahuan dari pengalaman lapangan UMKM.' },
  { icon: Lightbulb, title: 'Creation', desc: 'Mengubah pengetahuan tacit menjadi artikel eksplisit.' },
  { icon: FolderTree, title: 'Organization', desc: 'Mengkurasi & mengkategorikan konten oleh moderator.' },
  { icon: Share2, title: 'Dissemination', desc: 'Menyebarkan melalui forum, vote, dan notifikasi.' },
  { icon: Rocket, title: 'Utilization', desc: 'Diterapkan UMKM untuk meningkatkan nilai produk.' },
]
</script>

<template>
  <div class="container-page py-14">
    <div class="mx-auto max-w-3xl text-center">
      <h1 class="font-display text-4xl font-bold text-ink">Tentang COCONEXUS</h1>
      <p class="mt-4 text-lg leading-relaxed text-muted">
        COCONEXUS adalah Knowledge Management System partisipatif yang memberdayakan pelaku UMKM agroindustri kelapa Indonesia untuk berkolaborasi dan berinovasi dari limbah — mendorong ekonomi sirkular yang berkelanjutan.
      </p>
    </div>

    <div class="mx-auto mt-14 max-w-5xl">
      <h2 class="text-center text-h2">Siklus Manajemen Pengetahuan</h2>
      <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div v-for="(c, i) in cycle" :key="i" class="premium-card p-5 text-center">
          <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-xs">
            <component :is="c.icon" class="h-6 w-6" />
          </span>
          <h3 class="mt-3 font-display font-semibold text-ink">{{ c.title }}</h3>
          <p class="mt-1.5 text-xs leading-relaxed text-muted">{{ c.desc }}</p>
        </div>
      </div>
    </div>

    <div class="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-2">
      <div class="premium-card p-6">
        <h3 class="text-h3">Visi</h3>
        <p class="mt-2 text-sm leading-relaxed text-muted">
          Menjadi ekosistem pembelajaran sirkular terdepan yang memberdayakan ribuan UMKM kelapa Indonesia untuk berkolaborasi dan berinovasi dari limbah.
        </p>
      </div>
      <div class="premium-card p-6">
        <h3 class="text-h3">Misi</h3>
        <ul class="mt-2 space-y-1.5 text-sm leading-relaxed text-muted">
          <li>• Repositori pengetahuan dua arah (pakar & UMKM).</li>
          <li>• Fasilitasi interaksi melalui forum & fitur sosial.</li>
          <li>• Dorong adopsi prinsip ekonomi sirkular.</li>
        </ul>
      </div>
    </div>
  </div>
</template>
