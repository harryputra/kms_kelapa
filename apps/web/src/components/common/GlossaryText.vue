<script setup lang="ts">
import { computed } from 'vue'
import { glossarize } from '@/lib/glossary'

const props = defineProps<{ text: string }>()
const segments = computed(() => glossarize(props.text))
</script>

<template>
  <span>
    <template v-for="(s, i) in segments" :key="i">
      <abbr
        v-if="s.def"
        :title="s.def"
        class="cursor-help border-b border-dotted border-primary-400 font-medium text-primary-700 no-underline"
      >{{ s.text }}</abbr>
      <template v-else>{{ s.text }}</template>
    </template>
  </span>
</template>
