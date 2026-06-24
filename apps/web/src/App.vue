<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PublicLayout from '@/components/layout/PublicLayout.vue'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import ToastHost from '@/components/common/ToastHost.vue'

const route = useRoute()
const layouts = { public: PublicLayout, auth: AuthLayout, dashboard: DashboardLayout }
const layout = computed(() => layouts[route.meta.layout ?? 'public'])
</script>

<template>
  <component :is="layout">
    <router-view v-slot="{ Component }">
      <transition name="page">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </component>
  <ToastHost />
</template>

<style>
/* Fade masuk halus tanpa mode out-in (out-in di dalam slot layout dinamis
   menyebabkan view berikutnya gagal ter-mount → halaman kosong). */
.page-enter-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
</style>
