<script setup lang="ts">
withDefaults(defineProps<{ to?: string; dark?: boolean }>(), { to: '/' })
</script>

<template>
  <RouterLink :to="to" class="group inline-flex items-center gap-2.5">
    <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 shadow-xs transition-transform group-hover:scale-105">
      <svg class="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2c5 0 9 4 9 9 0 5-4 9-9 9s-9-4-9-9 4-9 9-9Zm0 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
      </svg>
    </span>
    <span class="font-display text-lg font-bold tracking-tight" :class="dark ? 'text-white' : 'text-ink'">
      COCO<span class="text-primary-500">NEXUS</span>
    </span>
  </RouterLink>
</template>
