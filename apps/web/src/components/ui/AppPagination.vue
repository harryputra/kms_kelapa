<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{ page: number; totalPages: number }>()
const emit = defineEmits<{ change: [page: number] }>()

const pages = computed(() => {
  const out: number[] = []
  const start = Math.max(1, props.page - 2)
  const end = Math.min(props.totalPages, start + 4)
  for (let i = start; i <= end; i++) out.push(i)
  return out
})
function go(p: number) {
  if (p >= 1 && p <= props.totalPages && p !== props.page) emit('change', p)
}
</script>

<template>
  <nav v-if="totalPages > 1" class="flex items-center justify-center gap-1.5" aria-label="Paginasi">
    <button class="btn-secondary btn-sm h-9 w-9 !px-0" :disabled="page === 1" aria-label="Sebelumnya" @click="go(page - 1)">
      <ChevronLeft class="h-4 w-4" />
    </button>
    <button
      v-for="p in pages"
      :key="p"
      class="h-9 w-9 rounded-xl text-sm font-medium transition-colors"
      :class="p === page ? 'bg-primary-600 text-white shadow-xs' : 'text-muted hover:bg-line/60'"
      @click="go(p)"
    >
      {{ p }}
    </button>
    <button class="btn-secondary btn-sm h-9 w-9 !px-0" :disabled="page === totalPages" aria-label="Berikutnya" @click="go(page + 1)">
      <ChevronRight class="h-4 w-4" />
    </button>
  </nav>
</template>
