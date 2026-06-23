// Mock data Cetak Biru Teknis + Pohon Nilai Kelapa (ontologi limbah→produk).
import type { BlueprintFull, BlueprintVersion, ValueNode } from '@/types'
import { pub } from './data'

const dAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString()

function makeVersions(b: Omit<BlueprintFull, 'status' | 'versions'>): BlueprintVersion[] {
  const v: BlueprintVersion[] = [{ version: 1, changelog: 'Versi awal dipublikasikan.', author: b.author, createdAt: dAgo(40) }]
  if (b.maturity === 'validated' || b.maturity === 'standard') {
    v.push({ version: 2, changelog: 'Penyempurnaan takaran & catatan K3 dari masukan komunitas.', author: pub(2), createdAt: dAgo(12) })
  }
  return v
}

// ---- Pohon Nilai (ontologi domain) ----
export const valueNodes: ValueNode[] = [
  { id: 1, parentId: null, type: 'root', name: 'Kelapa', slug: 'kelapa', icon: 'palmtree', blueprintCount: 0 },
  // limbah
  { id: 10, parentId: 1, type: 'waste', name: 'Sabut', slug: 'sabut', icon: 'layers', blueprintCount: 0 },
  { id: 11, parentId: 1, type: 'waste', name: 'Tempurung', slug: 'tempurung', icon: 'shell', blueprintCount: 0 },
  { id: 12, parentId: 1, type: 'waste', name: 'Air Kelapa', slug: 'air', icon: 'droplets', blueprintCount: 0 },
  { id: 13, parentId: 1, type: 'waste', name: 'Ampas', slug: 'ampas', icon: 'wheat', blueprintCount: 0 },
  // produk dari sabut
  { id: 100, parentId: 10, type: 'product', name: 'Cocopeat', slug: 'cocopeat', icon: 'sprout', blueprintCount: 0 },
  { id: 101, parentId: 10, type: 'product', name: 'Cocofiber', slug: 'cocofiber', icon: 'brush', blueprintCount: 0 },
  { id: 102, parentId: 10, type: 'product', name: 'Pot Sabut', slug: 'pot-sabut', icon: 'flower-2', blueprintCount: 0 },
  // produk dari tempurung
  { id: 110, parentId: 11, type: 'product', name: 'Briket', slug: 'briket', icon: 'flame', blueprintCount: 0 },
  { id: 111, parentId: 11, type: 'product', name: 'Arang Aktif', slug: 'arang-aktif', icon: 'filter', blueprintCount: 0 },
  { id: 112, parentId: 11, type: 'product', name: 'Kerajinan', slug: 'kerajinan', icon: 'palette', blueprintCount: 0 },
  // produk dari air
  { id: 120, parentId: 12, type: 'product', name: 'Nata de Coco', slug: 'nata-de-coco', icon: 'cherry', blueprintCount: 0 },
  { id: 121, parentId: 12, type: 'product', name: 'Cuka', slug: 'cuka', icon: 'flask-conical', blueprintCount: 0 },
  // produk dari ampas
  { id: 130, parentId: 13, type: 'product', name: 'Tepung', slug: 'tepung', icon: 'cookie', blueprintCount: 0 },
  { id: 131, parentId: 13, type: 'product', name: 'Pakan Ternak', slug: 'pakan', icon: 'beef', blueprintCount: 0 },
]

const longSummary =
  'Cetak biru ini merangkum praktik lapangan terstruktur — bahan, langkah, parameter mutu, K3, hingga hitungan ekonomi — agar UMKM dapat mereplikasi dan menskalakan dengan percaya diri.'

