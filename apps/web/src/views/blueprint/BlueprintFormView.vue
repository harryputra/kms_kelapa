<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Plus, Trash2, Send, X, Info, ListChecks, FlaskConical, ShieldAlert,
  Package, BarChart3, Tag,
} from 'lucide-vue-next'
import { api } from '@/api'
import { useUiStore } from '@/stores/ui'
import type {
  BlueprintMaterial, BlueprintStep, CapitalTier, Difficulty, EconomicModel,
  MaterialTier, QualityParam, SafetyNote, WasteKind,
} from '@/types'
import { CAPITAL, DIFFICULTY, WASTE, computeEconomics, formatRupiah } from '@/lib/blueprint'
import PageHeader from '@/components/common/PageHeader.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import AppButton from '@/components/ui/AppButton.vue'

const router = useRouter()
const ui = useUiStore()
const submitting = ref(false)

const form = reactive({
  title: '', excerpt: '', summary: '',
  wasteKind: '' as WasteKind | '', product: '',
  difficulty: 'sedang' as Difficulty, capitalTier: 'rendah' as CapitalTier, estTime: '',
  sources: '',
})
const tags = ref<string[]>([])
const tagInput = ref('')
const materials = ref<BlueprintMaterial[]>([{ name: '', qty: '', tier: 'wajib', price: 0 }])
const steps = ref<Array<Omit<BlueprintStep, 'order'>>>([{ title: '', detail: '', duration: '', temperature: '', dose: '' }])
const quality = ref<QualityParam[]>([{ name: '', target: '', method: '' }])
const safety = ref<SafetyNote[]>([{ risk: '', mitigation: '' }])
const economic = reactive<EconomicModel>({ capital: 0, costPerBatch: 0, batchInputKg: 0, batchOutputKg: 0, sellPricePerKg: 0 })
const errors = reactive<Record<string, string>>({})

const wasteOptions = Object.entries(WASTE).map(([k, v]) => ({ value: k, label: v.label }))
const difficultyOptions = Object.entries(DIFFICULTY).map(([k, v]) => ({ value: k, label: v.label }))
const capitalOptions = Object.entries(CAPITAL).map(([k, v]) => ({ value: k, label: v.label }))
const tierOptions: { value: MaterialTier; label: string }[] = [
  { value: 'wajib', label: 'Wajib' }, { value: 'murah', label: 'Opsi murah' }, { value: 'mahal', label: 'Opsi mahal' },
]

const economyReady = computed(() => economic.batchInputKg > 0 && economic.batchOutputKg > 0 && economic.sellPricePerKg > 0)
const preview = computed(() => (economyReady.value ? computeEconomics(economic, economic.batchInputKg * 5) : null))

function addTag() {
  const v = tagInput.value.trim().replace(/,/g, '').toLowerCase()
  if (v && !tags.value.includes(v) && tags.value.length < 5) tags.value.push(v)
  tagInput.value = ''
}
const rm = <T,>(arr: T[], i: number) => arr.length > 1 && arr.splice(i, 1)

function validate(): boolean {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (form.title.trim().length < 8) errors.title = 'Judul minimal 8 karakter.'
  if (!form.excerpt.trim()) errors.excerpt = 'Ringkasan wajib diisi.'
  if (!form.wasteKind) errors.wasteKind = 'Pilih jenis limbah.'
  if (!form.product.trim()) errors.product = 'Sebutkan produk keluaran.'
  if (!materials.value.some((m) => m.name.trim())) errors.materials = 'Tambah minimal satu bahan/alat.'
  if (!steps.value.some((s) => s.title.trim())) errors.steps = 'Tambah minimal satu langkah.'
  if (!economyReady.value) errors.economic = 'Lengkapi parameter ekonomi (limbah, hasil, harga jual).'
  return Object.keys(errors).length === 0
}

