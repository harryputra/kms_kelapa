<script setup lang="ts">
import { computed } from 'vue'
import { Loader2 } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    type?: 'button' | 'submit' | 'reset'
    loading?: boolean
    disabled?: boolean
    block?: boolean
  }>(),
  { variant: 'primary', size: 'md', type: 'button' },
)

const classes = computed(() => [
  {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
  }[props.variant],
  { sm: 'btn-sm', md: 'btn-md', lg: 'btn-lg' }[props.size],
  props.block ? 'w-full' : '',
])
</script>

<template>
  <button :type="type" :class="classes" :disabled="disabled || loading">
    <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
    <slot v-else name="icon" />
    <slot />
  </button>
</template>
