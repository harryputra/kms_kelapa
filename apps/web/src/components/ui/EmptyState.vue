<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'

defineProps<{ title: string; description?: string; icon?: unknown }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-canvas/60 px-6 py-14 text-center">
    <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
      <component :is="icon ?? Inbox" class="h-7 w-7" />
    </div>
    <h3 class="text-h3 text-ink">{{ title }}</h3>
    <p v-if="description" class="mt-1.5 max-w-sm text-sm text-muted">{{ description }}</p>
    <div class="mt-5">
      <slot />
    </div>
  </div>
</template>
