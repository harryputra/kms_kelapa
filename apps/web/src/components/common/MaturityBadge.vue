<script setup lang="ts">
import { computed } from 'vue'
import { Sprout, SearchCheck, BadgeCheck, Award } from 'lucide-vue-next'
import type { Maturity } from '@/types'
import { MATURITY } from '@/lib/blueprint'

const props = withDefaults(defineProps<{ maturity: Maturity; showLevel?: boolean }>(), { showLevel: false })
const meta = computed(() => MATURITY[props.maturity])
const icons = { sprout: Sprout, 'search-check': SearchCheck, 'badge-check': BadgeCheck, award: Award }
</script>

<template>
  <span class="chip" :class="meta.chip">
    <component :is="icons[meta.icon as keyof typeof icons]" class="h-3.5 w-3.5" />
    {{ meta.label }}<span v-if="showLevel" class="opacity-60"> · L{{ meta.level }}</span>
  </span>
</template>
