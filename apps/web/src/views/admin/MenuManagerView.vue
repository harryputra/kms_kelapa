<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Plus, ArrowUp, ArrowDown, Pencil, Trash2, Eye, EyeOff, GripVertical } from 'lucide-vue-next'
import { api } from '@/api'
import { useUiStore } from '@/stores/ui'
import type { MenuItem } from '@/types'
import PageHeader from '@/components/common/PageHeader.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppModal from '@/components/ui/AppModal.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'

const ui = useUiStore()
const items = ref<MenuItem[]>([])
const loading = ref(true)

const modalOpen = ref(false)
const editing = ref<MenuItem | null>(null)
const form = reactive({ label: '', url: '', icon: '', target: '_self' as '_self' | '_blank' })

onMounted(async () => {
  items.value = await api.menu()
  loading.value = false
})

async function persist() {
  items.value.forEach((m, i) => (m.sort_order = i + 1))
  await api.saveMenu([...items.value])
}
function move(i: number, dir: -1 | 1) {
  const j = i + dir
  if (j < 0 || j >= items.value.length) return
  ;[items.value[i], items.value[j]] = [items.value[j], items.value[i]]
  persist()
}
function toggleVisible(m: MenuItem) {
  m.is_visible = !m.is_visible
  persist()
  ui.success(m.is_visible ? `"${m.label}" ditampilkan.` : `"${m.label}" disembunyikan.`)
}
function openNew() {
  editing.value = null
  Object.assign(form, { label: '', url: '', icon: '', target: '_self' })
  modalOpen.value = true
}
function openEdit(m: MenuItem) {
  editing.value = m
  Object.assign(form, { label: m.label, url: m.url, icon: m.icon, target: m.target })
  modalOpen.value = true
}
function save() {
  if (!form.label.trim() || !form.url.trim()) return ui.error('Label & URL wajib diisi.')
  if (editing.value) {
    Object.assign(editing.value, { ...form })
  } else {
    items.value.push({ id: Date.now(), label: form.label, url: form.url, icon: form.icon, target: form.target, parent_id: null, sort_order: items.value.length + 1, is_visible: true })
  }
  persist()
  modalOpen.value = false
  ui.success('Menu disimpan.')
}
function remove(m: MenuItem) {
  items.value = items.value.filter((x) => x.id !== m.id)
  persist()
  ui.success('Item menu dihapus.')
}
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <PageHeader title="Menu Manager" subtitle="Atur item navigasi utama situs.">
      <template #actions>
        <AppButton @click="openNew"><template #icon><Plus class="h-4 w-4" /></template>Tambah Menu</AppButton>
      </template>
    </PageHeader>

    <LoadingBlock v-if="loading" />
    <ul v-else class="space-y-2">
      <li
        v-for="(m, i) in items"
        :key="m.id"
        class="flex items-center gap-3 rounded-xl border border-line bg-surface p-3 transition-shadow hover:shadow-card"
        :class="{ 'opacity-55': !m.is_visible }"
      >
        <GripVertical class="h-4 w-4 shrink-0 text-muted/50" />
        <div class="flex flex-col">
          <button class="text-muted transition-colors hover:text-primary-600 disabled:opacity-30" :disabled="i === 0" @click="move(i, -1)"><ArrowUp class="h-3.5 w-3.5" /></button>
          <button class="text-muted transition-colors hover:text-primary-600 disabled:opacity-30" :disabled="i === items.length - 1" @click="move(i, 1)"><ArrowDown class="h-3.5 w-3.5" /></button>
        </div>
        <div class="min-w-0 flex-1">
          <p class="font-medium text-ink">{{ m.label }}</p>
          <p class="truncate text-xs text-muted">{{ m.url }} · {{ m.target }}</p>
        </div>
        <button class="btn-ghost btn-sm h-8 w-8 !px-0" :title="m.is_visible ? 'Sembunyikan' : 'Tampilkan'" @click="toggleVisible(m)">
          <component :is="m.is_visible ? Eye : EyeOff" class="h-4 w-4" />
        </button>
        <button class="btn-ghost btn-sm h-8 w-8 !px-0" title="Edit" @click="openEdit(m)"><Pencil class="h-4 w-4" /></button>
        <button class="btn-ghost btn-sm h-8 w-8 !px-0 text-danger" title="Hapus" @click="remove(m)"><Trash2 class="h-4 w-4" /></button>
      </li>
    </ul>

    <AppModal :open="modalOpen" :title="editing ? 'Edit Menu' : 'Tambah Menu'" size="md" @close="modalOpen = false">
      <div class="space-y-4">
        <AppInput id="ml" v-model="form.label" label="Label" placeholder="mis. Beranda" required />
        <AppInput id="mu" v-model="form.url" label="URL" placeholder="mis. /articles" required />
        <div class="grid gap-4 sm:grid-cols-2">
          <AppInput id="mi" v-model="form.icon" label="Ikon (opsional)" placeholder="mis. home" />
          <div>
            <label class="label">Target</label>
            <select v-model="form.target" class="field">
              <option value="_self">Tab sama</option>
              <option value="_blank">Tab baru</option>
            </select>
          </div>
        </div>
      </div>
      <template #footer>
        <AppButton variant="ghost" @click="modalOpen = false">Batal</AppButton>
        <AppButton @click="save">Simpan</AppButton>
      </template>
    </AppModal>
  </div>
</template>
