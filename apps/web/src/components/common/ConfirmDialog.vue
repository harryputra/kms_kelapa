<script setup lang="ts">
import AppModal from '@/components/ui/AppModal.vue'
import AppButton from '@/components/ui/AppButton.vue'

withDefaults(
  defineProps<{
    open: boolean
    title: string
    message: string
    confirmLabel?: string
    danger?: boolean
    loading?: boolean
  }>(),
  { confirmLabel: 'Konfirmasi' },
)
const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <AppModal :open="open" :title="title" size="sm" @close="emit('cancel')">
    <p class="text-sm text-muted">{{ message }}</p>
    <template #footer>
      <AppButton variant="ghost" @click="emit('cancel')">Batal</AppButton>
      <AppButton :variant="danger ? 'danger' : 'primary'" :loading="loading" @click="emit('confirm')">
        {{ confirmLabel }}
      </AppButton>
    </template>
  </AppModal>
</template>
