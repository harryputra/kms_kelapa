<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { ArrowLeft, Send } from 'lucide-vue-next'
import { useUiStore } from '@/stores/ui'
import { useSettingsStore } from '@/stores/settings'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import AppButton from '@/components/ui/AppButton.vue'

const router = useRouter()
const ui = useUiStore()
const settings = useSettingsStore()

const form = reactive({ title: '', category: '', content: '', subscribe: true })
const errors = reactive<Record<string, string>>({})
const submitting = ref(false)

onMounted(() => settings.load())

function validate() {
  errors.title = form.title.trim().length < 5 ? 'Judul minimal 5 karakter.' : ''
  errors.category = form.category ? '' : 'Pilih kategori.'
  errors.content = form.content.trim().length < 20 ? 'Konten minimal 20 karakter.' : ''
  return !errors.title && !errors.category && !errors.content
}

async function submit() {
  if (!validate()) return
  submitting.value = true
  await new Promise((r) => setTimeout(r, 500))
  submitting.value = false
  ui.success('Topik berhasil dibuat.')
  router.push('/forum')
}
</script>

<template>
  <div class="container-page py-8">
    <RouterLink to="/forum" class="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary-600">
      <ArrowLeft class="h-4 w-4" /> Kembali ke forum
    </RouterLink>

    <div class="mx-auto max-w-2xl">
      <h1 class="text-h1">Buat Topik Baru</h1>
      <p class="mt-1 text-muted">Mulai diskusi yang bermanfaat untuk komunitas.</p>

      <div class="premium-card mt-6 space-y-4 p-6">
        <AppInput id="t" v-model="form.title" label="Judul Topik" placeholder="mis. Tips menjaga kualitas cocopeat saat musim hujan" :error="errors.title" required />
        <AppSelect
          id="c"
          v-model="form.category"
          label="Kategori"
          placeholder="Pilih kategori…"
          :error="errors.category"
          required
          :options="settings.categories.map((c) => ({ value: c.name, label: c.name }))"
        />
        <AppTextarea id="ct" v-model="form.content" label="Isi Topik" :rows="6" placeholder="Jelaskan pertanyaan atau gagasan Anda…" :error="errors.content" required />
        <label class="flex items-center gap-2 text-sm text-muted">
          <input v-model="form.subscribe" type="checkbox" class="h-4 w-4 rounded accent-primary-600" />
          Beri tahu saya saat ada balasan
        </label>
        <div class="flex justify-end pt-1">
          <AppButton :loading="submitting" @click="submit"><template #icon><Send class="h-4 w-4" /></template>Publikasikan Topik</AppButton>
        </div>
      </div>
    </div>
  </div>
</template>
