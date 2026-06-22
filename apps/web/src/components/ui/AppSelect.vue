<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'

defineProps<{
  modelValue: string | number
  label?: string
  options: Array<{ value: string | number; label: string }>
  error?: string
  placeholder?: string
  required?: boolean
  id?: string
}>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div>
    <label v-if="label" :for="id" class="label">
      {{ label }} <span v-if="required" class="text-danger">*</span>
    </label>
    <div class="relative">
      <select
        :id="id"
        :value="modelValue"
        class="field appearance-none pr-10"
        :class="{ 'field-error': error }"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
      </select>
      <ChevronDown class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
    </div>
    <p v-if="error" class="mt-1.5 text-xs text-danger">⚠ {{ error }}</p>
  </div>
</template>