async function submit() {
  if (!validate()) {
    ui.error('Beberapa isian belum lengkap — periksa tanda merah.')
    return
  }
  submitting.value = true
  try {
    await api.submitBlueprint({
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      summary: form.summary.trim() || form.excerpt.trim(),
      wasteKind: form.wasteKind as WasteKind,
      wasteLabel: WASTE[form.wasteKind as WasteKind].label,
      product: form.product.trim(),
      difficulty: form.difficulty,
      capitalTier: form.capitalTier,
      estTime: form.estTime.trim() || '—',
      tags: tags.value,
      materials: materials.value.filter((m) => m.name.trim()),
      steps: steps.value.filter((s) => s.title.trim()).map((s, i) => ({ ...s, order: i + 1 })),
      quality: quality.value.filter((q) => q.name.trim()),
      safety: safety.value.filter((s) => s.risk.trim()),
      economic: { ...economic },
      sources: form.sources.split('\n').map((s) => s.trim()).filter(Boolean),
    })
    ui.success('Cetak biru terkirim — menunggu kurasi moderator sebelum tayang.')
    router.push('/dashboard/cetak-biru')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <PageHeader title="Tulis Cetak Biru Teknis" subtitle="Dokumentasikan resep teknis Anda secara terstruktur agar bisa direplikasi & diskalakan UMKM lain." />

    <div class="space-y-5">
      <!-- Identitas -->
      <section class="premium-card space-y-4 p-5">
        <h3 class="font-display font-semibold text-ink">1. Identitas</h3>
        <AppInput id="t" v-model="form.title" label="Judul" placeholder="mis. Briket Arang dari Tempurung Kelapa" :error="errors.title" required />
        <AppTextarea id="ex" v-model="form.excerpt" label="Ringkasan singkat" :rows="2" placeholder="Satu kalimat manfaat & produk yang dihasilkan." :error="errors.excerpt" required />
        <div class="grid gap-4 sm:grid-cols-2">
          <AppSelect id="wk" v-model="form.wasteKind" label="Jenis Limbah" placeholder="Pilih…" :options="wasteOptions" :error="errors.wasteKind" required />
          <AppInput id="pr" v-model="form.product" label="Produk Keluaran" placeholder="mis. Briket" :error="errors.product" required />
        </div>
        <div class="grid gap-4 sm:grid-cols-3">
          <AppSelect id="df" v-model="form.difficulty" label="Tingkat Kesulitan" :options="difficultyOptions" />
          <AppSelect id="cp" v-model="form.capitalTier" label="Kelas Modal" :options="capitalOptions" />
          <AppInput id="et" v-model="form.estTime" label="Estimasi Waktu" placeholder="mis. 3 hari" />
        </div>
        <div>
          <label class="label flex items-center gap-1.5"><Tag class="h-3.5 w-3.5" /> Tag (maks 5)</label>
          <div class="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-white p-2 focus-within:border-primary-500">
            <span v-for="t in tags" :key="t" class="chip bg-primary-50 text-primary-700">#{{ t }}<button class="text-primary-400 hover:text-danger" @click="tags = tags.filter((x) => x !== t)"><X class="h-3 w-3" /></button></span>
            <input v-model="tagInput" class="min-w-[120px] flex-1 bg-transparent px-1 py-1 text-sm outline-none" placeholder="tambah tag…" @keydown.enter.prevent="addTag" @keydown.,.prevent="addTag" />
          </div>
        </div>
      </section>

      <!-- Bahan -->
      <section class="premium-card space-y-3 p-5">
        <h3 class="flex items-center gap-2 font-display font-semibold text-ink"><Package class="h-4.5 w-4.5 text-primary-600" /> 2. Alat & Bahan</h3>
        <p v-if="errors.materials" class="text-xs text-danger">⚠ {{ errors.materials }}</p>
        <div v-for="(m, i) in materials" :key="i" class="grid grid-cols-12 items-start gap-2">
          <input v-model="m.name" class="field col-span-12 sm:col-span-4" placeholder="Nama bahan/alat" />
          <input v-model="m.qty" class="field col-span-4 sm:col-span-2" placeholder="Jumlah" />
          <select v-model="m.tier" class="field col-span-4 sm:col-span-2"><option v-for="o in tierOptions" :key="o.value" :value="o.value">{{ o.label }}</option></select>
          <input v-model.number="m.price" type="number" class="field col-span-3 sm:col-span-3" placeholder="Harga Rp" />
          <button class="btn-ghost btn-sm col-span-1 h-10 w-full !px-0 text-danger" @click="rm(materials, i)"><Trash2 class="mx-auto h-4 w-4" /></button>
        </div>
        <button class="btn-secondary btn-sm" @click="materials.push({ name: '', qty: '', tier: 'wajib', price: 0 })"><Plus class="h-4 w-4" /> Tambah Bahan</button>
      </section>

      <!-- Langkah -->
      <section class="premium-card space-y-3 p-5">
        <h3 class="flex items-center gap-2 font-display font-semibold text-ink"><ListChecks class="h-4.5 w-4.5 text-primary-600" /> 3. Langkah</h3>
        <p v-if="errors.steps" class="text-xs text-danger">⚠ {{ errors.steps }}</p>
        <div v-for="(s, i) in steps" :key="i" class="rounded-xl border border-line p-3">
          <div class="flex items-center gap-2">
            <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-700">{{ i + 1 }}</span>
            <input v-model="s.title" class="field flex-1" placeholder="Judul langkah (mis. Karbonisasi)" />
            <button class="btn-ghost btn-sm h-9 w-9 !px-0 text-danger" @click="rm(steps, i)"><Trash2 class="h-4 w-4" /></button>
          </div>
          <textarea v-model="s.detail" rows="2" class="field mt-2" placeholder="Detail langkah…" />
          <div class="mt-2 grid grid-cols-3 gap-2">
            <input v-model="s.duration" class="field" placeholder="Durasi" />
            <input v-model="s.temperature" class="field" placeholder="Suhu" />
            <input v-model="s.dose" class="field" placeholder="Takaran" />
          </div>
        </div>
        <button class="btn-secondary btn-sm" @click="steps.push({ title: '', detail: '', duration: '', temperature: '', dose: '' })"><Plus class="h-4 w-4" /> Tambah Langkah</button>
      </section>

      <!-- Mutu & K3 -->
      <section class="grid gap-5 md:grid-cols-2">
        <div class="premium-card space-y-3 p-5">
          <h3 class="flex items-center gap-2 font-display font-semibold text-ink"><FlaskConical class="h-4.5 w-4.5 text-primary-600" /> 4. Parameter Mutu</h3>
          <div v-for="(q, i) in quality" :key="i" class="space-y-2 rounded-xl border border-line p-3">
            <div class="flex gap-2">
              <input v-model="q.name" class="field flex-1" placeholder="Parameter" />
              <button class="btn-ghost btn-sm h-9 w-9 !px-0 text-danger" @click="rm(quality, i)"><Trash2 class="h-4 w-4" /></button>
            </div>
            <input v-model="q.target" class="field" placeholder="Target (mis. < 8%)" />
            <input v-model="q.method" class="field" placeholder="Cara uji" />
          </div>
          <button class="btn-secondary btn-sm" @click="quality.push({ name: '', target: '', method: '' })"><Plus class="h-4 w-4" /> Tambah</button>
        </div>
        <div class="premium-card space-y-3 p-5">
          <h3 class="flex items-center gap-2 font-display font-semibold text-ink"><ShieldAlert class="h-4.5 w-4.5 text-danger" /> 5. Keselamatan (K3)</h3>
          <div v-for="(s, i) in safety" :key="i" class="space-y-2 rounded-xl border border-line p-3">
            <div class="flex gap-2">
              <input v-model="s.risk" class="field flex-1" placeholder="Risiko" />
              <button class="btn-ghost btn-sm h-9 w-9 !px-0 text-danger" @click="rm(safety, i)"><Trash2 class="h-4 w-4" /></button>
            </div>
            <input v-model="s.mitigation" class="field" placeholder="Mitigasi" />
          </div>
          <button class="btn-secondary btn-sm" @click="safety.push({ risk: '', mitigation: '' })"><Plus class="h-4 w-4" /> Tambah</button>
        </div>
      </section>

      <!-- Ekonomi -->
      <section class="premium-card space-y-4 p-5">
        <h3 class="flex items-center gap-2 font-display font-semibold text-ink"><BarChart3 class="h-4.5 w-4.5 text-primary-600" /> 6. Model Ekonomi (per batch)</h3>
        <p v-if="errors.economic" class="text-xs text-danger">⚠ {{ errors.economic }}</p>
        <div class="grid gap-4 sm:grid-cols-3">
          <div><label class="label">Limbah / batch (kg)</label><input v-model.number="economic.batchInputKg" type="number" min="0" class="field" /></div>
          <div><label class="label">Hasil / batch (kg)</label><input v-model.number="economic.batchOutputKg" type="number" min="0" class="field" /></div>
          <div><label class="label">Harga jual (Rp/kg)</label><input v-model.number="economic.sellPricePerKg" type="number" min="0" class="field" /></div>
          <div><label class="label">Biaya / batch (Rp)</label><input v-model.number="economic.costPerBatch" type="number" min="0" class="field" /></div>
          <div><label class="label">Modal alat (Rp)</label><input v-model.number="economic.capital" type="number" min="0" class="field" /></div>
        </div>
        <div v-if="preview" class="rounded-xl bg-primary-50/60 p-4">
          <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-primary-700">Pratinjau kelayakan (skala 5 batch)</p>
          <div class="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div><p class="text-muted">Hasil</p><p class="font-semibold text-ink">{{ preview.outputKg }} kg</p></div>
            <div><p class="text-muted">Omzet</p><p class="font-semibold text-ink">{{ formatRupiah(preview.revenue) }}</p></div>
            <div><p class="text-muted">Laba kotor</p><p class="font-semibold text-success">{{ formatRupiah(preview.grossProfit) }}</p></div>
            <div><p class="text-muted">BEP</p><p class="font-semibold text-ink">{{ preview.bepBatches }} batch</p></div>
          </div>
        </div>
        <AppTextarea id="src" v-model="form.sources" label="Sumber / Referensi (satu per baris)" :rows="2" placeholder="mis. Jurnal Agroindustri Kelapa Vol. 12" />
      </section>

      <div class="flex items-start gap-2 rounded-xl bg-info/5 p-3.5 text-sm text-info">
        <Info class="mt-0.5 h-4 w-4 shrink-0" />
        <p>Setelah dikirim, cetak biru berstatus <strong>Menunggu Kurasi</strong>. Moderator akan menelaah akurasi & K3 sebelum tayang (kematangan: Mentah → Terkurasi).</p>
      </div>

      <div class="flex justify-end gap-3 pb-4">
        <AppButton variant="ghost" @click="router.back()">Batal</AppButton>
        <AppButton :loading="submitting" size="lg" @click="submit"><template #icon><Send class="h-4 w-4" /></template>Kirim untuk Kurasi</AppButton>
      </div>
    </div>
  </div>
</template>
