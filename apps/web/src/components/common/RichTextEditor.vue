<script setup lang="ts">
// Editor ringan bebas-dependensi (contenteditable) untuk demo frontend.
// Di produksi diganti TipTap (lihat rencana_pengembangan.md §2.1) untuk sanitasi & ekstensi.
import { onMounted, ref, watch } from 'vue'
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Link2 } from 'lucide-vue-next'

const props = defineProps<{ modelValue: string; placeholder?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const editor = ref<HTMLElement | null>(null)

function exec(cmd: string, value?: string) {
  document.execCommand(cmd, false, value)
  editor.value?.focus()
  sync()
}
function sync() {
  emit('update:modelValue', editor.value?.innerHTML ?? '')
}
function addLink() {
  const url = window.prompt('Masukkan URL:')
  if (url) exec('createLink', url)
}

const tools = [
  { icon: Bold, action: () => exec('bold'), title: 'Tebal' },
  { icon: Italic, action: () => exec('italic'), title: 'Miring' },
  { icon: Heading2, action: () => exec('formatBlock', 'H2'), title: 'Judul 2' },
  { icon: Heading3, action: () => exec('formatBlock', 'H3'), title: 'Judul 3' },
  { icon: List, action: () => exec('insertUnorderedList'), title: 'Daftar' },
  { icon: ListOrdered, action: () => exec('insertOrderedList'), title: 'Daftar bernomor' },
  { icon: Quote, action: () => exec('formatBlock', 'BLOCKQUOTE'), title: 'Kutipan' },
  { icon: Link2, action: addLink, title: 'Tautan' },
]

onMounted(() => {
  if (editor.value && props.modelValue) editor.value.innerHTML = props.modelValue
})
watch(
  () => props.modelValue,
  (v) => {
    if (editor.value && v !== editor.value.innerHTML) editor.value.innerHTML = v
  },
)
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-line bg-white focus-within:border-primary-500 focus-within:shadow-focus-primary">
    <div class="flex flex-wrap items-center gap-0.5 border-b border-line bg-canvas/60 p-1.5">
      <button
        v-for="(t, i) in tools"
        :key="i"
        type="button"
        class="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white hover:text-primary-600"
        :title="t.title"
        @click="t.action"
      >
        <component :is="t.icon" class="h-4 w-4" />
      </button>
    </div>
    <div
      ref="editor"
      class="prose-coco min-h-[260px] px-4 py-3 focus:outline-none"
      contenteditable="true"
      :data-placeholder="placeholder"
      @input="sync"
    />
  </div>
</template>

<style scoped>
[contenteditable][data-placeholder]:empty::before {
  content: attr(data-placeholder);
  color: #9aa8a0;
}
</style>
