<script setup lang="ts">
import { computed } from 'vue'
import { gradientFor } from '@/lib/format'

const props = withDefaults(
  defineProps<{ seed: string; label?: string; ratio?: 'video' | 'wide' | 'square' }>(),
  { ratio: 'video' },
)
const grad = computed(() => gradientFor(props.seed))
const aspect = computed(() => ({ video: 'aspect-[16/9]', wide: 'aspect-[3/1]', square: 'aspect-square' })[props.ratio])
</script>

<template>
  <div :class="[aspect, grad]" class="relative overflow-hidden bg-gradient-to-br">
    <div class="absolute inset-0 opacity-25" style="background-image: radial-gradient(circle at 30% 20%, white 1px, transparent 1.5px); background-size: 22px 22px" />
    <svg class="absolute -bottom-6 -right-4 h-32 w-32 text-white/15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c5 0 9 4 9 9 0 5-4 9-9 9s-9-4-9-9 4-9 9-9Zm0 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
    </svg>
    <span v-if="label" class="absolute left-3 top-3 chip bg-white/85 text-primary-700 backdrop-blur">{{ label }}</span>
    <slot />
  </div>
</template>
