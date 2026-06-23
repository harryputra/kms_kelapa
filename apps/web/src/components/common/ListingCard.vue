<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { MapPin, Package, Phone, Lock, ArrowUpRight, Search } from 'lucide-vue-next'
import type { WasteListing } from '@/types'
import { useAuthStore } from '@/stores/auth'
import { relativeTime } from '@/lib/format'

defineProps<{ listing: WasteListing }>()
const auth = useAuthStore()
</script>

<template>
  <div class="premium-card flex flex-col p-5">
    <div class="mb-3 flex items-start justify-between gap-2">
      <span class="chip" :class="listing.kind === 'surplus' ? 'bg-success/10 text-success' : 'bg-info/10 text-info'">
        <component :is="listing.kind === 'surplus' ? ArrowUpRight : Search" class="h-3.5 w-3.5" />
        {{ listing.kind === 'surplus' ? 'Tersedia (surplus)' : 'Dicari (kebutuhan)' }}
      </span>
      <span class="text-xs text-muted">{{ relativeTime(listing.createdAt) }}</span>
    </div>

    <h3 class="font-display text-lg font-semibold text-ink">{{ listing.material }}</h3>
    <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
      <span class="inline-flex items-center gap-1"><Package class="h-3.5 w-3.5" />{{ listing.quantity }}</span>
      <span class="inline-flex items-center gap-1"><MapPin class="h-3.5 w-3.5" />{{ listing.region }}</span>
    </div>
    <p v-if="listing.price" class="mt-1 text-sm font-medium text-primary-700">{{ listing.price }}</p>
    <p class="mt-2 line-clamp-2 text-sm text-muted">{{ listing.note }}</p>

    <div class="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3">
      <div>
        <p class="text-sm font-medium text-ink">{{ listing.umkmName }}</p>
        <p v-if="auth.isAuthenticated" class="inline-flex items-center gap-1 text-xs text-primary-600">
          <Phone class="h-3 w-3" />{{ listing.contact }}
        </p>
        <RouterLink v-else to="/login" class="inline-flex items-center gap-1 text-xs text-muted hover:text-primary-600">
          <Lock class="h-3 w-3" />Login untuk lihat kontak
        </RouterLink>
      </div>
      <a
        v-if="auth.isAuthenticated"
        :href="`https://wa.me/${listing.contact.replace(/\D/g, '')}`"
        target="_blank"
        rel="noopener"
        class="btn-secondary btn-sm"
      >
        Hubungi
      </a>
    </div>
  </div>
</template>