const blueprintSeeds: Omit<BlueprintFull, 'status' | 'versions'>[] = [
  {
    id: 1, title: 'Briket Arang dari Tempurung Kelapa', slug: 'briket-arang-tempurung',
    author: pub(4), wasteKind: 'tempurung', wasteLabel: 'Tempurung', product: 'Briket',
    excerpt: 'Ubah tempurung kelapa menjadi briket arang bernilai jual dengan modal kecil.',
    summary: longSummary, maturity: 'validated', difficulty: 'sedang', capitalTier: 'rendah',
    minCapital: 200000, estTime: '3 hari', tags: ['briket', 'energi', 'arang'],
    materials: [
      { name: 'Tempurung kelapa kering', qty: '10 kg', tier: 'wajib', price: 5000, note: 'kadar air < 15%' },
      { name: 'Drum karbonisasi bekas', qty: '1 unit', tier: 'murah', price: 150000 },
      { name: 'Kiln/tungku karbonisasi', qty: '1 unit', tier: 'mahal', price: 4000000, note: 'opsi skala besar' },
      { name: 'Tepung tapioka (perekat)', qty: '0,5 kg (5%)', tier: 'wajib', price: 8000 },
      { name: 'Cetakan & ayakan', qty: '1 set', tier: 'wajib', price: 50000 },
    ],
    steps: [
      { order: 1, title: 'Karbonisasi', detail: 'Bakar tempurung dalam drum tertutup hingga menjadi arang.', duration: '±2 jam', temperature: '300–500°C' },
      { order: 2, title: 'Penggilingan', detail: 'Giling/tumbuk arang hingga menjadi serbuk halus.', duration: '30 menit' },
      { order: 3, title: 'Pencampuran perekat', detail: 'Campur serbuk arang dengan larutan tapioka.', dose: 'tapioka 5% + air' },
      { order: 4, title: 'Pencetakan', detail: 'Cetak dan padatkan adonan menjadi briket.' },
      { order: 5, title: 'Pengeringan', detail: 'Jemur hingga kadar air di bawah 8%.', duration: '2–3 hari' },
    ],
    quality: [
      { name: 'Kadar air', target: '< 8%', method: 'Timbang sebelum & sesudah oven 105°C' },
      { name: 'Kekerasan', target: 'Tidak mudah hancur', method: 'Uji jatuh dari 1 m' },
      { name: 'Nyala', target: 'Stabil, asap minim', method: 'Uji bakar' },
    ],
    safety: [
      { risk: 'Asap karbon monoksida (CO)', mitigation: 'Karbonisasi di ruang berventilasi/terbuka' },
      { risk: 'Panas tinggi', mitigation: 'Gunakan sarung tangan & jauhkan anak-anak' },
    ],
    economic: { capital: 200000, costPerBatch: 8000, batchInputKg: 10, batchOutputKg: 3, sellPricePerKg: 9000 },
    sources: ['Kementerian Pertanian RI (2024)', 'Jurnal Agroindustri Kelapa Vol. 12'],
    isBookmarked: true, replications: { success: 9, partial: 2, fail: 1 },
    variants: [{ id: 9, region: 'Sulawesi', title: 'Varian tungku drum vertikal' }],
    stats: { views: 842, saves: 134, replications: 12, successRate: 75 },
  },
  {
    id: 2, title: 'Cocopeat Media Tanam dari Sabut Kelapa', slug: 'cocopeat-media-tanam',
    author: pub(2), wasteKind: 'sabut', wasteLabel: 'Sabut', product: 'Cocopeat',
    excerpt: 'Olah sabut menjadi cocopeat — media tanam yang diserap industri hortikultura.',
    summary: longSummary, maturity: 'validated', difficulty: 'mudah', capitalTier: 'menengah',
    minCapital: 3500000, estTime: '2 hari', tags: ['cocopeat', 'media-tanam', 'ekspor'],
    materials: [
      { name: 'Sabut kelapa kering', qty: '100 kg', tier: 'wajib', price: 30000 },
      { name: 'Mesin pengurai (decorticator)', qty: '1 unit', tier: 'mahal', price: 3500000 },
      { name: 'Ayakan getar', qty: '1 unit', tier: 'wajib', price: 250000 },
      { name: 'Karung/kemasan', qty: '20 pcs', tier: 'wajib', price: 20000 },
    ],
    steps: [
      { order: 1, title: 'Pengeringan sabut', detail: 'Keringkan sabut hingga kadar air < 15%.', duration: '1 hari' },
      { order: 2, title: 'Penguraian', detail: 'Urai sabut dengan decorticator, pisahkan serat & gabus.', duration: '2 jam' },
      { order: 3, title: 'Pengayakan', detail: 'Ayak cocopeat untuk memisahkan partikel halus dan kasar.' },
      { order: 4, title: 'Pengemasan', detail: 'Kemas curah atau dipadatkan menjadi blok.' },
    ],
    quality: [
      { name: 'Kadar air', target: '15–20%', method: 'Timbang sampel kering' },
      { name: 'EC (garam)', target: '< 1.0 mS/cm', method: 'EC meter setelah perendaman' },
    ],
    safety: [
      { risk: 'Debu serat halus', mitigation: 'Pakai masker saat pengayakan' },
      { risk: 'Bagian mesin berputar', mitigation: 'Pelindung & SOP operasi mesin' },
    ],
    economic: { capital: 3500000, costPerBatch: 20000, batchInputKg: 100, batchOutputKg: 35, sellPricePerKg: 2500 },
    sources: ['Balai Penelitian Tanaman Palma (2023)'],
    isBookmarked: false, replications: { success: 14, partial: 3, fail: 1 },
    variants: [], stats: { views: 1320, saves: 210, replications: 18, successRate: 78 },
  },
  {
    id: 3, title: 'Cocofiber untuk Geotekstil & Matras', slug: 'cocofiber-geotekstil',
    author: pub(2), wasteKind: 'sabut', wasteLabel: 'Sabut', product: 'Cocofiber',
    excerpt: 'Serat sabut bernilai tinggi untuk konstruksi, jok, dan geotekstil.',
    summary: longSummary, maturity: 'curated', difficulty: 'sedang', capitalTier: 'tinggi',
    minCapital: 15000000, estTime: '1 hari', tags: ['cocofiber', 'konstruksi'],
    materials: [
      { name: 'Sabut kelapa', qty: '100 kg', tier: 'wajib', price: 30000 },
      { name: 'Mesin penghasil serat', qty: '1 unit', tier: 'mahal', price: 15000000 },
      { name: 'Mesin press bal', qty: '1 unit', tier: 'mahal', price: 8000000, note: 'opsional untuk ekspor' },
    ],
    steps: [
      { order: 1, title: 'Penguraian serat', detail: 'Pisahkan serat panjang (bristle) dari gabus.' },
      { order: 2, title: 'Penjemuran', detail: 'Keringkan serat hingga kadar air aman.', duration: '4–6 jam' },
      { order: 3, title: 'Pengepakan', detail: 'Press menjadi bal untuk efisiensi pengiriman.' },
    ],
    quality: [
      { name: 'Panjang serat', target: '> 15 cm (grade A)', method: 'Sortir manual' },
      { name: 'Kadar air', target: '< 18%', method: 'Timbang sampel' },
    ],
    safety: [{ risk: 'Debu & serat terbang', mitigation: 'Masker + ventilasi' }, { risk: 'Mesin berdaya tinggi', mitigation: 'Operator terlatih' }],
    economic: { capital: 15000000, costPerBatch: 30000, batchInputKg: 100, batchOutputKg: 45, sellPricePerKg: 3000 },
    sources: ['Asosiasi Industri Sabut Kelapa Indonesia'],
    isBookmarked: false, replications: { success: 3, partial: 1, fail: 1 },
    variants: [], stats: { views: 560, saves: 70, replications: 5, successRate: 60 },
  },
  {
    id: 4, title: 'Arang Aktif dari Tempurung (Activated Carbon)', slug: 'arang-aktif-tempurung',
    author: pub(4), wasteKind: 'tempurung', wasteLabel: 'Tempurung', product: 'Arang Aktif',
    excerpt: 'Produk bernilai ekspor untuk filtrasi air, udara, dan industri.',
    summary: longSummary, maturity: 'curated', difficulty: 'sulit', capitalTier: 'tinggi',
    minCapital: 12000000, estTime: '4 hari', tags: ['arang-aktif', 'mutu', 'ekspor'],
    materials: [
      { name: 'Arang tempurung', qty: '20 kg', tier: 'wajib', price: 60000 },
      { name: 'Tungku aktivasi (retort)', qty: '1 unit', tier: 'mahal', price: 12000000 },
      { name: 'Aktivator (uap/KOH)', qty: 'sesuai proses', tier: 'wajib', price: 40000 },
    ],
    steps: [
      { order: 1, title: 'Karbonisasi awal', detail: 'Hasilkan arang dari tempurung.', temperature: '400–600°C' },
      { order: 2, title: 'Aktivasi', detail: 'Aktivasi fisik (uap) pada suhu tinggi.', temperature: '800–900°C', duration: '2 jam' },
      { order: 3, title: 'Pencucian & penetralan', detail: 'Cuci untuk menghilangkan residu.' },
      { order: 4, title: 'Pengeringan & pengayakan', detail: 'Keringkan dan sortir mesh.', duration: '1 hari' },
    ],
    quality: [
      { name: 'Daya serap iodin', target: '> 750 mg/g', method: 'Uji bilangan iodin (lab)' },
      { name: 'Kadar abu', target: '< 10%', method: 'Pembakaran sampel' },
    ],
    safety: [{ risk: 'Suhu sangat tinggi', mitigation: 'APD lengkap + isolasi panas' }, { risk: 'Bahan kimia aktivator', mitigation: 'Sarung tangan tahan kimia' }],
    economic: { capital: 12000000, costPerBatch: 40000, batchInputKg: 20, batchOutputKg: 8, sellPricePerKg: 25000 },
    sources: ['SNI Arang Aktif Teknis'],
    isBookmarked: false, replications: { success: 4, partial: 2, fail: 2 },
    variants: [], stats: { views: 690, saves: 95, replications: 8, successRate: 50 },
  },
  {
    id: 5, title: 'Nata de Coco dari Air Kelapa', slug: 'nata-de-coco',
    author: pub(3), wasteKind: 'air', wasteLabel: 'Air Kelapa', product: 'Nata de Coco',
    excerpt: 'Fermentasi air kelapa menjadi pangan bernilai tambah tinggi.',
    summary: longSummary, maturity: 'validated', difficulty: 'sedang', capitalTier: 'rendah',
    minCapital: 500000, estTime: '8 hari', tags: ['nata', 'pangan', 'fermentasi'],
    materials: [
      { name: 'Air kelapa segar', qty: '50 liter', tier: 'wajib', price: 0, note: 'limbah industri kelapa' },
      { name: 'Starter Acetobacter xylinum', qty: '5 liter', tier: 'wajib', price: 20000 },
      { name: 'Gula & asam asetat', qty: 'secukupnya', tier: 'wajib', price: 15000 },
      { name: 'Nampan fermentasi', qty: '20 pcs', tier: 'wajib', price: 200000 },
    ],
    steps: [
      { order: 1, title: 'Penyaringan & perebusan', detail: 'Saring air kelapa lalu rebus.', duration: '30 menit' },
      { order: 2, title: 'Penambahan nutrisi', detail: 'Tambahkan gula & atur pH dengan asam asetat.', dose: 'pH 4–4,5' },
      { order: 3, title: 'Inokulasi starter', detail: 'Tuang ke nampan, tambahkan starter, tutup.' },
      { order: 4, title: 'Fermentasi', detail: 'Diamkan di ruang bersih & tenang.', duration: '7 hari' },
      { order: 5, title: 'Pemanenan', detail: 'Panen lembaran nata, cuci & rebus untuk netralkan asam.' },
    ],
    quality: [
      { name: 'Ketebalan nata', target: '> 1 cm', method: 'Ukur penggaris' },
      { name: 'Kebersihan', target: 'Bebas jamur', method: 'Inspeksi visual' },
    ],
    safety: [{ risk: 'Kontaminasi jamur', mitigation: 'Sterilisasi alat & ruang bersih' }, { risk: 'Asam asetat', mitigation: 'Hindari kontak mata' }],
    economic: { capital: 500000, costPerBatch: 25000, batchInputKg: 50, batchOutputKg: 8, sellPricePerKg: 15000 },
    sources: ['Jurnal Teknologi Pangan (2022)'],
    isBookmarked: true, replications: { success: 11, partial: 2, fail: 2 },
    variants: [], stats: { views: 980, saves: 160, replications: 15, successRate: 73 },
  },
  {
    id: 6, title: 'Cuka Fermentasi dari Air Kelapa', slug: 'cuka-air-kelapa',
    author: pub(4), wasteKind: 'air', wasteLabel: 'Air Kelapa', product: 'Cuka',
    excerpt: 'Eksperimen fermentasi air kelapa menjadi cuka organik.',
    summary: longSummary, maturity: 'raw', difficulty: 'mudah', capitalTier: 'rendah',
    minCapital: 150000, estTime: '21 hari', tags: ['cuka', 'fermentasi'],
    materials: [
      { name: 'Air kelapa', qty: '20 liter', tier: 'wajib', price: 0 },
      { name: 'Gula merah', qty: '2 kg', tier: 'wajib', price: 30000 },
      { name: 'Starter cuka (mother)', qty: '1 liter', tier: 'wajib', price: 10000 },
      { name: 'Wadah kaca/keramik', qty: '2 pcs', tier: 'wajib', price: 110000 },
    ],
    steps: [
      { order: 1, title: 'Pembuatan larutan', detail: 'Larutkan gula ke air kelapa, rebus, dinginkan.' },
      { order: 2, title: 'Fermentasi alkohol', detail: 'Diamkan dengan ragi hingga terbentuk alkohol.', duration: '7 hari' },
      { order: 3, title: 'Fermentasi asetat', detail: 'Tambah mother of vinegar, diamkan.', duration: '14 hari' },
      { order: 4, title: 'Penyaringan', detail: 'Saring & botolkan cuka.' },
    ],
    quality: [{ name: 'Keasaman', target: 'pH 2,5–3,5', method: 'pH meter / kertas lakmus' }],
    safety: [{ risk: 'Kontaminasi', mitigation: 'Wadah steril, tutup kain' }],
    economic: { capital: 150000, costPerBatch: 10000, batchInputKg: 20, batchOutputKg: 15, sellPricePerKg: 8000 },
    sources: ['Catatan praktik UMKM (belum diverifikasi)'],
    isBookmarked: false, replications: { success: 1, partial: 0, fail: 1 },
    variants: [], stats: { views: 210, saves: 24, replications: 2, successRate: 50 },
  },
  {
    id: 7, title: 'Tepung Ampas Kelapa Pangan Fungsional', slug: 'tepung-ampas-kelapa',
    author: pub(3), wasteKind: 'ampas', wasteLabel: 'Ampas', product: 'Tepung',
    excerpt: 'Ampas kelapa menjadi tepung tinggi serat untuk produk pangan.',
    summary: longSummary, maturity: 'standard', difficulty: 'mudah', capitalTier: 'rendah',
    minCapital: 800000, estTime: '1 hari', tags: ['tepung', 'pangan'],
    materials: [
      { name: 'Ampas kelapa segar', qty: '20 kg', tier: 'wajib', price: 0 },
      { name: 'Oven/pengering', qty: '1 unit', tier: 'murah', price: 600000 },
      { name: 'Mesin penepung', qty: '1 unit', tier: 'murah', price: 200000 },
      { name: 'Ayakan 80 mesh', qty: '1 pcs', tier: 'wajib', price: 30000 },
    ],
    steps: [
      { order: 1, title: 'Pengeringan', detail: 'Keringkan ampas hingga kadar air rendah.', temperature: '60–70°C', duration: '4 jam' },
      { order: 2, title: 'Penepungan', detail: 'Giling ampas kering menjadi tepung.' },
      { order: 3, title: 'Pengayakan', detail: 'Ayak untuk tekstur halus & seragam.' },
      { order: 4, title: 'Pengemasan', detail: 'Kemas kedap udara + silica gel.' },
    ],
    quality: [
      { name: 'Kadar air', target: '< 7%', method: 'Timbang sampel' },
      { name: 'Kehalusan', target: 'Lolos 80 mesh', method: 'Ayakan standar' },
    ],
    safety: [{ risk: 'Panas oven', mitigation: 'Sarung tangan tahan panas' }, { risk: 'Higienitas pangan', mitigation: 'Alat food-grade & bersih' }],
    economic: { capital: 800000, costPerBatch: 12000, batchInputKg: 20, batchOutputKg: 5, sellPricePerKg: 18000 },
    sources: ['SNI Tepung; Jurnal Pangan Fungsional'],
    isBookmarked: false, replications: { success: 20, partial: 2, fail: 0 },
    variants: [{ id: 14, region: 'Jawa Timur', title: 'Varian sangrai tanpa oven' }],
    stats: { views: 1510, saves: 280, replications: 22, successRate: 91 },
  },
  {
    id: 8, title: 'Pot Ramah Lingkungan dari Sabut (Cocopot)', slug: 'pot-sabut-cocopot',
    author: pub(3), wasteKind: 'sabut', wasteLabel: 'Sabut', product: 'Pot Sabut',
    excerpt: 'Pot organik biodegradable dari sabut untuk pembibitan.',
    summary: longSummary, maturity: 'curated', difficulty: 'mudah', capitalTier: 'rendah',
    minCapital: 300000, estTime: '2 hari', tags: ['pot', 'eco', 'pembibitan'],
    materials: [
      { name: 'Serat & gabus sabut', qty: '5 kg', tier: 'wajib', price: 5000 },
      { name: 'Lateks/perekat alami', qty: '1 kg', tier: 'wajib', price: 25000 },
      { name: 'Cetakan pot', qty: '1 set', tier: 'murah', price: 270000 },
    ],
    steps: [
      { order: 1, title: 'Pencampuran', detail: 'Campur serat sabut dengan perekat alami.' },
      { order: 2, title: 'Pencetakan', detail: 'Tekan campuran ke cetakan pot.' },
      { order: 3, title: 'Pengeringan', detail: 'Jemur hingga pot mengeras.', duration: '1–2 hari' },
    ],
    quality: [
      { name: 'Kekuatan dinding', target: 'Tidak mudah sobek', method: 'Uji tekan tangan' },
      { name: 'Biodegradabilitas', target: 'Terurai < 6 bulan', method: 'Uji tanam' },
    ],
    safety: [{ risk: 'Debu sabut', mitigation: 'Masker' }],
    economic: { capital: 300000, costPerBatch: 15000, batchInputKg: 5, batchOutputKg: 2.5, sellPricePerKg: 20000 },
    sources: ['Praktik UMKM Sukabumi'],
    isBookmarked: false, replications: { success: 5, partial: 1, fail: 0 },
    variants: [], stats: { views: 430, saves: 88, replications: 6, successRate: 83 },
  },
]

// Seed selalu berstatus published; kontribusi baru akan berstatus submitted (menunggu kurasi).
export const blueprintsFull: BlueprintFull[] = blueprintSeeds.map((b) => ({
  ...b,
  status: 'published' as const,
  versions: makeVersions(b),
}))
