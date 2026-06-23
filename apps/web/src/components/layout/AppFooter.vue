<script setup lang="ts">
import { Download } from 'lucide-vue-next'
import BrandLogo from './BrandLogo.vue'
import { usePwaInstall } from '@/composables/usePwa'
const year = new Date().getFullYear()
const { canInstall, install } = usePwaInstall()
</script>

<template>
  <footer class="mt-16 border-t border-line bg-surface">
    <div class="container-page py-12">
      <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div class="lg:col-span-2">
          <BrandLogo />
          <p class="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            Platform manajemen pengetahuan pengelolaan limbah buah kelapa untuk UMKM agroindustri Indonesia — dari sabut hingga air, jadikan limbah bernilai.
          </p>
        </div>
        <div>
          <p class="mb-3 text-sm font-semibold text-ink">Jelajahi</p>
          <ul class="space-y-2 text-sm text-muted">
            <li><RouterLink to="/articles" class="hover:text-primary-600">Artikel</RouterLink></li>
            <li><RouterLink to="/forum" class="hover:text-primary-600">Forum</RouterLink></li>
            <li><RouterLink to="/tentang" class="hover:text-primary-600">Tentang</RouterLink></li>
          </ul>
        </div>
        <div>
          <p class="mb-3 text-sm font-semibold text-ink">Bantuan</p>
          <ul class="space-y-2 text-sm text-muted">
            <li><RouterLink to="/asisten" class="hover:text-primary-600">Asisten AI</RouterLink></li>
            <li><RouterLink to="/glosarium" class="hover:text-primary-600">Glosarium</RouterLink></li>
            <li><a href="#" class="hover:text-primary-600">Kebijakan Privasi</a></li>
          </ul>
        </div>
      </div>
      <div class="mt-10 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-muted sm:flex-row">
        <p>© {{ year }} COCONEXUS — KMS v2.0. Untuk UMKM Kelapa Indonesia.</p>
        <div class="flex items-center gap-4">
          <button v-if="canInstall" class="inline-flex items-center gap-1.5 font-medium text-primary-600 hover:text-primary-700" @click="install">
            <Download class="h-3.5 w-3.5" /> Pasang Aplikasi
          </button>
          <p>Dibuat untuk ekonomi sirkular 🌱</p>
        </div>
      </div>
    </div>
  </footer>
</template>
