<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Search, Plus, Repeat2, ArrowUpRight, PackageSearch } from 'lucide-vue-next'
import { useDebounceFn } from '@vueuse/core'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import type { ListingCategory, ListingKind, WasteListing } from '@/types'
import { WASTE } from '@/lib/blueprint'
import PageHeader from '@/components/common/PageHeader.vue'
import ListingCard from '@/components/common/ListingCard.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'

const auth = useAuthStore()
const ui = useUiStore()
const items = ref<WasteListing[]>([])
const loading = ref(true)
const regions = ref<string[]>([])

const filter = reactive({ kind: '' as ListingKind | '', category: '' as ListingCategory | '', region: '', search: '' })

const categoryOptions: { value: ListingCategory; label: string }[] = [
  ...(Object.keys(WASTE) as Array<keyof typeof WASTE>).map((k) => ({ value: k as ListingCategory, label: WASTE[k].label })),
  { value: 'produk', label: 'Produk' },
]

const open = ref(false)
const submitting = ref(false)
const form = reactive({ kind: 'surplus' as ListingKind, material: '', category: 'sabut' as ListingCategory, quantity: '', price: '', region: '', note: '' })
const errors = reactive<Record<string, string>>({})

async function load() {
  loading.value = true
  try {
    items.value = await api.listListings({ ...filter })
  } finally {
    loading.value = false
  }
}
const debouncedLoad = useDebounceFn(load, 300)
function setKind(k: ListingKind | '') { filter.kind = filter.kind === k ? '' : k; load() }
function setCategory(c: ListingCategory | '') { filter.category = filter.category === c ? '' : c; load() }
watch(() => filter.region, load)

function openForm() {
  if (!auth.isAuthenticated) return ui.warning('Login untuk memasang iklan.')
  Object.assign(form, { kind: 'surplus', material: '', category: 'sabut', quantity: '', price: '', region: regions.value[0] ?? '', note: '' })
  open.value = true
}
async function submit() {
  errors.material = form.material.trim() ? '' : 'Wajib diisi.'
  errors.quantity = form.quantity.trim() ? '' : 'Wajib diisi.'
  errors.region = form.region ? '' : 'Pilih wilayah.'
  if (errors.material || errors.quantity || errors.region) return
  submitting.value = true
  try {
    const created = await api.createListing({ ...form })
    items.value.unshift(created)
    open.value = false
    ui.success('Iklan terpasang di Bursa Limbah.')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  regions.value = (await api.regionStats()).map((r) => r.region)
  load()
})
</script>

<template>
  <div class="container-page py-10">
    <PageHeader title="Bursa Limbah & Produk" subtitle="Pertemukan surplus limbah dengan kebutuhan bahan baku — simbiosis industri antar-UMKM.">
      <template #actions>
        <AppButton @click="openForm"><template #icon><Plus class="h-4 w-4" /></template>Pasang Iklan</AppButton>
      </template>
    </PageHeader>

    <!-- Filter -->
    <div class="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
      <div class="relative flex-1">
        <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input v-model="filter.search" type="search" placeholder="Cari bahan, produk, atau UMKM…" class="field pl-10" @input="debouncedLoad" />
      </div>
      <select v-model="filter.region" class="field lg:w-52">
        <option value="">Semua wilayah</option>
        <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
      </select>
    </div>

    <div class="mb-6 flex flex-wrap gap-2">
      <button class="chip border transition-colors" :class="!filter.kind ? 'border-primary-600 bg-primary-600 text-white' : 'border-line text-muted hover:border-primary-200'" @click="setKind('')">Semua</button>
      <button class="chip border transition-colors" :class="filter.kind === 'surplus' ? 'border-success bg-success text-white' : 'border-line text-muted hover:border-primary-200'" @click="setKind('surplus')"><ArrowUpRight class="h-3.5 w-3.5" /> Tersedia</button>
      <button class="chip border transition-colors" :class="filter.kind === 'need' ? 'border-info bg-info text-white' : 'border-line text-muted hover:border-primary-200'" @click="setKind('need')"><PackageSearch class="h-3.5 w-3.5" /> Dicari</button>
      <span class="mx-1 w-px self-stretch bg-line" />
      <button v-for="c in categoryOptions" :key="c.value" class="chip border transition-colors" :class="filter.category === c.value ? 'border-primary-600 bg-primary-600 text-white' : 'border-line text-muted hover:border-primary-200'" @click="setCategory(c.value)">{{ c.label }}</button>
    </div>

    <LoadingBlock v-if="loading" />
    <template v-else>
      <div v-if="items.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ListingCard v-for="l in items" :key="l.id" :listing="l" />
      </div>
      <EmptyState v-else :icon="Repeat2" title="Belum ada iklan yang cocok" description="Ubah filter, atau pasang iklan surplus/kebutuhan Anda sendiri.">
        <AppButton @click="openForm"><template #icon><Plus class="h-4 w-4" /></template>Pasang Iklan</AppButton>
      </EmptyState>
    </template>

    <!-- Modal pasang iklan -->
    <AppModal :open="open" title="Pasang Iklan Bursa" size="md" @close="open = false">
      <div class="space-y-4">
        <div>
          <label class="label">Jenis iklan</label>
          <div class="grid grid-cols-2 gap-2">
            <button class="rounded-xl border p-3 text-sm font-medium transition-colors" :class="form.kind === 'surplus' ? 'border-success bg-success/5 text-success' : 'border-line text-muted'" @click="form.kind = 'surplus'">Saya punya (surplus)</button>
            <button class="rounded-xl border p-3 text-sm font-medium transition-colors" :class="form.kind === 'need' ? 'border-info bg-info/5 text-info' : 'border-line text-muted'" @click="form.kind = 'need'">Saya butuh</button>
          </div>
        </div>
        <AppInput id="mat" v-model="form.material" label="Bahan / Produk" placeholder="mis. Sabut kelapa kering" :error="errors.material" required />
        <div class="grid gap-4 sm:grid-cols-2">
          <AppSelect id="cat" v-model="form.category" label="Kategori" :options="categoryOptions" />
          <AppInput id="qty" v-model="form.quantity" label="Jumlah" placeholder="mis. 500 kg/minggu" :error="errors.quantity" required />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <AppSelect id="reg" v-model="form.region" label="Wilayah" placeholder="Pilih…" :options="regions.map((r) => ({ value: r, label: r }))" :error="errors.region" required />
          <AppInput id="prc" v-model="form.price" label="Harga (opsional)" placeholder="mis. Rp300/kg atau Nego" />
        </div>
        <AppTextarea id="nt" v-model="form.note" label="Keterangan" :rows="2" placeholder="Detail mutu, frekuensi stok, syarat…" />
      </div>
      <template #footer>
        <AppButton variant="ghost" @click="open = false">Batal</AppButton>
        <AppButton :loading="submitting" @click="submit">Pasang</AppButton>
      </template>
    </AppModal>
  </div>
</template>
