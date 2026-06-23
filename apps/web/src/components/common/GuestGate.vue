<script setup lang="ts">
// Teaser fitur untuk pengunjung yang belum login — menyampaikan nilai fitur
// secara jelas & menarik, lalu mendorong registrasi (alih-alih halaman kosong).
import type { Component } from 'vue'
import { RouterLink } from 'vue-router'
import { Check, Sparkles, UserPlus, LogIn, ArrowRight, Lock } from 'lucide-vue-next'

defineProps<{
  icon: Component
  title: string
  tagline: string
  benefits: string[]
  preview?: string
}>()
</script>

<template>
  <div class="container-page py-10 sm:py-16">
    <div class="mx-auto max-w-3xl">
      <div class="relative overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
        <!-- aksen hero -->
        <div class="relative bg-primary-800 px-7 py-9 text-white sm:px-10 sm:py-11">
          <div class="hero-mesh absolute inset-0 opacity-60" />
          <div class="relative">
            <span class="chip mb-4 inline-flex items-center gap-1.5 bg-white/15 text-white">
              <Lock class="h-3 w-3" /> Fitur Komunitas · khusus anggota
            </span>
            <div class="flex items-start gap-4">
              <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                <component :is="icon" class="h-7 w-7" />
              </span>
              <div>
                <h1 class="font-display text-2xl font-bold leading-tight sm:text-3xl">{{ title }}</h1>
                <p class="mt-1.5 max-w-xl text-white/85">{{ tagline }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- isi -->
        <div class="px-7 py-7 sm:px-10 sm:py-8">
          <p class="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
            <Sparkles class="h-4 w-4 text-primary-500" /> Yang Anda dapatkan
          </p>
          <ul class="grid gap-2.5 sm:grid-cols-2">
            <li v-for="b in benefits" :key="b" class="flex items-start gap-2.5 rounded-xl bg-canvas p-3 text-sm text-ink/90">
              <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success"><Check class="h-3.5 w-3.5" /></span>
              {{ b }}
            </li>
          </ul>

          <p v-if="preview" class="mt-4 rounded-xl border border-dashed border-line bg-canvas/60 p-3 text-sm text-muted">{{ preview }}</p>

          <!-- CTA -->
          <div class="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <RouterLink to="/register" class="btn-primary btn-lg justify-center sm:w-auto">
              <UserPlus class="h-4.5 w-4.5" /> Daftar Gratis
            </RouterLink>
            <RouterLink to="/login" class="btn-secondary btn-lg justify-center sm:w-auto">
              <LogIn class="h-4.5 w-4.5" /> Sudah punya akun? Masuk
            </RouterLink>
          </div>
          <p class="mt-3 text-xs text-muted">Gratis untuk UMKM — tanpa biaya, tanpa kartu kredit. Daftar &lt; 1 menit.</p>

          <!-- jalur terbuka -->
          <div class="mt-6 border-t border-line pt-4">
            <RouterLink to="/cetak-biru" class="group inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:text-primary-800">
              Cuma ingin lihat-lihat dulu? Jelajahi <strong>Cetak Biru Teknis</strong> yang terbuka untuk umum
              <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
