<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { X } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{ open: boolean; title?: string; size?: 'sm' | 'md' | 'lg' }>(),
  { size: 'md' },
)
const emit = defineEmits<{ close: [] }>()

const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' }

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) emit('close')
}
onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
watch(
  () => props.open,
  (v) => {
    document.body.style.overflow = v ? 'hidden' : ''
  },
)
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 backdrop-blur-sm sm:items-center"
        role="dialog"
        aria-modal="true"
        @click.self="emit('close')"
      >
        <div
          class="w-full rounded-2xl bg-surface shadow-modal animate-slide-up"
          :class="sizes[size]"
        >
          <div v-if="title || $slots.header" class="flex items-center justify-between border-b border-line px-5 py-4">
            <h3 class="text-h3">{{ title }}<slot name="header" /></h3>
            <button class="btn-ghost btn-sm -mr-2 h-8 w-8 !px-0" aria-label="Tutup" @click="emit('close')">
              <X class="h-4 w-4" />
            </button>
          </div>
          <div class="px-5 py-4">
            <slot />
          </div>
          <div v-if="$slots.footer" class="flex justify-end gap-2 border-t border-line px-5 py-4">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
