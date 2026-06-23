<script setup lang="ts">
import { computed, ref } from 'vue'
import { Search, BookA } from 'lucide-vue-next'
import { GLOSSARY } from '@/lib/glossary'

const q = ref('')
const entries = computed(() => {
  const all = Object.entries(GLOSSARY).sort((a, b) => a[0].localeCompare(b[0]))
  if (!q.value.trim()) return all
  const s = q.value.toLowerCase()
  return all.filter(([term, def]) => term.includes(s) || def.toLowerCase().includes(s))
})
</script>

<template>
  <div class="container-page py-10">
    <div class="mb-8 max-w-2xl">
      <span class="chip mb-3 bg-primary-50 text-primary-700"><BookA class="h-3.5 w-3.5" /> Bahasa Sederhana</span>
      <h1 class="text-h1">Glosarium Istilah Teknis</h1>
      <p class="mt-2 text-muted">Penjelasan ringkas istilah pengolahan limbah kelapa. Istilah ini juga muncul sebagai tooltip di seluruh cetak biru.</p>
    </div>

    <div class="relative mb-6 max-w-md">
      <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input v-model="q" type="search" placeholder="Cari istilah…" class="field pl-10" />
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <div v-for="[term, def] in entries" :key="term" class="premium-card p-5">
        <h3 class="font-display font-semibold capitalize text-primary-700">{{ term }}</h3>
        <p class="mt-1.5 text-sm leading-relaxed text-muted">{{ def }}</p>
      </div>
    </div>
    <p v-if="!entries.length" class="py-10 text-center text-sm text-muted">Tidak ada istilah yang cocok.</p>
  </div>
</template>
