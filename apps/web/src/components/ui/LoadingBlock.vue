<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
defineProps<{ label?: string }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 py-16 text-muted">
    <Loader2 class="h-7 w-7 animate-spin text-primary-500" />
    <p class="text-sm">{{ label ?? 'Memuat…' }}</p>
  </div>
</template>
