<script setup lang="ts">
import { MessageCircleQuestion, BadgeCheck } from 'lucide-vue-next'
import QnaSection from '@/components/common/QnaSection.vue'
</script>

<template>
  <div class="container-page py-10">
    <div class="mb-8 max-w-2xl">
      <span class="chip mb-3 bg-primary-50 text-primary-700"><MessageCircleQuestion class="h-3.5 w-3.5" /> Tanya Pakar</span>
      <h1 class="text-h1">Bertanya pada Komunitas & Pakar</h1>
      <p class="mt-2 text-muted">
        Ajukan pertanyaan teknis seputar pengolahan limbah kelapa. Jawaban dari moderator & praktisi ditandai
        <span class="inline-flex items-center gap-1 align-middle text-info"><BadgeCheck class="h-3.5 w-3.5" />Pakar Terverifikasi</span>,
        dan jawaban terbaik disorot.
      </p>
    </div>

    <QnaSection :blueprint-id="null" :blueprint-title="null" :show-context="true" />
  </div>
</template>
