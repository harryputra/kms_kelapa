<script setup lang="ts">
import { computed } from 'vue'
import { gradientFor, initialsOf } from '@/lib/format'

const props = withDefaults(
  defineProps<{ name: string; src?: string | null; size?: 'sm' | 'md' | 'lg' | 'xl' }>(),
  { size: 'md' },
)

const dim = computed(
  () => ({ sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-base', xl: 'h-20 w-20 text-xl' })[props.size],
)
const grad = computed(() => gradientFor(props.name))
const initials = computed(() => initialsOf(props.name))
</script>

<template>
  <img
    v-if="src"
    :src="src"
    :alt="name"
    :class="dim"
    class="inline-block shrink-0 rounded-full object-cover ring-2 ring-white"
  />
  <span
    v-else
    :class="[dim, grad]"
    class="inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white ring-2 ring-white"
    :aria-label="name"
  >
    {{ initials }}
  </span>
</template>
