<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { ArrowLeft, Pin, Lock, Unlock, Send } from 'lucide-vue-next'
import { api, ApiError } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import type { ForumTopicDetail } from '@/types'
import AppAvatar from '@/components/ui/AppAvatar.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import { relativeTime } from '@/lib/format'

const route = useRoute()
const auth = useAuthStore()
const ui = useUiStore()

const topic = ref<ForumTopicDetail | null>(null)
const loading = ref(true)
const reply = ref('')
const posting = ref(false)
const id = computed(() => Number(route.params.id))

onMounted(async () => {
  try {
    topic.value = await api.forumTopic(id.value)
  } finally {
    loading.value = false
  }
})

async function submitReply() {
  if (!reply.value.trim() || !topic.value) return
  posting.value = true
  try {
    const r = await api.addReply(id.value, reply.value)
    topic.value.replies.push(r)
    topic.value.replies_count++
    reply.value = ''
    ui.success('Balasan terkirim.')
  } catch (e) {
    ui.error(e instanceof ApiError ? e.message : 'Gagal mengirim balasan.')
  } finally {
    posting.value = false
  }
}

function togglePin() {
  if (topic.value) {
    topic.value.is_pinned = !topic.value.is_pinned
    ui.success(topic.value.is_pinned ? 'Topik disematkan.' : 'Sematan dilepas.')
  }
}
function toggleLock() {
  if (topic.value) {
    topic.value.is_locked = !topic.value.is_locked
    ui.success(topic.value.is_locked ? 'Topik dikunci.' : 'Topik dibuka.')
  }
}
</script>

<template>
  <div class="container-page py-8">
    <RouterLink to="/forum" class="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary-600">
      <ArrowLeft class="h-4 w-4" /> Kembali ke forum
    </RouterLink>

    <LoadingBlock v-if="loading" />
    <div v-else-if="topic" class="mx-auto max-w-3xl">
      <!-- Topik -->
      <div class="premium-card p-6">
        <div class="flex flex-wrap items-center gap-2">
          <Pin v-if="topic.is_pinned" class="h-4 w-4 text-gold-500" />
          <Lock v-if="topic.is_locked" class="h-4 w-4 text-muted" />
          <span class="chip bg-line/70 text-muted">{{ topic.category }}</span>
        </div>
        <h1 class="mt-2 font-display text-2xl font-bold text-ink">{{ topic.title }}</h1>
        <div class="mt-3 flex items-center gap-2.5 border-b border-line pb-4">
          <AppAvatar :name="topic.author.display_name" size="md" />
          <div>
            <p class="text-sm font-semibold text-ink">{{ topic.author.display_name }}</p>
            <p class="text-xs text-muted">{{ relativeTime(topic.created_at) }}</p>
          </div>
          <div v-if="auth.isModerator" class="ml-auto flex gap-2">
            <button class="btn-ghost btn-sm" @click="togglePin"><Pin class="h-4 w-4" />{{ topic.is_pinned ? 'Lepas' : 'Sematkan' }}</button>
            <button class="btn-ghost btn-sm" @click="toggleLock"><component :is="topic.is_locked ? Unlock : Lock" class="h-4 w-4" />{{ topic.is_locked ? 'Buka' : 'Kunci' }}</button>
          </div>
        </div>
        <p class="prose-coco mt-4">{{ topic.content }}</p>
      </div>

      <!-- Balasan -->
      <h2 class="mb-3 mt-8 text-h3">{{ topic.replies_count }} Balasan</h2>
      <ul class="space-y-3">
        <li v-for="r in topic.replies" :key="r.id" class="flex gap-3">
          <AppAvatar :name="r.user.display_name" size="md" />
          <div class="flex-1 rounded-2xl rounded-tl-sm border border-line bg-surface p-4">
            <div class="mb-1 flex items-center gap-2">
              <span class="text-sm font-semibold text-ink">{{ r.user.display_name }}</span>
              <span class="text-xs text-muted">· {{ relativeTime(r.created_at) }}</span>
            </div>
            <p class="text-sm text-ink/90">{{ r.content }}</p>
          </div>
        </li>
      </ul>

      <!-- Form balasan -->
      <div v-if="topic.is_locked" class="mt-6 flex items-center justify-center gap-2 rounded-xl border border-dashed border-line py-6 text-sm text-muted">
        <Lock class="h-4 w-4" /> Topik ini terkunci. Tidak menerima balasan baru.
      </div>
      <div v-else-if="auth.isAuthenticated" class="mt-6 premium-card p-4">
        <AppTextarea v-model="reply" :rows="3" placeholder="Tulis balasan Anda…" />
        <div class="mt-2 flex justify-end">
          <AppButton :loading="posting" :disabled="!reply.trim()" @click="submitReply"><template #icon><Send class="h-4 w-4" /></template>Kirim Balasan</AppButton>
        </div>
      </div>
      <div v-else class="mt-6 rounded-xl border border-dashed border-line p-4 text-center text-sm text-muted">
        <RouterLink to="/login" class="font-medium text-primary-600 hover:underline">Masuk</RouterLink> untuk ikut berdiskusi.
      </div>
    </div>
  </div>
</template>
