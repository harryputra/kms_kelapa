<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  icon?: unknown
  trend?: string
  tone?: 'primary' | 'gold' | 'success' | 'info'
}>()

const tones = {
  primary: 'bg-primary-50 text-primary-600',
  gold: 'bg-gold-100 text-gold-600',
  success: 'bg-success/10 text-success',
  info: 'bg-info/10 text-info',
}
</script>

<template>
  <div class="premium-card p-5">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm text-muted">{{ label }}</p>
        <p class="mt-1 font-display text-2xl font-bold text-ink">{{ value }}</p>
        <p v-if="trend" class="mt-1 text-xs font-medium text-success">{{ trend }}</p>
      </div>
      <div v-if="icon" class="flex h-11 w-11 items-center justify-center rounded-xl" :class="tones[tone ?? 'primary']">
        <component :is="icon" class="h-5 w-5" />
      </div>
    </div>
  </div>
</template>
