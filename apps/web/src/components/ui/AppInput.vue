<script setup lang="ts">
defineProps<{
  modelValue: string | number
  label?: string
  type?: string
  placeholder?: string
  error?: string
  hint?: string
  required?: boolean
  autocomplete?: string
  id?: string
}>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div>
    <label v-if="label" :for="id" class="label">
      {{ label }} <span v-if="required" class="text-danger">*</span>
    </label>
    <input
      :id="id"
      :type="type ?? 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :aria-invalid="!!error"
      class="field"
      :class="{ 'field-error': error }"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" class="mt-1.5 text-xs text-danger">⚠ {{ error }}</p>
    <p v-else-if="hint" class="mt-1.5 text-xs text-muted">{{ hint }}</p>
  </div>
</template>
