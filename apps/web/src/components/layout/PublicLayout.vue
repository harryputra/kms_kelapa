<script setup lang="ts">
import PublicHeader from './PublicHeader.vue'
import AppFooter from './AppFooter.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-canvas">
    <PublicHeader />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
