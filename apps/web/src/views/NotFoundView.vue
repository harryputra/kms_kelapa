<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Home } from 'lucide-vue-next'
</script>

<template>
  <div class="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
    <p class="font-display text-7xl font-extrabold text-primary-100">404</p>
    <h1 class="mt-2 text-h1">Halaman tidak ditemukan</h1>
    <p class="mt-2 max-w-sm text-muted">Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.</p>
    <RouterLink to="/" class="btn-primary btn-lg mt-6"><Home class="h-4 w-4" /> Kembali ke Beranda</RouterLink>
  </div>
</template>
