<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { ArrowLeft, CheckCircle2, PencilLine, XCircle } from 'lucide-vue-next'
import { api, ApiError } from '@/api'
import { useUiStore } from '@/stores/ui'
import type { ArticleFull } from '@/types'
import AppAvatar from '@/components/ui/AppAvatar.vue'
import ArticleCover from '@/components/ui/ArticleCover.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import { formatDate } from '@/lib/format'

const route = useRoute()
const router = useRouter()
const ui = useUiStore()

const article = ref<ArticleFull | null>(null)
const loading = ref(true)
const id = computed(() => Number(route.params.id))

const modal = ref<null | 'revision' | 'reject'>(null)
const notes = ref('')
const processing = ref(false)

onMounted(async () => {
  try {
    article.value = (await api.getArticle(id.value, true)) as ArticleFull
  } finally {
    loading.value = false
  }
})

async function approve() {
  processing.value = true
  try {
    await api.reviewArticle(id.value, 'approve')
    ui.success('Artikel disetujui & diterbitkan. Notifikasi dikirim ke penulis.')
    router.push('/moderator/review')
  } finally {
    processing.value = false
  }
}

async function submitNotes() {
  if (!notes.value.trim()) {
    ui.error('Catatan reviewer wajib diisi.')
    return
  }
  processing.value = true
  try {
    await api.reviewArticle(id.value, modal.value!, notes.value)
    ui.success(modal.value === 'revision' ? 'Artikel dikembalikan untuk revisi.' : 'Artikel ditolak. Notifikasi dikirim.')
    router.push('/moderator/review')
  } catch (e) {
    ui.error(e instanceof ApiError ? e.message : 'Gagal memproses.')
  } finally {
    processing.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-5xl">
    <RouterLink to="/moderator/review" class="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary-600">
      <ArrowLeft class="h-4 w-4" /> Kembali ke antrean
    </RouterLink>

    <LoadingBlock v-if="loading" />
    <div v-else-if="article" class="grid gap-6 lg:grid-cols-[1fr_280px]">
      <!-- Artikel (readonly) -->
      <article class="premium-card p-6">
        <div class="mb-3 flex flex-wrap gap-2">
          <span class="chip bg-primary-50 text-primary-700">{{ article.category }}</span>
          <span v-for="t in article.tags" :key="t" class="chip bg-line/70 text-muted">#{{ t }}</span>
        </div>
        <h1 class="font-display text-2xl font-bold leading-tight text-ink">{{ article.title }}</h1>
        <div class="mt-4 flex items-center gap-2.5 border-b border-line pb-4">
          <AppAvatar :name="article.author.display_name" size="md" />
          <div>
            <p class="text-sm font-semibold text-ink">{{ article.author.display_name }}</p>
            <p class="text-xs text-muted">Dikirim {{ formatDate(article.published_at ?? new Date().toISOString()) }}</p>
          </div>
        </div>
        <ArticleCover :seed="article.title" class="mt-5 rounded-2xl" ratio="wide" />
        <div class="prose-coco mt-6" v-html="article.content" />
      </article>

      <!-- Panel aksi -->
      <aside class="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <div class="premium-card p-5">
          <h3 class="font-display font-semibold text-ink">Tindakan Review</h3>
          <p class="mt-1 text-xs text-muted">Pilih keputusan untuk artikel ini.</p>
          <div class="mt-4 space-y-2.5">
            <AppButton block :loading="processing" @click="approve">
              <template #icon><CheckCircle2 class="h-4 w-4" /></template> Terbitkan
            </AppButton>
            <button class="btn-secondary btn-md w-full border-warning/40 text-gold-700 hover:bg-warning/5" @click="modal = 'revision'; notes = ''">
              <PencilLine class="h-4 w-4" /> Minta Revisi
            </button>
            <button class="btn-md w-full justify-center gap-2 rounded-xl border border-danger/30 text-danger transition-colors hover:bg-danger/5" @click="modal = 'reject'; notes = ''">
              <XCircle class="h-4 w-4" /> Tolak
            </button>
          </div>
        </div>
        <div class="rounded-xl bg-info/5 p-4 text-xs leading-relaxed text-info">
          <strong>Catatan:</strong> Revisi & penolakan <u>wajib</u> menyertakan catatan agar penulis tahu alasannya.
        </div>
      </aside>
    </div>

    <!-- Modal catatan -->
    <AppModal :open="!!modal" :title="modal === 'revision' ? 'Minta Revisi' : 'Tolak Artikel'" size="md" @close="modal = null">
      <p class="mb-3 text-sm text-muted">
        Tulis catatan yang jelas dan membangun. Catatan ini dikirim sebagai notifikasi ke penulis.
      </p>
      <AppTextarea v-model="notes" :rows="5" placeholder="mis. Mohon tambahkan takaran bahan dan sumber referensi pada bagian fermentasi…" />
      <template #footer>
        <AppButton variant="ghost" @click="modal = null">Batal</AppButton>
        <AppButton :variant="modal === 'reject' ? 'danger' : 'primary'" :loading="processing" @click="submitNotes">
          {{ modal === 'revision' ? 'Kirim & Set Revisi' : 'Tolak Artikel' }}
        </AppButton>
      </template>
    </AppModal>
  </div>
</template>
