<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Save, ImageUp, Globe, AlertTriangle } from 'lucide-vue-next'
import { api } from '@/api'
import { useUiStore } from '@/stores/ui'
import { useSettingsStore } from '@/stores/settings'
import type { SystemSettings } from '@/types'
import PageHeader from '@/components/common/PageHeader.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppToggle from '@/components/ui/AppToggle.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'

const ui = useUiStore()
const settingsStore = useSettingsStore()
const loading = ref(true)
const saving = ref(false)

const form = reactive<SystemSettings>({
  site_name: '', site_description: '', site_logo: '', favicon: '',
  posts_per_page: 20, maintenance_mode: false,
})

onMounted(async () => {
  const s = await api.getSettings()
  Object.assign(form, s)
  loading.value = false
})

async function save() {
  saving.value = true
  try {
    await settingsStore.update({ ...form })
    ui.success('Pengaturan disimpan & langsung berlaku.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <PageHeader title="Pengaturan Sistem" subtitle="Konfigurasi umum situs tanpa menyentuh kode." />

    <LoadingBlock v-if="loading" />
    <form v-else class="space-y-5" @submit.prevent="save">
      <div class="premium-card space-y-4 p-6">
        <div class="flex items-center gap-2 text-primary-700"><Globe class="h-4.5 w-4.5" /><h3 class="font-display font-semibold">Identitas Situs</h3></div>
        <AppInput id="sn" v-model="form.site_name" label="Nama Situs" required />
        <AppTextarea id="sd" v-model="form.site_description" label="Deskripsi (Meta)" :rows="2" hint="Tampil pada hasil pencarian & pratinjau tautan." />
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="label">Logo</label>
            <button type="button" class="flex w-full items-center gap-3 rounded-xl border border-dashed border-line p-3 text-sm text-muted transition-colors hover:border-primary-300">
              <ImageUp class="h-5 w-5" /> Unggah logo (PNG/SVG)
            </button>
          </div>
          <div>
            <label class="label">Favicon</label>
            <button type="button" class="flex w-full items-center gap-3 rounded-xl border border-dashed border-line p-3 text-sm text-muted transition-colors hover:border-primary-300">
              <ImageUp class="h-5 w-5" /> Unggah favicon (ICO/SVG)
            </button>
          </div>
        </div>
      </div>

      <div class="premium-card space-y-4 p-6">
        <h3 class="font-display font-semibold text-ink">Tampilan & Konten</h3>
        <AppInput id="ppp" v-model.number="form.posts_per_page" label="Artikel per Halaman" type="number" hint="Antara 6–48." />
      </div>

      <div class="premium-card p-6">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h3 class="flex items-center gap-2 font-display font-semibold text-ink"><AlertTriangle class="h-4.5 w-4.5 text-gold-500" /> Mode Pemeliharaan</h3>
            <p class="mt-1 text-sm text-muted">Saat aktif, hanya admin yang dapat mengakses situs.</p>
          </div>
          <AppToggle v-model="form.maintenance_mode" />
        </div>
      </div>

      <div class="flex justify-end">
        <AppButton type="submit" :loading="saving" size="lg"><template #icon><Save class="h-4 w-4" /></template>Simpan Pengaturan</AppButton>
      </div>
    </form>
  </div>
</template>
