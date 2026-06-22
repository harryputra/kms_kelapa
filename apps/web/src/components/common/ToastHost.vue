<script setup lang="ts">
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-vue-next'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()
const icons = { success: CheckCircle2, error: AlertCircle, info: Info, warning: AlertTriangle }
const tones = {
  success: 'text-success',
  error: 'text-danger',
  info: 'text-info',
  warning: 'text-gold-600',
}
</script>

<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6">
      <TransitionGroup name="toast">
        <div
          v-for="t in ui.toasts"
          :key="t.id"
          role="status"
          class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-line bg-surface p-3.5 shadow-dropdown"
        >
          <component :is="icons[t.kind]" class="mt-0.5 h-5 w-5 shrink-0" :class="tones[t.kind]" />
          <p class="flex-1 text-sm text-ink">{{ t.message }}</p>
          <button class="text-muted hover:text-ink" aria-label="Tutup" @click="ui.dismiss(t.id)">
            <X class="h-4 w-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.97);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
