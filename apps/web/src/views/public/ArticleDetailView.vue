<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import {
  Bookmark, BookmarkCheck, Share2, Flag, Eye, MessageSquare, Lock, ArrowLeft, Send, CornerDownRight,
} from 'lucide-vue-next'
import { api, ApiError } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import type { ArticleDetail, ArticleFull, Comment, ReportReason, VoteType } from '@/types'
import { formatDate, relativeTime, compactNumber } from '@/lib/format'
import AppAvatar from '@/components/ui/AppAvatar.vue'
import ArticleCover from '@/components/ui/ArticleCover.vue'
import VoteButtons from '@/components/common/VoteButtons.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()

const article = ref<ArticleDetail | null>(null)
const comments = ref<Comment[]>([])
const loading = ref(true)
const id = computed(() => Number(route.params.id))

const isPreview = computed(() => article.value?.is_truncated === true)
const full = computed(() => (isPreview.value ? null : (article.value as ArticleFull | null)))

const newComment = ref('')
const replyTo = ref<number | null>(null)
const posting = ref(false)

const reportOpen = ref(false)
const reportReason = ref<ReportReason>('spam')
const reportDesc = ref('')

async function load() {
  loading.value = true
  try {
    article.value = await api.getArticle(id.value, auth.isAuthenticated)
    if (!isPreview.value) comments.value = await api.getComments(id.value)
  } catch (e) {
    ui.error(e instanceof ApiError ? e.message : 'Gagal memuat artikel.')
    router.replace('/articles')
  } finally {
    loading.value = false
  }
}

async function onVote(type: VoteType) {
  if (!auth.isAuthenticated || !full.value) return ui.warning('Login untuk memberi suara.')
  const res = await api.vote(id.value, type)
  full.value.stats.likes = res.likes
  full.value.stats.dislikes = res.dislikes
  full.value.user_vote = res.user_vote
}

async function toggleBookmark() {
  if (!auth.isAuthenticated || !full.value) return ui.warning('Login untuk menyimpan artikel.')
  const res = await api.toggleBookmark(id.value)
  full.value.is_bookmarked = res.bookmarked
  ui.success(res.bookmarked ? 'Disimpan ke Bacaan Saya.' : 'Bookmark dihapus.')
}

function share() {
  const url = window.location.href
  if (navigator.share) navigator.share({ title: article.value?.title, url }).catch(() => {})
  else {
    navigator.clipboard.writeText(url)
    ui.success('Tautan disalin ke clipboard.')
  }
}

async function submitComment() {
  if (!newComment.value.trim()) return
  posting.value = true
  try {
    await api.addComment(id.value, newComment.value, replyTo.value)
    ui.success('Komentar terkirim — menunggu persetujuan moderator.')
    newComment.value = ''
    replyTo.value = null
  } finally {
    posting.value = false
  }
}

async function submitReport() {
  await api.report('article', id.value, reportReason.value, reportDesc.value)
  reportOpen.value = false
  reportDesc.value = ''
  ui.success('Laporan terkirim. Terima kasih telah menjaga komunitas.')
}

watch(id, load)
onMounted(load)
</script>

