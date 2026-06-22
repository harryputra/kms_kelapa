<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Plus, Pencil, Trash2, LayoutTemplate } from 'lucide-vue-next'
import { api } from '@/api'
import { useUiStore } from '@/stores/ui'
import type { ContentTemplate } from '@/types'
import PageHeader from '@/components/common/PageHeader.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import AppModal from '@/components/ui/AppModal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import { formatDate } from '@/lib/format'

const ui = useUiStore()
const items = ref<ContentTemplate[]>([])
const loading = ref(true)

const editing = ref<ContentTemplate | null>(null)
const modalOpen = ref(false)
const form = reactive({ name: '', content: '' })
const confirmId = ref<number | null>(null)

onMounted(async () => {
  items.value = await api.templates()
  loading.value = false
})

function openNew() {
  editing.value = null
  form.name = ''
  form.content = ''
  modalOpen.value = true
}
function openEdit(t: ContentTemplate) {
  editing.value = t
  form.name = t.name
  form.content = t.content
  modalOpen.value = true
}
function save() {
  if (!form.name.trim() || !form.content.trim()) return ui.error('Nama & konten template wajib diisi.')
  if (editing.value) {
    Object.assign(editing.value, { name: form.name, content: form.content })
    ui.success('Template diperbarui.')
  } else {
    items.value.unshift({ id: Date.now(), name: form.name, content: form.content, created_at: new Date().toISOString() })
    ui.success('Template dibuat.')
  }
  modalOpen.value = false
}
function remove() {
  items.value = items.value.filter((t) => t.id !== confirmId.value)
  confirmId.value = null
  ui.success('Template dihapus.')
}
</script>

<template>
  <div>
    <PageHeader title="Template Artikel" subtitle="Kerangka siap pakai untuk standarisasi penulisan.">
      <template #actions>
        <AppButton @click="openNew"><template #icon><Plus class="h-4 w-4" /></template>Template Baru</AppButton>
      </template>
    </PageHeader>

    <LoadingBlock v-if="loading" />
    <div v-else class="grid gap-5 md:grid-cols-2">
      <div v-for="t in items" :key="t.id" class="premium-card flex flex-col p-5">
        <div class="flex items-start justify-between">
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600"><LayoutTemplate class="h-5 w-5" /></span>
          <div class="flex gap-1">
            <button class="btn-ghost btn-sm h-8 w-8 !px-0" title="Edit" @click="openEdit(t)"><Pencil class="h-4 w-4" /></button>
            <button class="btn-ghost btn-sm h-8 w-8 !px-0 text-danger" title="Hapus" @click="confirmId = t.id"><Trash2 class="h-4 w-4" /></button>
          </div>
        </div>
        <h3 class="mt-3 font-display font-semibold text-ink">{{ t.name }}</h3>
        <p class="mt-1.5 line-clamp-2 text-sm text-muted" v-html="t.content.replace(/<[^>]+>/g, ' ').slice(0, 120)" />
        <p class="mt-auto pt-3 text-xs text-muted">Dibuat {{ formatDate(t.created_at) }}</p>
      </div>
    </div>

    <AppModal :open="modalOpen" :title="editing ? 'Edit Template' : 'Template Baru'" size="lg" @close="modalOpen = false">
      <div class="space-y-4">
        <AppInput id="tn" v-model="form.name" label="Nama Template" placeholder="mis. Cara Membuat (Langkah Praktis)" required />
        <AppTextarea id="tc" v-model="form.content" label="Konten / Kerangka (HTML)" :rows="8" placeholder="Gunakan placeholder seperti {nama_produk}…" required />
      </div>
      <template #footer>
        <AppButton variant="ghost" @click="modalOpen = false">Batal</AppButton>
        <AppButton @click="save">Simpan</AppButton>
      </template>
    </AppModal>

    <ConfirmDialog
      :open="confirmId !== null"
      title="Hapus Template?"
      message="Template ini akan dihapus permanen dan tidak bisa dipilih saat menulis artikel."
      confirm-label="Hapus"
      danger
      @confirm="remove"
      @cancel="confirmId = null"
    />
  </div>
</template>
