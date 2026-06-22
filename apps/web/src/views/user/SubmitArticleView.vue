<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { X, Send, Save, LayoutTemplate, Info } from 'lucide-vue-next'
import { api } from '@/api'
import { useUiStore } from '@/stores/ui'
import { useSettingsStore } from '@/stores/settings'
import type { ContentTemplate } from '@/types'
import PageHeader from '@/components/common/PageHeader.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppButton from '@/components/ui/AppButton.vue'
import RichTextEditor from '@/components/common/RichTextEditor.vue'

const router = useRouter()
const ui = useUiStore()
const settings = useSettingsStore()

const templates = ref<ContentTemplate[]>([])
const submitting = ref(false)

const form = reactive({ title: '', category: '', content: '', templateId: '' })
const tags = ref<string[]>([])
const tagInput = ref('')
const errors = reactive<Record<string, string>>({})

onMounted(async () => {
  await settings.load()
  templates.value = await api.templates()
})

function addTag() {
  const v = tagInput.value.trim().replace(/,/g, '').toLowerCase()
  if (v && !tags.value.includes(v) && tags.value.length < 5) tags.value.push(v)
  tagInput.value = ''
}
function removeTag(t: string) {
  tags.value = tags.value.filter((x) => x !== t)
}

function applyTemplate() {
  const t = templates.value.find((x) => String(x.id) === form.templateId)
  if (t) {
    form.content = t.content
    ui.info(`Template "${t.name}" diterapkan.`)
  }
}

function plainLength() {
  return form.content.replace(/<[^>]+>/g, '').trim().length
}

function validate(): boolean {
  errors.title = form.title.trim().length < 5 ? 'Judul minimal 5 karakter.' : ''
  errors.category = form.category ? '' : 'Pilih kategori.'
  errors.content = plainLength() < 200 ? 'Konten minimal 200 karakter.' : ''
  return !errors.title && !errors.category && !errors.content
}

async function submit(asDraft = false) {
  if (!asDraft && !validate()) {
    ui.error('Periksa kembali isian formulir.')
    return
  }
  submitting.value = true
  try {
    await api.submitArticle({ title: form.title, content: form.content, category: form.category, tags: tags.value })
    ui.success(asDraft ? 'Draft disimpan.' : 'Artikel dikirim untuk direview. Pantau statusnya di "Artikel Saya".')
    router.push('/dashboard/articles')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <PageHeader title="Tulis Artikel" subtitle="Bagikan pengalaman olah limbah kelapa Anda." />

    <div class="space-y-5">
      <!-- Template -->
      <div class="premium-card p-5">
        <label class="label flex items-center gap-1.5"><LayoutTemplate class="h-4 w-4 text-primary-600" /> Mulai dari Template (opsional)</label>
        <div class="flex gap-2">
          <AppSelect
            v-model="form.templateId"
            class="flex-1"
            placeholder="Pilih kerangka artikel…"
            :options="templates.map((t) => ({ value: String(t.id), label: t.name }))"
          />
          <AppButton variant="secondary" :disabled="!form.templateId" @click="applyTemplate">Terapkan</AppButton>
        </div>
      </div>

      <div class="premium-card space-y-5 p-5">
        <AppInput id="title" v-model="form.title" label="Judul Artikel" placeholder="mis. Mengubah Sabut Kelapa Menjadi Cocopeat" :error="errors.title" required />

        <AppSelect
          id="cat"
          v-model="form.category"
          label="Kategori"
          placeholder="Pilih kategori…"
          :error="errors.category"
          required
          :options="settings.categories.map((c) => ({ value: c.name, label: c.name }))"
        />

        <!-- Tags -->
        <div>
          <label class="label">Tag <span class="font-normal text-muted">(maks 5, Enter untuk menambah)</span></label>
          <div class="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-white p-2 focus-within:border-primary-500">
            <span v-for="t in tags" :key="t" class="chip bg-primary-50 text-primary-700">
              #{{ t }}
              <button class="text-primary-400 hover:text-danger" @click="removeTag(t)"><X class="h-3 w-3" /></button>
            </span>
            <input
              v-model="tagInput"
              class="min-w-[120px] flex-1 bg-transparent px-1 py-1 text-sm outline-none"
              placeholder="tambah tag…"
              @keydown.enter.prevent="addTag"
              @keydown.,.prevent="addTag"
            />
          </div>
        </div>

        <!-- Konten -->
        <div>
          <label class="label">Konten <span class="text-danger">*</span></label>
          <RichTextEditor v-model="form.content" placeholder="Tulis langkah, alat & bahan, hasil, dan tips…" />
          <div class="mt-1.5 flex items-center justify-between text-xs">
            <span :class="errors.content ? 'text-danger' : 'text-muted'">
              {{ errors.content || `${plainLength()} karakter (minimal 200)` }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-start gap-2 rounded-xl bg-info/5 p-3.5 text-sm text-info">
        <Info class="mt-0.5 h-4 w-4 shrink-0" />
        <p>Setelah dikirim, artikel berstatus <strong>Submitted</strong> dan akan ditinjau moderator sebelum tayang publik.</p>
      </div>

      <div class="flex flex-wrap justify-end gap-3">
        <AppButton variant="secondary" :loading="submitting" @click="submit(true)"><template #icon><Save class="h-4 w-4" /></template>Simpan Draft</AppButton>
        <AppButton :loading="submitting" @click="submit(false)"><template #icon><Send class="h-4 w-4" /></template>Kirim untuk Review</AppButton>
      </div>
    </div>
  </div>
</template>
