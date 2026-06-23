<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import {
  ArrowLeft, Wrench, Users, BarChart3, Megaphone, Repeat2, MapPin, Phone, Lock,
  BadgeCheck, Target, ShoppingCart, Package, Globe, Lightbulb, Calculator, ArrowRight, Network,
} from 'lucide-vue-next'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import type { ProductHub } from '@/types'
import { formatRupiah } from '@/lib/blueprint'
import BlueprintCard from '@/components/common/BlueprintCard.vue'
import ListingCard from '@/components/common/ListingCard.vue'
import AppAvatar from '@/components/ui/AppAvatar.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'

const route = useRoute()
const auth = useAuthStore()
const hub = ref<ProductHub | null>(null)
const loading = ref(true)
const slug = computed(() => String(route.params.slug))

const exportMeta = { tinggi: { label: 'Potensi ekspor tinggi', chip: 'bg-success/10 text-success' }, sedang: { label: 'Potensi ekspor sedang', chip: 'bg-warning/15 text-gold-700' }, rendah: { label: 'Potensi ekspor rendah', chip: 'bg-line text-muted' } }

async function load() {
  loading.value = true
  try {
    hub.value = await api.productHub(slug.value)
  } finally {
    loading.value = false
  }
}
watch(slug, load)
onMounted(load)
</script>

