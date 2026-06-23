<script setup lang="ts">
import { MessageCircleQuestion, BadgeCheck } from 'lucide-vue-next'
import QnaSection from '@/components/common/QnaSection.vue'
import GuestGate from '@/components/common/GuestGate.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const GUEST = {
  icon: MessageCircleQuestion,
  title: 'Tanya Pakar',
  tagline: 'Ajukan pertanyaan teknis seputar olah limbah kelapa dan dapatkan jawaban terverifikasi dari praktisi & akademisi.',
  benefits: [
    'Jawaban ditandai "Pakar Terverifikasi" dari moderator & praktisi',
    'Jawaban terbaik disorot agar mudah ditemukan',
    'Diskusi terkait langsung ke cetak biru teknis',
    'Bangun reputasi dengan membantu menjawab',
  ],
  preview: 'Punya kendala mutu briket atau EC cocopeat? Tanyakan, lalu dapatkan jawaban beralasan dari yang sudah berpengalaman.',
}
</script>

<template>
  <GuestGate v-if="!auth.isAuthenticated" v-bind="GUEST" />
  <div v-else class="container-page py-10">
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
