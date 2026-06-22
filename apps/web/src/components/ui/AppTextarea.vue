<script setup lang="ts">
defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
  error?: string
  hint?: string
  rows?: number
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
    <textarea
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows ?? 4"
      :aria-invalid="!!error"
      class="field min-h-[120px] resize-y"
      :class="{ 'field-error': error }"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <p v-if="error" class="mt-1.5 text-xs text-danger">⚠ {{ error }}</p>
    <p v-else-if="hint" class="mt-1.5 text-xs text-muted">{{ hint }}</p>
  </div>
</template>