<template>
  <div class="container-page py-8">
    <RouterLink to="/pohon-nilai" class="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary-600">
      <ArrowLeft class="h-4 w-4" /> Kembali ke Pohon Nilai
    </RouterLink>

    <LoadingBlock v-if="loading" label="Memuat rantai nilai produk…" />

    <div v-else-if="hub">
      <!-- Header -->
      <div class="relative overflow-hidden rounded-3xl bg-primary-800 p-8 text-white">
        <div class="hero-mesh absolute inset-0 opacity-60" />
        <div class="relative">
          <div class="mb-2 flex flex-wrap items-center gap-2 text-sm text-white/80">
            <span class="chip bg-white/15 text-white">{{ hub.product.wasteLabel }}</span>
            <span>→</span>
            <span class="font-medium">{{ hub.product.name }}</span>
          </div>
          <h1 class="font-display text-3xl font-bold sm:text-4xl">{{ hub.product.name }}</h1>
          <p class="mt-2 max-w-2xl text-white/80">Rantai nilai lengkap: cara membuat, siapa yang memproduksi, cara memasarkan, dan hitungan ekonominya — dari {{ hub.product.wasteLabel.toLowerCase() }} kelapa.</p>
          <div class="mt-5 flex flex-wrap gap-6">
            <div><p class="font-display text-2xl font-bold">{{ hub.blueprints.length }}</p><p class="text-xs text-white/70">cetak biru</p></div>
            <div><p class="font-display text-2xl font-bold">{{ hub.umkms.length }}</p><p class="text-xs text-white/70">UMKM produsen</p></div>
            <div><p class="font-display text-2xl font-bold">{{ hub.economics.count ? formatRupiah(hub.economics.minCapital) : '—' }}</p><p class="text-xs text-white/70">modal mulai</p></div>
            <div><p class="font-display text-2xl font-bold">{{ hub.listings.length }}</p><p class="text-xs text-white/70">iklan bursa</p></div>
          </div>
        </div>
      </div>

      <!-- Navigasi cepat -->
      <div class="sticky top-16 z-10 -mx-4 mt-4 flex gap-1 overflow-x-auto border-b border-line bg-canvas/90 px-4 py-2 backdrop-blur no-scrollbar sm:mx-0 sm:px-0">
        <a v-for="s in [['proses','Proses'],['umkm','UMKM'],['ekonomi','Ekonomi'],['pemasaran','Pemasaran'],['bursa','Bursa']]" :key="s[0]" :href="`#${s[0]}`" class="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-line/60 hover:text-ink">{{ s[1] }}</a>
      </div>

      <!-- PROSES -->
      <section id="proses" class="scroll-mt-28 pt-8">
        <h2 class="mb-1 flex items-center gap-2 text-h2"><Wrench class="h-5 w-5 text-primary-600" /> Cara Membuat (Proses)</h2>
        <p class="mb-4 text-muted">Cetak biru teknis terstruktur untuk memproduksi {{ hub.product.name }}.</p>
        <div v-if="hub.blueprints.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <BlueprintCard v-for="b in hub.blueprints" :key="b.id" :blueprint="b" />
        </div>
        <EmptyState v-else :icon="Wrench" title="Belum ada cetak biru" description="Jadilah yang pertama mendokumentasikan teknik produksi ini." />
      </section>

      <!-- UMKM -->
      <section id="umkm" class="scroll-mt-28 pt-12">
        <h2 class="mb-1 flex items-center gap-2 text-h2"><Users class="h-5 w-5 text-primary-600" /> UMKM Produsen</h2>
        <p class="mb-4 text-muted">Pelaku usaha yang menghasilkan {{ hub.product.name }} — calon mitra, mentor, atau pemasok.</p>
        <div v-if="hub.umkms.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="d in hub.umkms" :key="d.id" class="premium-card flex flex-col p-5">
            <div class="flex items-start gap-3">
              <AppAvatar :name="d.businessName" size="lg" />
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5"><h3 class="truncate font-display font-semibold text-ink">{{ d.businessName }}</h3><BadgeCheck v-if="d.verified" class="h-4 w-4 shrink-0 text-info" /></div>
                <p class="inline-flex items-center gap-1 text-xs text-muted"><MapPin class="h-3 w-3" />{{ d.region }}</p>
              </div>
            </div>
            <p class="mt-2 line-clamp-2 text-sm text-muted">{{ d.bio }}</p>
            <div class="mt-3 flex flex-wrap gap-1">
              <span v-for="p in d.products" :key="p" class="chip" :class="p.toLowerCase().includes(hub.product.name.toLowerCase()) ? 'bg-primary-600 text-white' : 'bg-gold-100 text-gold-700'">{{ p }}</span>
            </div>
            <div class="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3 text-xs text-muted">
              <span class="inline-flex items-center gap-1"><Wrench class="h-3 w-3" />{{ d.blueprintsCount }} cetak biru · {{ d.capacity }}</span>
            </div>
            <p v-if="auth.isAuthenticated" class="mt-2 inline-flex items-center gap-1 text-xs text-primary-600"><Phone class="h-3 w-3" />{{ d.contact }}</p>
            <RouterLink v-else to="/login" class="mt-2 inline-flex items-center gap-1 text-xs text-muted hover:text-primary-600"><Lock class="h-3 w-3" />Login untuk lihat kontak</RouterLink>
          </div>
        </div>
        <EmptyState v-else :icon="Users" title="Belum ada UMKM terdaftar" description="Sudah memproduksi ini? Daftarkan usaha Anda di Direktori UMKM.">
          <RouterLink to="/direktori" class="btn-secondary btn-md">Buka Direktori</RouterLink>
        </EmptyState>
      </section>

      <!-- EKONOMI -->
      <section id="ekonomi" class="scroll-mt-28 pt-12">
        <h2 class="mb-1 flex items-center gap-2 text-h2"><BarChart3 class="h-5 w-5 text-primary-600" /> Hitungan Ekonomi</h2>
        <p class="mb-4 text-muted">Gambaran modal & potensi keuntungan dari cetak biru yang tersedia.</p>
        <div v-if="hub.economics.count" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="premium-card p-5"><p class="text-sm text-muted">Modal</p><p class="mt-1 font-display text-xl font-bold text-ink">{{ formatRupiah(hub.economics.minCapital) }}<span v-if="hub.economics.maxCapital !== hub.economics.minCapital" class="text-sm font-normal text-muted"> – {{ formatRupiah(hub.economics.maxCapital) }}</span></p></div>
          <div class="premium-card p-5"><p class="text-sm text-muted">Estimasi laba/minggu</p><p class="mt-1 font-display text-xl font-bold text-success">{{ formatRupiah(hub.economics.avgWeeklyProfit) }}</p><p class="text-[11px] text-muted">rata-rata (skala 5 batch)</p></div>
          <div class="premium-card p-5"><p class="text-sm text-muted">Titik impas (BEP)</p><p class="mt-1 font-display text-xl font-bold text-ink">{{ hub.economics.bepMin }}<span v-if="hub.economics.bepMax !== hub.economics.bepMin">–{{ hub.economics.bepMax }}</span> batch</p></div>
          <RouterLink v-if="hub.economics.cheapestBlueprintId" :to="`/cetak-biru/${hub.economics.cheapestBlueprintId}`" class="premium-card premium-card-hover flex flex-col justify-center p-5">
            <span class="inline-flex items-center gap-2 text-sm font-medium text-primary-700"><Calculator class="h-4 w-4" /> Hitung kelayakan Anda</span>
            <span class="mt-1 inline-flex items-center gap-1 text-xs text-muted">Buka kalkulator interaktif <ArrowRight class="h-3 w-3" /></span>
          </RouterLink>
        </div>
        <EmptyState v-else :icon="BarChart3" title="Belum ada data ekonomi" description="Data muncul setelah ada cetak biru untuk produk ini." />
      </section>

      <!-- PEMASARAN -->
      <section id="pemasaran" class="scroll-mt-28 pt-12">
        <h2 class="mb-1 flex items-center gap-2 text-h2"><Megaphone class="h-5 w-5 text-primary-600" /> Cara Pemasaran</h2>
        <p class="mb-4 text-muted">Panduan menjual {{ hub.product.name }} — pasar, kanal, harga, hingga peluang ekspor.</p>
        <div v-if="hub.marketing" class="grid gap-5 lg:grid-cols-3">
          <div class="premium-card p-5">
            <h3 class="mb-3 flex items-center gap-2 font-display font-semibold text-ink"><Target class="h-4.5 w-4.5 text-primary-600" /> Target Pasar & Pembeli</h3>
            <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted/70">Pasar</p>
            <div class="mb-3 flex flex-wrap gap-1.5"><span v-for="t in hub.marketing.targetMarket" :key="t" class="chip bg-primary-50 text-primary-700">{{ t }}</span></div>
            <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted/70">Pembeli potensial</p>
            <ul class="space-y-1 text-sm text-muted"><li v-for="b in hub.marketing.buyers" :key="b" class="flex items-center gap-1.5"><ShoppingCart class="h-3.5 w-3.5 text-primary-400" />{{ b }}</li></ul>
          </div>
          <div class="premium-card p-5">
            <h3 class="mb-3 flex items-center gap-2 font-display font-semibold text-ink"><Network class="h-4.5 w-4.5 text-primary-600" /> Kanal Penjualan</h3>
            <ul class="space-y-3">
              <li v-for="c in hub.marketing.channels" :key="c.name">
                <p class="text-sm font-medium text-ink">{{ c.name }}</p>
                <p class="text-xs text-muted">{{ c.note }}</p>
              </li>
            </ul>
          </div>
          <div class="space-y-5">
            <div class="premium-card p-5">
              <h3 class="mb-3 flex items-center gap-2 font-display font-semibold text-ink"><Package class="h-4.5 w-4.5 text-primary-600" /> Harga & Kemasan</h3>
              <p class="text-sm"><span class="text-muted">Kisaran harga:</span> <span class="font-medium text-ink">{{ hub.marketing.priceRange }}</span></p>
              <p class="mt-2 text-sm text-muted">{{ hub.marketing.packaging }}</p>
            </div>
            <div class="premium-card p-5">
              <div class="flex items-center justify-between">
                <h3 class="flex items-center gap-2 font-display font-semibold text-ink"><Globe class="h-4.5 w-4.5 text-primary-600" /> Ekspor</h3>
                <span class="chip" :class="exportMeta[hub.marketing.exportPotential].chip">{{ exportMeta[hub.marketing.exportPotential].label }}</span>
              </div>
              <p class="mt-2 text-sm text-muted">{{ hub.marketing.exportNote }}</p>
            </div>
          </div>
          <div class="premium-card p-5 lg:col-span-3">
            <h3 class="mb-3 flex items-center gap-2 font-display font-semibold text-ink"><Lightbulb class="h-4.5 w-4.5 text-gold-500" /> Tips Praktis</h3>
            <ul class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <li v-for="(t, i) in hub.marketing.tips" :key="i" class="flex items-start gap-2 rounded-xl bg-canvas p-3 text-sm text-ink/90"><span class="mt-0.5 text-primary-500">✦</span>{{ t }}</li>
            </ul>
          </div>
        </div>
        <EmptyState v-else :icon="Megaphone" title="Panduan pemasaran belum tersedia" description="Panduan untuk produk ini sedang disusun." />
      </section>

      <!-- BURSA -->
      <section id="bursa" class="scroll-mt-28 py-12">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="flex items-center gap-2 text-h2"><Repeat2 class="h-5 w-5 text-primary-600" /> Bursa Terkait</h2>
          <RouterLink to="/bursa" class="text-sm font-medium text-primary-600 hover:underline">Semua iklan →</RouterLink>
        </div>
        <div v-if="hub.listings.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ListingCard v-for="l in hub.listings" :key="l.id" :listing="l" />
        </div>
        <EmptyState v-else :icon="Repeat2" title="Belum ada iklan bursa" description="Punya surplus atau butuh bahan baku untuk produk ini? Pasang di Bursa.">
          <RouterLink to="/bursa" class="btn-secondary btn-md">Buka Bursa</RouterLink>
        </EmptyState>
      </section>
    </div>
  </div>
</template>