<template>
  <div class="container-page py-8">
    <RouterLink to="/articles" class="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary-600">
      <ArrowLeft class="h-4 w-4" /> Kembali ke daftar artikel
    </RouterLink>

    <LoadingBlock v-if="loading" label="Memuat artikel…" />

    <div v-else-if="article" class="grid gap-8 lg:grid-cols-[1fr_300px]">
      <!-- KONTEN -->
      <article class="min-w-0">
        <div class="mb-4 flex flex-wrap items-center gap-2">
          <span class="chip bg-primary-50 text-primary-700">{{ article.category }}</span>
          <span v-for="t in article.tags" :key="t" class="chip bg-line/70 text-muted">#{{ t }}</span>
        </div>
        <h1 class="font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">{{ article.title }}</h1>

        <div class="mt-5 flex flex-wrap items-center gap-4 border-b border-line pb-5">
          <div class="flex items-center gap-2.5">
            <AppAvatar :name="article.author.display_name" :src="article.author.avatar_url" size="md" />
            <div>
              <p class="text-sm font-semibold text-ink">{{ article.author.display_name }}</p>
              <p class="text-xs text-muted">{{ formatDate(article.published_at) }}</p>
            </div>
          </div>
          <div class="ml-auto flex items-center gap-4 text-sm text-muted">
            <span class="inline-flex items-center gap-1"><Eye class="h-4 w-4" />{{ compactNumber(article.stats.views) }}</span>
            <span class="inline-flex items-center gap-1"><MessageSquare class="h-4 w-4" />{{ article.stats.comments }}</span>
          </div>
        </div>

        <ArticleCover :seed="article.title" :label="article.category" class="mt-6 rounded-2xl" ratio="wide" />

        <!-- Full content -->
        <div v-if="!isPreview && full" class="prose-coco mt-8" v-html="full.content" />

        <!-- Preview 50% + overlay -->
        <div v-else class="relative mt-8">
          <div class="prose-coco" v-html="(article as any).content_preview" />
          <div class="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-canvas via-canvas/90 to-transparent" />
          <div class="relative -mt-12 rounded-2xl border border-primary-100 bg-primary-50/70 p-8 text-center backdrop-blur">
            <Lock class="mx-auto h-8 w-8 text-primary-600" />
            <h3 class="mt-3 text-h3">Lanjutkan membaca artikel ini</h3>
            <p class="mx-auto mt-1.5 max-w-sm text-sm text-muted">
              Daftar gratis untuk membaca artikel selengkapnya, memberi suara, dan menyimpan ke daftar bacaan.
            </p>
            <div class="mt-5 flex justify-center gap-3">
              <RouterLink to="/register" class="btn-primary btn-md">Daftar Gratis</RouterLink>
              <RouterLink :to="`/login?redirect=/articles/${id}`" class="btn-secondary btn-md">Masuk</RouterLink>
            </div>
          </div>
        </div>

        <!-- Action bar (login penuh) -->
        <div v-if="!isPreview && full" class="mt-8 flex flex-wrap items-center gap-3 border-y border-line py-4">
          <VoteButtons :likes="full.stats.likes" :dislikes="full.stats.dislikes" :user-vote="full.user_vote" @vote="onVote" />
          <button class="btn-secondary btn-md" @click="toggleBookmark">
            <component :is="full.is_bookmarked ? BookmarkCheck : Bookmark" class="h-4 w-4" :class="full.is_bookmarked && 'text-primary-600'" />
            {{ full.is_bookmarked ? 'Tersimpan' : 'Simpan' }}
          </button>
          <button class="btn-ghost btn-md" @click="share"><Share2 class="h-4 w-4" />Bagikan</button>
          <button class="btn-ghost btn-md ml-auto text-muted" @click="auth.isAuthenticated ? (reportOpen = true) : ui.warning('Login untuk melapor.')">
            <Flag class="h-4 w-4" />Laporkan
          </button>
        </div>

        <!-- Sumber -->
        <div v-if="full?.sources?.length" class="mt-6 rounded-xl bg-surface p-4 text-sm">
          <p class="mb-2 font-semibold text-ink">Sumber</p>
          <ul class="list-inside list-disc space-y-1 text-muted">
            <li v-for="s in full.sources" :key="s">{{ s }}</li>
          </ul>
        </div>

        <!-- KOMENTAR -->
        <section v-if="!isPreview" class="mt-10">
          <h2 class="text-h2">Komentar <span class="text-muted">({{ comments.length }})</span></h2>

          <div v-if="auth.isAuthenticated" class="mt-4 premium-card p-4">
            <p v-if="replyTo" class="mb-2 inline-flex items-center gap-1.5 text-xs text-muted">
              <CornerDownRight class="h-3.5 w-3.5" /> Membalas komentar
              <button class="text-danger hover:underline" @click="replyTo = null">batal</button>
            </p>
            <AppTextarea v-model="newComment" placeholder="Tulis komentar yang membangun…" :rows="3" />
            <div class="mt-2 flex justify-end">
              <AppButton :loading="posting" :disabled="!newComment.trim()" @click="submitComment">
                <template #icon><Send class="h-4 w-4" /></template>
                Kirim
              </AppButton>
            </div>
          </div>
          <div v-else class="mt-4 rounded-xl border border-dashed border-line p-4 text-center text-sm text-muted">
            <RouterLink to="/login" class="font-medium text-primary-600 hover:underline">Masuk</RouterLink> untuk ikut berdiskusi.
          </div>

          <ul class="mt-6 space-y-5">
            <li v-for="c in comments" :key="c.id">
              <div class="flex gap-3">
                <AppAvatar :name="c.user.display_name" :src="c.user.avatar_url" size="sm" />
                <div class="flex-1">
                  <div class="rounded-2xl rounded-tl-sm bg-surface p-3.5">
                    <div class="mb-1 flex items-center gap-2">
                      <span class="text-sm font-semibold text-ink">{{ c.user.display_name }}</span>
                      <span class="text-xs text-muted">· {{ relativeTime(c.created_at) }}</span>
                    </div>
                    <p class="text-sm text-ink/90">{{ c.content }}</p>
                  </div>
                  <button v-if="auth.isAuthenticated" class="mt-1 text-xs font-medium text-muted hover:text-primary-600" @click="replyTo = c.id">Balas</button>

                  <ul v-if="c.replies.length" class="mt-3 space-y-3 border-l-2 border-line pl-4">
                    <li v-for="r in c.replies" :key="r.id" class="flex gap-3">
                      <AppAvatar :name="r.user.display_name" :src="r.user.avatar_url" size="sm" />
                      <div class="flex-1 rounded-2xl rounded-tl-sm bg-surface p-3.5">
                        <div class="mb-1 flex items-center gap-2">
                          <span class="text-sm font-semibold text-ink">{{ r.user.display_name }}</span>
                          <span class="text-xs text-muted">· {{ relativeTime(r.created_at) }}</span>
                        </div>
                        <p class="text-sm text-ink/90">{{ r.content }}</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </li>
          </ul>
        </section>
      </article>

      <!-- SIDEBAR -->
      <aside class="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <div class="premium-card p-5">
          <div class="flex items-center gap-3">
            <AppAvatar :name="article.author.display_name" :src="article.author.avatar_url" size="lg" />
            <div>
              <p class="font-display font-semibold text-ink">{{ article.author.display_name }}</p>
              <p class="text-xs capitalize text-muted">{{ article.author.role }}</p>
            </div>
          </div>
          <RouterLink v-if="auth.isAuthenticated" to="#" class="btn-secondary btn-sm mt-4 w-full">Ikuti Penulis</RouterLink>
        </div>
        <div class="premium-card p-5">
          <p class="mb-3 text-sm font-semibold text-ink">Statistik Artikel</p>
          <dl class="space-y-2 text-sm">
            <div class="flex justify-between"><dt class="text-muted">Dilihat</dt><dd class="font-medium">{{ compactNumber(article.stats.views) }}</dd></div>
            <div class="flex justify-between"><dt class="text-muted">Disukai</dt><dd class="font-medium">{{ compactNumber(article.stats.likes) }}</dd></div>
            <div class="flex justify-between"><dt class="text-muted">Komentar</dt><dd class="font-medium">{{ article.stats.comments }}</dd></div>
          </dl>
        </div>
      </aside>
    </div>

    <!-- Modal laporan -->
    <AppModal :open="reportOpen" title="Laporkan Artikel" size="sm" @close="reportOpen = false">
      <p class="mb-3 text-sm text-muted">Pilih alasan pelaporan. Tim moderator akan meninjau.</p>
      <div class="space-y-2">
        <label v-for="r in (['spam','inappropriate','misinformation','other'] as ReportReason[])" :key="r" class="flex cursor-pointer items-center gap-2.5 rounded-lg border border-line p-2.5 text-sm has-[:checked]:border-primary-400 has-[:checked]:bg-primary-50">
          <input v-model="reportReason" type="radio" :value="r" class="accent-primary-600" />
          {{ { spam: 'Spam', inappropriate: 'Tidak pantas', misinformation: 'Informasi salah', other: 'Lainnya' }[r] }}
        </label>
      </div>
      <AppTextarea v-model="reportDesc" class="mt-3" placeholder="Keterangan tambahan (opsional)" :rows="2" />
      <template #footer>
        <AppButton variant="ghost" @click="reportOpen = false">Batal</AppButton>
        <AppButton variant="danger" @click="submitReport">Kirim Laporan</AppButton>
      </template>
    </AppModal>
  </div>
</template>
