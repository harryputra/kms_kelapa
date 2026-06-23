<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  MessageCircleQuestion, ThumbsUp, BadgeCheck, CheckCircle2, Send, Plus, Award, CornerDownRight,
} from 'lucide-vue-next'
import { api, ApiError } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import type { QnaQuestion } from '@/types'
import { relativeTime } from '@/lib/format'
import AppAvatar from '@/components/ui/AppAvatar.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'

const props = withDefaults(
  defineProps<{ blueprintId?: number | null; blueprintTitle?: string | null; showContext?: boolean }>(),
  { blueprintId: null, blueprintTitle: null, showContext: false },
)

const auth = useAuthStore()
const ui = useUiStore()
const items = ref<QnaQuestion[]>([])
const loading = ref(true)

const asking = ref(false)
const askForm = reactive({ title: '', content: '' })
const posting = ref(false)
const answerDraft = reactive<Record<number, string>>({})
const answering = ref<number | null>(null)

async function load() {
  loading.value = true
  try {
    items.value = await api.listQuestions(props.blueprintId)
  } finally {
    loading.value = false
  }
}

function canMarkBest(q: QnaQuestion) {
  return auth.isAuthenticated && (q.user.id === auth.user?.id || auth.isModerator)
}

async function submitAsk() {
  if (askForm.title.trim().length < 8) return ui.error('Pertanyaan minimal 8 karakter.')
  posting.value = true
  try {
    const q = await api.askQuestion(props.blueprintId, props.blueprintTitle, askForm.title.trim(), askForm.content.trim())
    items.value.unshift(q)
    askForm.title = ''
    askForm.content = ''
    asking.value = false
    ui.success('Pertanyaan terkirim.')
  } catch (e) {
    ui.error(e instanceof ApiError ? e.message : 'Gagal mengirim.')
  } finally {
    posting.value = false
  }
}

async function submitAnswer(q: QnaQuestion) {
  const text = (answerDraft[q.id] ?? '').trim()
  if (!text) return
  answering.value = q.id
  try {
    const a = await api.answerQuestion(q.id, text)
    q.answers.push(a)
    answerDraft[q.id] = ''
    ui.success('Jawaban terkirim.')
  } finally {
    answering.value = null
  }
}

async function vote(q: QnaQuestion, answerId: number) {
  if (!auth.isAuthenticated) return ui.warning('Login untuk memberi suara.')
  const a = q.answers.find((x) => x.id === answerId)
  if (!a) return
  a.myVote = !a.myVote
  a.votes += a.myVote ? 1 : -1
  await api.voteAnswer(q.id, answerId)
}

async function markBest(q: QnaQuestion, answerId: number) {
  q.answers.forEach((a) => (a.isBest = a.id === answerId))
  q.solved = true
  await api.markBestAnswer(q.id, answerId)
  ui.success('Jawaban terbaik ditandai.')
}

onMounted(load)
</script>

<template>
  <div>
    <!-- Ajukan -->
    <div class="mb-5">
      <div v-if="!asking" class="flex items-center justify-between">
        <p class="text-sm text-muted">{{ items.length }} pertanyaan</p>
        <AppButton size="sm" @click="auth.isAuthenticated ? (asking = true) : ui.warning('Login untuk bertanya.')">
          <template #icon><Plus class="h-4 w-4" /></template> Ajukan Pertanyaan
        </AppButton>
      </div>
      <div v-else class="premium-card space-y-3 p-4">
        <AppInput id="qt" v-model="askForm.title" label="Pertanyaan" placeholder="mis. Bisakah karbonisasi pakai tungku tanah liat?" />
        <AppTextarea id="qc" v-model="askForm.content" :rows="3" placeholder="Jelaskan konteksnya (opsional)…" />
        <div class="flex justify-end gap-2">
          <AppButton variant="ghost" size="sm" @click="asking = false">Batal</AppButton>
          <AppButton size="sm" :loading="posting" @click="submitAsk"><template #icon><Send class="h-4 w-4" /></template>Kirim</AppButton>
        </div>
      </div>
    </div>

    <LoadingBlock v-if="loading" />
    <template v-else>
      <ul v-if="items.length" class="space-y-4">
        <li v-for="q in items" :key="q.id" class="premium-card p-5">
          <div class="flex items-start gap-3">
            <span class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600"><MessageCircleQuestion class="h-5 w-5" /></span>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span v-if="q.solved" class="chip bg-success/10 text-success"><CheckCircle2 class="h-3 w-3" /> Terjawab</span>
                <RouterLink v-if="showContext && q.blueprintId" :to="`/cetak-biru/${q.blueprintId}`" class="chip bg-line/70 text-muted hover:text-primary-700">{{ q.blueprintTitle }}</RouterLink>
              </div>
              <h3 class="mt-1 font-display font-semibold text-ink">{{ q.title }}</h3>
              <p v-if="q.content" class="mt-1 text-sm text-muted">{{ q.content }}</p>
              <p class="mt-1.5 text-xs text-muted">{{ q.user.display_name }} · {{ relativeTime(q.createdAt) }}</p>
            </div>
          </div>

          <!-- Jawaban -->
          <ul v-if="q.answers.length" class="mt-4 space-y-3 border-t border-line pt-4">
            <li v-for="a in q.answers" :key="a.id" class="flex gap-3" :class="a.isBest && 'rounded-xl bg-success/5 p-3 -mx-1'">
              <div class="flex flex-col items-center gap-1">
                <button class="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors" :class="a.myVote ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-line text-muted hover:border-primary-200'" @click="vote(q, a.id)">
                  <ThumbsUp class="h-4 w-4" />
                </button>
                <span class="text-xs font-semibold text-ink">{{ a.votes }}</span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="mb-1 flex flex-wrap items-center gap-2">
                  <AppAvatar :name="a.user.display_name" size="sm" />
                  <span class="text-sm font-semibold text-ink">{{ a.user.display_name }}</span>
                  <span v-if="a.isExpert" class="chip bg-info/10 text-info"><BadgeCheck class="h-3 w-3" /> Pakar Terverifikasi</span>
                  <span v-if="a.isBest" class="chip bg-success/10 text-success"><Award class="h-3 w-3" /> Jawaban Terbaik</span>
                  <span class="text-xs text-muted">· {{ relativeTime(a.createdAt) }}</span>
                </div>
                <p class="text-sm leading-relaxed text-ink/90">{{ a.content }}</p>
                <button v-if="canMarkBest(q) && !a.isBest" class="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline" @click="markBest(q, a.id)">
                  <Award class="h-3 w-3" /> Tandai sebagai terbaik
                </button>
              </div>
            </li>
          </ul>

          <!-- Form jawab -->
          <div v-if="auth.isAuthenticated" class="mt-4 flex items-start gap-2 border-t border-line pt-4">
            <CornerDownRight class="mt-2.5 h-4 w-4 shrink-0 text-muted" />
            <textarea v-model="answerDraft[q.id]" rows="2" class="field flex-1" placeholder="Tulis jawaban Anda…" />
            <AppButton size="sm" class="mt-0.5" :loading="answering === q.id" :disabled="!(answerDraft[q.id] ?? '').trim()" @click="submitAnswer(q)">
              <Send class="h-4 w-4" />
            </AppButton>
          </div>
        </li>
      </ul>
      <EmptyState v-else :icon="MessageCircleQuestion" title="Belum ada pertanyaan" description="Jadilah yang pertama bertanya kepada komunitas & pakar." />
    </template>
  </div>
</template>
