<script setup lang="ts">
import { Sprout, Users, ShieldCheck } from 'lucide-vue-next'
import BrandLogo from './BrandLogo.vue'

const points = [
  { icon: Sprout, text: 'Dokumentasikan & bagikan praktik olah limbah kelapa' },
  { icon: Users, text: 'Bergabung dengan komunitas UMKM agroindustri' },
  { icon: ShieldCheck, text: 'Konten terkurasi moderator — kredibel & tepercaya' },
]
</script>

<template>
  <div class="grid min-h-screen lg:grid-cols-2">
    <!-- Panel brand -->
    <div class="relative hidden flex-col justify-between overflow-hidden bg-primary-800 p-12 text-white lg:flex">
      <div class="hero-mesh absolute inset-0 opacity-70" />
      <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 20% 20%, white 1px, transparent 1.5px); background-size: 28px 28px" />
      <div class="relative">
        <BrandLogo dark />
      </div>
      <div class="relative space-y-6">
        <h2 class="max-w-md font-display text-3xl font-bold leading-tight">
          Dari limbah kelapa, menuju pengetahuan yang bernilai.
        </h2>
        <ul class="space-y-3">
          <li v-for="(p, i) in points" :key="i" class="flex items-center gap-3 text-white/90">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <component :is="p.icon" class="h-4.5 w-4.5" />
            </span>
            <span class="text-sm">{{ p.text }}</span>
          </li>
        </ul>
      </div>
      <p class="relative text-xs text-white/60">© {{ new Date().getFullYear() }} COCONEXUS — Platform Pengetahuan UMKM Kelapa</p>
    </div>

    <!-- Panel form -->
    <div class="flex flex-col bg-canvas">
      <div class="p-6 lg:hidden">
        <BrandLogo />
      </div>
      <div class="flex flex-1 items-center justify-center p-6">
        <div class="w-full max-w-md">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
