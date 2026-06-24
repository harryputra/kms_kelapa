// Mock data Cetak Biru Teknis + Pohon Nilai Kelapa (ontologi limbah→produk).
// Konten teknis dirangkum dari riset: SNI 01-6235-2000 (briket), SNI 06-3730-1995
// (arang aktif), jurnal teknologi pangan/pertanian, & praktik UMKM.
import type { BlueprintFull, BlueprintVersion, ValueNode } from '@/types'
import { pub } from './data'

const dAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString()

function makeVersions(b: Omit<BlueprintFull, 'status' | 'versions'>): BlueprintVersion[] {
  const v: BlueprintVersion[] = [{ version: 1, changelog: 'Versi awal dipublikasikan.', author: b.author, createdAt: dAgo(40) }]
  if (b.maturity === 'validated' || b.maturity === 'standard') {
    v.push({ version: 2, changelog: 'Penyempurnaan takaran, parameter mutu (rujuk SNI), & catatan K3 dari masukan komunitas.', author: pub(2), createdAt: dAgo(12) })
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

const blueprintSeeds: Omit<BlueprintFull, 'status' | 'versions'>[] = [
  // ===================== TEMPURUNG → BRIKET =====================
  {
    id: 1, title: 'Briket Arang dari Tempurung Kelapa', slug: 'briket-arang-tempurung',
    author: pub(4), wasteKind: 'tempurung', wasteLabel: 'Tempurung', product: 'Briket',
    excerpt: 'Ubah tempurung kelapa menjadi briket arang nilai kalor tinggi (≥5000 kal/g) yang diminati pasar lokal & ekspor.',
    summary:
      'Briket arang tempurung adalah produk energi bernilai ekspor (BBQ & shisha). Cetak biru ini mengikuti SNI 01-6235-2000: karbonisasi terkontrol, penghalusan & pengayakan (mesh 50–80), pencampuran perekat tapioka, pencetakan padat, lalu pengeringan hingga kadar air <8%. Mutu ditentukan kadar air, kadar abu, zat terbang, dan nilai kalor.',
    maturity: 'validated', difficulty: 'sedang', capitalTier: 'rendah',
    minCapital: 350000, estTime: '3–4 hari', tags: ['briket', 'energi', 'arang', 'ekspor', 'BBQ'],
    materials: [
      { name: 'Tempurung kelapa kering', qty: '10 kg', tier: 'wajib', price: 5000, note: 'Pilih tempurung tua, kadar air < 15%' },
      { name: 'Drum karbonisasi (drum bekas 200 L)', qty: '1 unit', tier: 'murah', price: 150000, note: 'Beri lubang udara yang bisa ditutup' },
      { name: 'Kiln/retort karbonisasi', qty: '1 unit', tier: 'mahal', price: 6000000, note: 'Opsi skala besar, rendemen & mutu lebih stabil' },
      { name: 'Tepung tapioka (perekat)', qty: '0,3–0,5 kg', tier: 'wajib', price: 8000, note: 'Perekat 5–10% berat serbuk arang' },
      { name: 'Mesin penepung/penumbuk arang', qty: '1 unit', tier: 'murah', price: 120000 },
      { name: 'Ayakan mesh 50–80', qty: '1 pcs', tier: 'wajib', price: 35000 },
      { name: 'Cetakan briket (manual/hidrolik)', qty: '1 set', tier: 'wajib', price: 90000 },
    ],
    steps: [
      { order: 1, title: 'Karbonisasi (pengarangan)', detail: 'Bakar tempurung dalam drum tertutup. Pantau asap: ketika asap berubah biru tipis, tutup semua lubang udara agar api padam — arang tidak menjadi abu putih.', duration: '±2 jam', temperature: '400–500°C' },
      { order: 2, title: 'Pendinginan', detail: 'Biarkan drum dingin sepenuhnya sebelum dibuka agar arang tidak terbakar habis saat terkena udara.', duration: '6–12 jam' },
      { order: 3, title: 'Penghalusan', detail: 'Tumbuk/giling arang menjadi serbuk. Makin halus, briket makin padat & mulus.', duration: '30–45 menit' },
      { order: 4, title: 'Pengayakan', detail: 'Ayak serbuk dengan mesh 50–80 agar ukuran partikel seragam.' },
      { order: 5, title: 'Pembuatan lem kanji', detail: 'Masak tapioka dengan air hingga jadi pasta (gel), lalu dinginkan.', dose: 'tapioka : air ≈ 1 : 10' },
      { order: 6, title: 'Pencampuran perekat', detail: 'Campur serbuk arang dengan lem kanji hingga adonan kalis (bisa dikepal, tidak retak).', dose: 'perekat 5–10% berat arang' },
      { order: 7, title: 'Pencetakan', detail: 'Cetak & padatkan adonan (bentuk kubus/hexagonal untuk ekspor). Tekanan tinggi = briket lebih padat.' },
      { order: 8, title: 'Pengeringan', detail: 'Jemur/oven hingga kadar air < 8%. Hindari briket retak akibat pengeringan terlalu cepat.', duration: '2–3 hari', temperature: 'matahari / oven 60°C' },
    ],
    quality: [
      { name: 'Kadar air', target: '< 8% (SNI 01-6235-2000)', method: 'Timbang sebelum/sesudah oven 105°C' },
      { name: 'Kadar abu', target: '< 8%', method: 'Pengabuan pada 600°C (lab)' },
      { name: 'Zat menguap (volatile)', target: '< 15%', method: 'Uji proksimat (lab)' },
      { name: 'Nilai kalor', target: '≥ 5000 kal/g (tempurung bisa 6000–8000)', method: 'Bomb calorimeter (lab)' },
      { name: 'Kekerasan', target: 'Tidak hancur saat dijatuhkan', method: 'Uji jatuh dari 1 m' },
    ],
    safety: [
      { risk: 'Gas karbon monoksida (CO) saat karbonisasi', mitigation: 'Lakukan di area terbuka/berventilasi, jauh dari ruang tidur' },
      { risk: 'Panas tinggi & percikan api', mitigation: 'Sarung tangan & alas tahan panas, sediakan air/pasir' },
      { risk: 'Debu arang terhirup', mitigation: 'Pakai masker saat menumbuk & mengayak' },
    ],
    economic: { capital: 350000, costPerBatch: 13000, batchInputKg: 10, batchOutputKg: 3, sellPricePerKg: 10000 },
    sources: ['SNI 01-6235-2000 — Briket Arang Kayu', 'Chemical Engineering Journal Storage, Univ. Malikussaleh (2023)', 'Jurnal Saintis, Univ. Bosowa'],
    isBookmarked: true, replications: { success: 9, partial: 2, fail: 1 },
    variants: [{ id: 901, region: 'Sulawesi', title: 'Varian tungku drum vertikal' }],
    stats: { views: 842, saves: 134, replications: 12, successRate: 75 },
  },

  // ===================== SABUT → COCOPEAT =====================
  {
    id: 2, title: 'Cocopeat Media Tanam Low-EC dari Sabut', slug: 'cocopeat-media-tanam',
    author: pub(2), wasteKind: 'sabut', wasteLabel: 'Sabut', product: 'Cocopeat',
    excerpt: 'Olah sabut menjadi cocopeat low-EC siap ekspor — media tanam favorit industri hortikultura.',
    summary:
      'Cocopeat (serbuk sabut) bernilai ekspor tinggi bila EC-nya rendah & seragam. Kunci mutu ada pada pencucian (leaching) bertingkat untuk membuang garam, lalu buffering dengan kalsium nitrat agar kalium/natrium tergantikan kalsium. Diakhiri pengeringan < 15% & kompresi blok untuk efisiensi kirim.',
    maturity: 'validated', difficulty: 'mudah', capitalTier: 'menengah',
    minCapital: 4000000, estTime: '2–3 hari', tags: ['cocopeat', 'media-tanam', 'ekspor', 'low-ec'],
    materials: [
      { name: 'Sabut kelapa kering', qty: '100 kg', tier: 'wajib', price: 30000, note: 'Kadar air < 15%' },
      { name: 'Mesin pengurai (decorticator)', qty: '1 unit', tier: 'mahal', price: 3500000 },
      { name: 'Ayakan getar / screen shaker', qty: '1 unit', tier: 'wajib', price: 350000 },
      { name: 'Bak pencucian + air bersih (EC<0,2)', qty: '1 set', tier: 'wajib', price: 200000, note: 'Air baku menentukan keberhasilan low-EC' },
      { name: 'Kalsium nitrat (buffering)', qty: 'sesuai kebutuhan', tier: 'murah', price: 40000, note: 'Dosis ±5–8 g/L air' },
      { name: 'Mesin press hidrolik (blok)', qty: '1 unit', tier: 'mahal', price: 6000000, note: 'Opsional untuk blok/bale ekspor' },
      { name: 'Karung/kemasan', qty: '20 pcs', tier: 'wajib', price: 20000 },
    ],
    steps: [
      { order: 1, title: 'Penguraian', detail: 'Urai sabut dengan decorticator; pisahkan serat (cocofiber) dari serbuk (cocopeat).', duration: '2 jam' },
      { order: 2, title: 'Pengayakan', detail: 'Saring serbuk dengan screen shaker untuk membuang potongan serat & gabus kasar.' },
      { order: 3, title: 'Pencucian (leaching)', detail: 'Rendam & buang air berulang untuk menurunkan EC. Air berkualitas butuh 3–5 siklus.', dose: 'EC target < 1,0 mS/cm (ekspor < 0,5)' },
      { order: 4, title: 'Buffering', detail: 'Rendam dalam larutan kalsium nitrat agar Na/K tergantikan Ca, menstabilkan EC & pH.', dose: '5–8 g Ca(NO₃)₂ / L', duration: '8–24 jam' },
      { order: 5, title: 'Pembilasan akhir', detail: 'Bilas sisa larutan buffering hingga air bilasan jernih.' },
      { order: 6, title: 'Pengeringan', detail: 'Keringkan hingga kadar air standar ekspor.', temperature: 'matahari / rotary dryer', dose: 'kadar air < 15%' },
      { order: 7, title: 'Kompresi & pengemasan', detail: 'Padatkan dengan press hidrolik menjadi blok 5 kg / bale, lalu kemas & beri label EC/pH.' },
    ],
    quality: [
      { name: 'EC (salinitas)', target: '< 1,0 mS/cm (ekspor < 0,5)', method: 'EC/TDS meter setelah perendaman' },
      { name: 'pH', target: '5,5–6,8', method: 'pH meter' },
      { name: 'Kadar air', target: '< 15%', method: 'Timbang sampel kering' },
      { name: 'Keseragaman partikel', target: 'Halus & seragam', method: 'Ayakan standar' },
    ],
    safety: [
      { risk: 'Debu serat halus', mitigation: 'Masker & ventilasi saat pengayakan' },
      { risk: 'Bagian mesin berputar', mitigation: 'Pelindung mesin & SOP operasi' },
      { risk: 'Limbah air cucian', mitigation: 'Endapkan/olah sebelum dibuang' },
    ],
    economic: { capital: 4000000, costPerBatch: 35000, batchInputKg: 100, batchOutputKg: 35, sellPricePerKg: 3000 },
    sources: ['Balai Penelitian Tanaman Palma (2023)', 'Panduan Produksi Cocopeat Low-EC (industri)'],
    isBookmarked: false, replications: { success: 14, partial: 3, fail: 1 },
    variants: [], stats: { views: 1320, saves: 210, replications: 18, successRate: 78 },
  },

  // ===================== SABUT → COCOFIBER =====================
  {
    id: 3, title: 'Cocofiber untuk Geotekstil, Matras & Ekspor', slug: 'cocofiber-geotekstil',
    author: pub(2), wasteKind: 'sabut', wasteLabel: 'Sabut', product: 'Cocofiber',
    excerpt: 'Serat sabut bernilai tinggi untuk matras, jok otomotif, geotekstil penahan tanah, dan ekspor.',
    summary:
      'Cocofiber adalah serat panjang hasil penguraian sabut. Nilai jual ditentukan grade (panjang serat) & kekeringan. Diproses lewat penguraian, penjemuran, sortir grade, lalu dipress menjadi bal agar hemat ongkos kirim. Grade A (>15 cm) bernilai ekspor.',
    maturity: 'curated', difficulty: 'sedang', capitalTier: 'tinggi',
    minCapital: 15000000, estTime: '1–2 hari', tags: ['cocofiber', 'konstruksi', 'ekspor', 'serat'],
    materials: [
      { name: 'Sabut kelapa', qty: '100 kg', tier: 'wajib', price: 30000 },
      { name: 'Mesin penghasil serat (defibering)', qty: '1 unit', tier: 'mahal', price: 15000000 },
      { name: 'Mesin press bal (baling)', qty: '1 unit', tier: 'mahal', price: 8000000, note: 'Untuk efisiensi kirim & ekspor' },
      { name: 'Para-para / lantai jemur', qty: '1 set', tier: 'murah', price: 300000 },
      { name: 'Tali/wrapping bal', qty: 'sesuai kebutuhan', tier: 'wajib', price: 50000 },
    ],
    steps: [
      { order: 1, title: 'Penguraian serat', detail: 'Proses sabut di mesin defibering; pisahkan serat panjang (bristle) dari serbuk (cocopeat).' },
      { order: 2, title: 'Penjemuran', detail: 'Keringkan serat hingga kadar air aman untuk penyimpanan.', duration: '4–6 jam', temperature: 'sinar matahari' },
      { order: 3, title: 'Penyortiran grade', detail: 'Sortir serat berdasarkan panjang: Grade A (>15 cm) untuk ekspor, Grade B untuk lokal.' },
      { order: 4, title: 'Pengepresan bal', detail: 'Press serat menjadi bal padat (mis. 100 kg) lalu ikat & beri label grade.' },
    ],
    quality: [
      { name: 'Panjang serat', target: '> 15 cm (Grade A)', method: 'Sortir & ukur manual' },
      { name: 'Kadar air', target: '< 18%', method: 'Timbang sampel' },
      { name: 'Kebersihan', target: 'Minim debu/cocopeat menempel', method: 'Inspeksi visual' },
    ],
    safety: [
      { risk: 'Debu & serat terbang', mitigation: 'Masker + ventilasi/exhaust' },
      { risk: 'Mesin berdaya tinggi', mitigation: 'Operator terlatih, tombol darurat' },
    ],
    economic: { capital: 15000000, costPerBatch: 45000, batchInputKg: 100, batchOutputKg: 45, sellPricePerKg: 3000 },
    sources: ['Asosiasi Industri Sabut Kelapa Indonesia (HIPKI)', 'Praktik eksportir serat'],
    isBookmarked: false, replications: { success: 3, partial: 1, fail: 1 },
    variants: [], stats: { views: 560, saves: 70, replications: 5, successRate: 60 },
  },

  // ===================== TEMPURUNG → ARANG AKTIF =====================
  {
    id: 4, title: 'Arang Aktif (Activated Carbon) dari Tempurung', slug: 'arang-aktif-tempurung',
    author: pub(4), wasteKind: 'tempurung', wasteLabel: 'Tempurung', product: 'Arang Aktif',
    excerpt: 'Produk bernilai ekspor tinggi untuk filtrasi air/udara, farmasi, dan industri kimia.',
    summary:
      'Arang aktif tempurung punya daya serap tinggi. Dibuat lewat karbonisasi lalu aktivasi (fisika dengan uap suhu tinggi, atau kimia dengan KOH). Mutu utama: bilangan iodin (SNI 06-3730-1995 min 750 mg/g), kadar air, dan kadar abu. Aktivasi uap ±800°C umumnya memberi hasil terbaik.',
    maturity: 'curated', difficulty: 'sulit', capitalTier: 'tinggi',
    minCapital: 14000000, estTime: '3–4 hari', tags: ['arang-aktif', 'activated-carbon', 'mutu', 'ekspor'],
    materials: [
      { name: 'Arang tempurung (hasil karbonisasi)', qty: '20 kg', tier: 'wajib', price: 60000 },
      { name: 'Tungku/retort aktivasi tahan suhu tinggi', qty: '1 unit', tier: 'mahal', price: 12000000 },
      { name: 'Generator uap (steam)', qty: '1 unit', tier: 'mahal', price: 2500000, note: 'Untuk aktivasi fisika' },
      { name: 'KOH/H₃PO₄ (aktivasi kimia)', qty: 'sesuai proses', tier: 'wajib', price: 80000, note: 'Alternatif jalur kimia' },
      { name: 'Air pencuci + bak penetral', qty: '1 set', tier: 'wajib', price: 150000 },
      { name: 'Ayakan mesh (sesuai pasar)', qty: '1 set', tier: 'wajib', price: 60000 },
    ],
    steps: [
      { order: 1, title: 'Karbonisasi', detail: 'Hasilkan arang dari tempurung di tungku tertutup.', temperature: '400–600°C' },
      { order: 2, title: 'Penghalusan & ukuran', detail: 'Hancurkan & ayak arang ke ukuran yang diinginkan (granular/mesh).' },
      { order: 3, title: 'Aktivasi (fisika)', detail: 'Alirkan uap panas ke arang pada suhu tinggi untuk membuka pori. Suhu ±800°C umumnya optimal.', temperature: '800–900°C', duration: '1–2 jam' },
      { order: 4, title: 'Aktivasi (kimia, opsi)', detail: 'Alternatif: rendam arang dalam KOH (mis. 5 M) ±24 jam sebelum dipanaskan.', dose: 'KOH 5 M, 24 jam' },
      { order: 5, title: 'Pencucian & penetralan', detail: 'Cuci dengan air hingga pH netral untuk membuang residu aktivator.' },
      { order: 6, title: 'Pengeringan & pengayakan', detail: 'Keringkan lalu sortir mesh sesuai permintaan pembeli.', duration: '1 hari' },
    ],
    quality: [
      { name: 'Bilangan iodin', target: '≥ 750 mg/g (SNI 06-3730-1995)', method: 'Titrasi iodin (lab)' },
      { name: 'Kadar air', target: '< 15% (terbaik ±1–4%)', method: 'Oven 105°C' },
      { name: 'Kadar abu', target: '< 10% (terbaik < 2,5%)', method: 'Pengabuan (lab)' },
      { name: 'Daya serap (aplikasi)', target: 'Sesuai uji filtrasi', method: 'Uji jernih air/MB' },
    ],
    safety: [
      { risk: 'Suhu sangat tinggi (>800°C)', mitigation: 'APD lengkap, isolasi panas, operator terlatih' },
      { risk: 'Bahan kimia aktivator (KOH/asam)', mitigation: 'Sarung tangan & kacamata tahan kimia, ruang berventilasi' },
      { risk: 'Limbah cair pencucian', mitigation: 'Netralkan & olah sebelum dibuang' },
    ],
    economic: { capital: 14000000, costPerBatch: 80000, batchInputKg: 20, batchOutputKg: 8, sellPricePerKg: 28000 },
    sources: ['SNI 06-3730-1995 — Arang Aktif Teknis', 'Spektrum Industri, Univ. Ahmad Dahlan (2014)', 'Repositori ETD UGM'],
    isBookmarked: false, replications: { success: 4, partial: 2, fail: 2 },
    variants: [{ id: 902, region: 'Sumatera', title: 'Varian aktivasi microwave (skala riset)' }],
    stats: { views: 690, saves: 95, replications: 8, successRate: 50 },
  },

  // ===================== TEMPURUNG → KERAJINAN (BARU) =====================
  {
    id: 9, title: 'Kerajinan Batok Kelapa: Mangkok, Lampu Hias & Aksesori', slug: 'kerajinan-tempurung-kelapa',
    author: pub(3), wasteKind: 'tempurung', wasteLabel: 'Tempurung', product: 'Kerajinan',
    excerpt: 'Sulap batok kelapa jadi produk kriya bernilai seni tinggi — modal kecil, margin besar, ramah lingkungan.',
    summary:
      'Kerajinan batok memanfaatkan tempurung utuh/pecahan menjadi mangkok, gelas, sendok, kancing, lampu hias, hingga tas. Prosesnya padat keterampilan & finishing: desain, pemotongan dengan gerinda (bukan parang agar tak pecah), pengamplasan bertahap, perakitan, lalu pemernisan agar mengkilap & tahan lama.',
    maturity: 'curated', difficulty: 'mudah', capitalTier: 'rendah',
    minCapital: 500000, estTime: '2–3 hari', tags: ['kerajinan', 'kriya', 'dekorasi', 'eco', 'UMKM'],
    materials: [
      { name: 'Tempurung kelapa tua (utuh/pecahan)', qty: '20 butir', tier: 'wajib', price: 10000, note: 'Pilih yang tebal & mulus' },
      { name: 'Gerinda + mata potong', qty: '1 unit', tier: 'wajib', price: 250000, note: 'Untuk memotong rapi tanpa pecah' },
      { name: 'Amplas kasar–halus (80–1000)', qty: '1 set', tier: 'wajib', price: 30000 },
      { name: 'Bor & mata bor', qty: '1 unit', tier: 'murah', price: 180000, note: 'Untuk lubang lampu/rakitan' },
      { name: 'Pernis/vernis kayu (food-grade utk wadah)', qty: '1 kaleng', tier: 'wajib', price: 45000 },
      { name: 'Lem kayu / fitting lampu / aksesori', qty: 'sesuai produk', tier: 'wajib', price: 60000 },
    ],
    steps: [
      { order: 1, title: 'Desain & seleksi', detail: 'Tentukan produk (mangkok/lampu/kancing) lalu pilih batok sesuai bentuk & ketebalan.' },
      { order: 2, title: 'Pembersihan', detail: 'Bersihkan sisa sabut & serabut yang menempel pada batok.' },
      { order: 3, title: 'Pemotongan', detail: 'Potong/bentuk batok dengan gerinda. Hindari parang/pisau pada poros agar tidak pecah.' },
      { order: 4, title: 'Pengamplasan bertahap', detail: 'Amplas dari kasar ke halus hingga permukaan rata & licin (luar & dalam).' },
      { order: 5, title: 'Perakitan / pengeboran', detail: 'Bor pola/lubang (untuk lampu hias), rakit komponen dengan lem/fitting.' },
      { order: 6, title: 'Finishing pernis', detail: 'Lapisi dengan pernis agar mengkilap, warna alami menonjol, & tahan air.', dose: '1–2 lapis tipis' },
      { order: 7, title: 'Penjemuran & QC', detail: 'Jemur hingga pernis kering sempurna, lalu periksa kehalusan & kerapian.' },
    ],
    quality: [
      { name: 'Kehalusan permukaan', target: 'Rata, tidak berserat/tajam', method: 'Raba & inspeksi visual' },
      { name: 'Kerapian potongan', target: 'Simetris, tidak retak', method: 'Inspeksi visual' },
      { name: 'Daya tahan finishing', target: 'Pernis merata, tidak lengket', method: 'Uji gores ringan & lap' },
      { name: 'Keamanan pangan (wadah)', target: 'Pernis food-grade', method: 'Cek sertifikasi bahan' },
    ],
    safety: [
      { risk: 'Serpihan & debu batok saat menggerinda', mitigation: 'Kacamata pelindung + masker' },
      { risk: 'Mata gerinda/bor berputar', mitigation: 'Pegang erat, gunakan klem, jauhkan jari' },
      { risk: 'Uap pernis/pelarut', mitigation: 'Kerjakan di ruang berventilasi, jauh dari api' },
    ],
    economic: { capital: 500000, costPerBatch: 70000, batchInputKg: 20, batchOutputKg: 15, sellPricePerKg: 35000, },
    sources: ['Jurnal Pendidikan Seni Rupa, Undiksha', 'Eprints UNM — Kerajinan Tempurung Kelapa', 'Prosiding SNBK (BBKB)'],
    isBookmarked: false, replications: { success: 7, partial: 1, fail: 0 },
    variants: [{ id: 903, region: 'Bali', title: 'Varian kancing & aksesori batik batok' }],
    stats: { views: 540, saves: 102, replications: 8, successRate: 88 },
  },

  // ===================== AIR → NATA DE COCO =====================
  {
    id: 5, title: 'Nata de Coco dari Air Kelapa', slug: 'nata-de-coco',
    author: pub(3), wasteKind: 'air', wasteLabel: 'Air Kelapa', product: 'Nata de Coco',
    excerpt: 'Fermentasi air kelapa menjadi pangan kaya serat bernilai tambah tinggi — bahan minuman & dessert.',
    summary:
      'Nata de coco adalah selulosa hasil bakteri Acetobacter xylinum memfermentasi air kelapa. Kunci sukses: media bersih, takaran tepat (gula ±2,5%, ZA 0,5%, asam asetat hingga pH ±4,2), starter aktif, dan ruang fermentasi tenang 28–31°C selama 7–8 hari hingga tebal 1,5–2 cm.',
    maturity: 'validated', difficulty: 'sedang', capitalTier: 'rendah',
    minCapital: 700000, estTime: '8–10 hari', tags: ['nata', 'pangan', 'fermentasi', 'serat'],
    materials: [
      { name: 'Air kelapa segar (disaring)', qty: '50 liter', tier: 'wajib', price: 0, note: 'Limbah industri santan/kelapa parut' },
      { name: 'Starter Acetobacter xylinum', qty: '5 liter (±10%)', tier: 'wajib', price: 50000 },
      { name: 'Gula pasir', qty: '1,25 kg (≈2,5%)', tier: 'wajib', price: 18000 },
      { name: 'ZA / amonium sulfat (food-grade)', qty: '250 g (≈0,5%)', tier: 'wajib', price: 10000, note: 'Sumber nitrogen' },
      { name: 'Asam asetat / cuka', qty: 'secukupnya', tier: 'wajib', price: 12000, note: 'Atur pH ke ±4,2' },
      { name: 'Nampan fermentasi + koran/penutup', qty: '25 pcs', tier: 'wajib', price: 250000 },
      { name: 'Panci & kompor', qty: '1 set', tier: 'murah', price: 350000 },
    ],
    steps: [
      { order: 1, title: 'Penyaringan & perebusan', detail: 'Saring air kelapa, lalu didihkan untuk mensterilkan media.', duration: '20–30 menit', temperature: 'mendidih' },
      { order: 2, title: 'Penambahan nutrisi', detail: 'Saat mendidih, tambahkan gula & ZA, aduk hingga larut homogen.', dose: 'gula 2,5% + ZA 0,5%' },
      { order: 3, title: 'Pengaturan pH', detail: 'Tambahkan asam asetat hingga pH ±4,2 (optimum 3,5–4,5).', dose: 'pH 4,2' },
      { order: 4, title: 'Penuangan & pendinginan', detail: 'Tuang media ke nampan steril, tutup koran, dinginkan hingga suhu ruang.' },
      { order: 5, title: 'Inokulasi starter', detail: 'Tambahkan starter ±10%, tutup rapat. Jangan digerakkan/digeser.', dose: 'starter ±10% volume' },
      { order: 6, title: 'Fermentasi', detail: 'Diamkan di ruang bersih, tenang, & gelap. Lapisan nata mulai terbentuk setelah ±24 jam.', duration: '7–8 hari', temperature: '28–31°C' },
      { order: 7, title: 'Pemanenan & netralisasi', detail: 'Panen lembaran nata (tebal 1,5–2 cm), cuci, potong dadu, rebus berulang untuk menghilangkan asam.' },
    ],
    quality: [
      { name: 'Ketebalan nata', target: '1,5–2 cm', method: 'Ukur penggaris' },
      { name: 'pH media awal', target: '4,2 (3,5–4,5)', method: 'pH meter / kertas pH' },
      { name: 'Kebersihan', target: 'Bebas jamur & lendir asing', method: 'Inspeksi visual/aroma' },
      { name: 'Tekstur', target: 'Kenyal, padat, putih bening', method: 'Uji potong' },
    ],
    safety: [
      { risk: 'Kontaminasi jamur', mitigation: 'Sterilisasi alat & ruang, tangan/penutup bersih' },
      { risk: 'Asam asetat pekat', mitigation: 'Hindari kontak mata & kulit, encerkan hati-hati' },
      { risk: 'Air panas mendidih', mitigation: 'Sarung tangan tahan panas saat menuang' },
    ],
    economic: { capital: 700000, costPerBatch: 40000, batchInputKg: 50, batchOutputKg: 10, sellPricePerKg: 15000 },
    sources: ['Jurnal BIOMA, Univ. Sulawesi Barat', 'MUI — Titik Kritis Nata de Coco', 'Prosiding Semnas Biologi UNP'],
    isBookmarked: true, replications: { success: 11, partial: 2, fail: 2 },
    variants: [], stats: { views: 980, saves: 160, replications: 15, successRate: 73 },
  },

  // ===================== AIR → CUKA =====================
  {
    id: 6, title: 'Cuka Organik dari Air Kelapa (Fermentasi 2 Tahap)', slug: 'cuka-air-kelapa',
    author: pub(4), wasteKind: 'air', wasteLabel: 'Air Kelapa', product: 'Cuka',
    excerpt: 'Fermentasi dua tahap mengubah air kelapa menjadi cuka organik alami untuk pangan & kesehatan.',
    summary:
      'Cuka air kelapa dibuat dua tahap: gula difermentasi ragi (Saccharomyces) menjadi alkohol, lalu alkohol diubah bakteri asam asetat (Acetobacter aceti) menjadi cuka. Karena gula air kelapa rendah (±1%), perlu pengkayaan gula hingga ±15%. Mutu ditentukan kadar asam asetat (≥4% untuk cuka makan).',
    maturity: 'curated', difficulty: 'sedang', capitalTier: 'rendah',
    minCapital: 250000, estTime: '21–28 hari', tags: ['cuka', 'vinegar', 'fermentasi', 'organik'],
    materials: [
      { name: 'Air kelapa', qty: '20 liter', tier: 'wajib', price: 0 },
      { name: 'Gula pasir/gula merah', qty: '3 kg', tier: 'wajib', price: 36000, note: 'Pengkayaan gula hingga ±15%' },
      { name: 'Ragi roti (Saccharomyces cerevisiae)', qty: '20 g', tier: 'wajib', price: 8000 },
      { name: 'Starter cuka (mother of vinegar / Acetobacter)', qty: '1 liter', tier: 'wajib', price: 15000 },
      { name: 'ZA / amonium sulfat', qty: '20 g', tier: 'murah', price: 5000, note: 'Nutrisi fermentasi' },
      { name: 'Wadah kaca/keramik + kain saring', qty: '2 pcs', tier: 'wajib', price: 130000 },
    ],
    steps: [
      { order: 1, title: 'Pengkayaan gula & pasteurisasi', detail: 'Larutkan gula ke air kelapa hingga ±15% gula, tambahkan ZA, pasteurisasi lalu dinginkan.', dose: 'gula ±15%' },
      { order: 2, title: 'Fermentasi alkohol', detail: 'Tambahkan ragi, tutup wadah (anaerob), diamkan hingga terbentuk alkohol.', duration: '5–7 hari', temperature: '28–32°C' },
      { order: 3, title: 'Aerasi & inokulasi cuka', detail: 'Tambahkan mother of vinegar, tutup dengan kain (butuh oksigen) agar alkohol jadi asam asetat.', duration: '14–21 hari' },
      { order: 4, title: 'Pemantauan keasaman', detail: 'Cek keasaman berkala hingga mencapai target kadar asam asetat.', dose: 'asam asetat ≥ 4%' },
      { order: 5, title: 'Penyaringan & pasteurisasi', detail: 'Saring jernih, pasteurisasi ringan untuk menghentikan fermentasi, lalu botolkan.' },
    ],
    quality: [
      { name: 'Kadar asam asetat', target: '≥ 4% (cuka makan)', method: 'Titrasi asam-basa (lab)' },
      { name: 'Keasaman (pH)', target: '±2,5–3,5', method: 'pH meter' },
      { name: 'Kejernihan & aroma', target: 'Jernih, aroma cuka khas', method: 'Inspeksi visual/aroma' },
    ],
    safety: [
      { risk: 'Kontaminasi mikroba liar', mitigation: 'Wadah & alat steril, kontrol pH' },
      { risk: 'Tekanan gas fermentasi alkohol', mitigation: 'Gunakan airlock / tutup tidak rapat penuh' },
      { risk: 'Higienitas pangan', mitigation: 'Bahan & wadah food-grade, tangan bersih' },
    ],
    economic: { capital: 250000, costPerBatch: 18000, batchInputKg: 20, batchOutputKg: 15, sellPricePerKg: 12000 },
    sources: ['Jurnal Teknologi Pertanian UB (Irnia & Nur Hidayat)', 'BPTP Sulawesi Barat — Pengolahan Air Kelapa Jadi Cuka'],
    isBookmarked: false, replications: { success: 4, partial: 1, fail: 1 },
    variants: [], stats: { views: 320, saves: 41, replications: 6, successRate: 66 },
  },

  // ===================== AMPAS → TEPUNG =====================
  {
    id: 7, title: 'Tepung Ampas Kelapa Tinggi Serat (Pangan Fungsional)', slug: 'tepung-ampas-kelapa',
    author: pub(3), wasteKind: 'ampas', wasteLabel: 'Ampas', product: 'Tepung',
    excerpt: 'Ampas sisa santan menjadi tepung tinggi serat & rendah karbo — bahan kue sehat, gluten-free.',
    summary:
      'Tepung ampas kelapa kaya serat kasar (±37–40%) & relatif rendah lemak, cocok untuk produk diet/gluten-free. Proses inti: pengeringan terkontrol 60–70°C, penepungan, lalu pengayakan 80 mesh. Kunci umur simpan adalah kadar air rendah & kemasan kedap udara.',
    maturity: 'standard', difficulty: 'mudah', capitalTier: 'rendah',
    minCapital: 900000, estTime: '1 hari', tags: ['tepung', 'pangan', 'serat', 'gluten-free'],
    materials: [
      { name: 'Ampas kelapa segar', qty: '20 kg', tier: 'wajib', price: 0, note: 'Hasil samping santan, olah segera agar tak tengik' },
      { name: 'Oven/pengering (cabinet dryer)', qty: '1 unit', tier: 'murah', price: 700000 },
      { name: 'Mesin penepung (disk mill)', qty: '1 unit', tier: 'murah', price: 250000 },
      { name: 'Ayakan 80 mesh', qty: '1 pcs', tier: 'wajib', price: 35000 },
      { name: 'Kemasan kedap udara + silica gel', qty: '1 rol', tier: 'wajib', price: 40000 },
    ],
    steps: [
      { order: 1, title: 'Sortasi & pemerasan', detail: 'Pilih ampas bersih, peras sisa santan/minyak agar tidak mudah tengik.' },
      { order: 2, title: 'Pengeringan', detail: 'Keringkan tipis-merata hingga kadar air rendah. Suhu 60–70°C menjaga warna & aroma.', temperature: '60–70°C', duration: '4–6 jam' },
      { order: 3, title: 'Penepungan', detail: 'Giling ampas kering menjadi tepung dengan disk mill.' },
      { order: 4, title: 'Pengayakan', detail: 'Ayak 80 mesh untuk tekstur halus & seragam; giling ulang yang kasar.' },
      { order: 5, title: 'Pengemasan', detail: 'Kemas kedap udara + silica gel, beri tanggal & info gizi (klaim tinggi serat).' },
    ],
    quality: [
      { name: 'Kadar air', target: '< 5% (riset ±3%)', method: 'Oven 105°C / moisture meter' },
      { name: 'Kehalusan', target: 'Lolos 80 mesh', method: 'Ayakan standar' },
      { name: 'Serat kasar', target: 'Tinggi (±37–40%)', method: 'Analisis proksimat (lab)' },
      { name: 'Aroma & warna', target: 'Khas kelapa, tidak tengik', method: 'Uji organoleptik' },
    ],
    safety: [
      { risk: 'Panas oven', mitigation: 'Sarung tangan tahan panas' },
      { risk: 'Ketengikan (rancidity)', mitigation: 'Peras minyak, keringkan cepat, kemas kedap udara' },
      { risk: 'Higienitas pangan', mitigation: 'Alat food-grade, area bersih, hindari kontaminasi silang' },
    ],
    economic: { capital: 900000, costPerBatch: 18000, batchInputKg: 20, batchOutputKg: 5, sellPricePerKg: 20000 },
    sources: ['Jurnal Pengolahan Pangan, Unisa Palu', 'Jurnal Industri Pertanian, Untirta', 'Analisis proksimat tepung ampas kelapa'],
    isBookmarked: false, replications: { success: 20, partial: 2, fail: 0 },
    variants: [{ id: 904, region: 'Jawa Timur', title: 'Varian sangrai tanpa oven' }],
    stats: { views: 1510, saves: 280, replications: 22, successRate: 91 },
  },

  // ===================== SABUT → POT SABUT =====================
  {
    id: 8, title: 'Pot Biodegradable dari Sabut (Cocopot)', slug: 'pot-sabut-cocopot',
    author: pub(3), wasteKind: 'sabut', wasteLabel: 'Sabut', product: 'Pot Sabut',
    excerpt: 'Pot organik yang bisa langsung ditanam & terurai jadi pupuk — favorit pembibitan & urban farming.',
    summary:
      'Cocopot dibuat dari campuran serat & gabus sabut dengan perekat alami (lateks), dicetak-tekan lalu dikeringkan. Keunggulan jualnya: biodegradable (terurai < 6 bulan) sehingga bibit bisa ditanam tanpa membuka pot, mengurangi stres akar.',
    maturity: 'curated', difficulty: 'mudah', capitalTier: 'rendah',
    minCapital: 400000, estTime: '2 hari', tags: ['pot', 'eco', 'pembibitan', 'biodegradable'],
    materials: [
      { name: 'Serat & gabus sabut', qty: '5 kg', tier: 'wajib', price: 5000 },
      { name: 'Lateks/perekat alami', qty: '1 kg', tier: 'wajib', price: 28000, note: 'Bisa pakai pati/tepung sebagai alternatif' },
      { name: 'Cetakan pot (jantan-betina)', qty: '1 set', tier: 'murah', price: 320000 },
      { name: 'Alat press manual', qty: '1 unit', tier: 'murah', price: 250000, note: 'Opsional untuk kepadatan' },
    ],
    steps: [
      { order: 1, title: 'Penyiapan bahan', detail: 'Campur serat & gabus sabut dengan komposisi seimbang agar pot kuat namun berpori.' },
      { order: 2, title: 'Pencampuran perekat', detail: 'Aduk campuran sabut dengan perekat alami hingga merata & lengket.' },
      { order: 3, title: 'Pencetakan', detail: 'Tekan campuran ke cetakan; padatkan agar dinding pot rapi & kokoh.' },
      { order: 4, title: 'Pengeringan', detail: 'Jemur/keringkan hingga pot mengeras & set.', duration: '1–2 hari', temperature: 'matahari' },
      { order: 5, title: 'QC & finishing', detail: 'Periksa kekuatan dinding & kerapian; rapikan tepi.' },
    ],
    quality: [
      { name: 'Kekuatan dinding', target: 'Tidak mudah sobek saat dipegang/diisi', method: 'Uji tekan tangan & isi media' },
      { name: 'Porositas', target: 'Air bisa merembes (drainase baik)', method: 'Uji siram' },
      { name: 'Biodegradabilitas', target: 'Terurai < 6 bulan', method: 'Uji tanam di tanah' },
    ],
    safety: [
      { risk: 'Debu sabut', mitigation: 'Masker saat mengurai/mencampur' },
      { risk: 'Perekat sintetis (jika dipakai)', mitigation: 'Pilih perekat alami/food-safe, ventilasi cukup' },
    ],
    economic: { capital: 400000, costPerBatch: 18000, batchInputKg: 5, batchOutputKg: 2.5, sellPricePerKg: 22000 },
    sources: ['Praktik UMKM Sukabumi', 'Riset pot biodegradable sabut kelapa'],
    isBookmarked: false, replications: { success: 5, partial: 1, fail: 0 },
    variants: [], stats: { views: 430, saves: 88, replications: 6, successRate: 83 },
  },

  // ===================== AMPAS → PAKAN TERNAK (BARU) =====================
  {
    id: 10, title: 'Pakan Ternak Fermentasi dari Ampas Kelapa', slug: 'pakan-ternak-ampas-kelapa',
    author: pub(4), wasteKind: 'ampas', wasteLabel: 'Ampas', product: 'Pakan Ternak',
    excerpt: 'Fermentasi ampas kelapa dengan probiotik menaikkan protein hingga ~2×, jadi pakan murah & sehat.',
    summary:
      'Ampas kelapa difermentasi dengan probiotik (EM4/molase) secara anaerob untuk memecah serat, menaikkan kandungan protein (riset: 11% → 26%), serta menghilangkan bau & memperpanjang umur simpan. Cocok untuk pakan ayam kampung, bebek, kambing, dan ikan — menekan biaya pakan pabrikan.',
    maturity: 'validated', difficulty: 'mudah', capitalTier: 'rendah',
    minCapital: 150000, estTime: '12–15 hari', tags: ['pakan', 'ternak', 'fermentasi', 'probiotik', 'EM4'],
    materials: [
      { name: 'Ampas kelapa segar', qty: '20 kg', tier: 'wajib', price: 0, note: 'Hasil samping santan/parutan' },
      { name: 'Probiotik EM4 Peternakan', qty: '100 ml', tier: 'wajib', price: 25000 },
      { name: 'Molase / gula merah', qty: '0,5 kg', tier: 'wajib', price: 12000, note: 'Sumber energi bakteri' },
      { name: 'Dedak/bekatul (penyeimbang)', qty: '2 kg', tier: 'murah', price: 10000, note: 'Opsional, menambah nutrisi' },
      { name: 'Drum/wadah kedap udara + beban', qty: '1 unit', tier: 'wajib', price: 90000, note: 'Kondisi anaerob penting' },
    ],
    steps: [
      { order: 1, title: 'Pembuatan larutan probiotik', detail: 'Larutkan EM4 + molase dalam air, diamkan agar bakteri aktif.', dose: 'EM4 + molase dalam ±2 L air', duration: '10–15 menit' },
      { order: 2, title: 'Pencampuran', detail: 'Basahi ampas (campur dedak bila perlu) dengan larutan probiotik hingga lembap merata (tidak becek).', dose: 'kelembapan ±40–50%' },
      { order: 3, title: 'Pemadatan anaerob', detail: 'Masukkan ke drum, padatkan, beri beban di atas & tutup rapat agar tanpa oksigen.' },
      { order: 4, title: 'Fermentasi', detail: 'Simpan di tempat teduh. Penguraian serat optimal pada 12–15 hari (mulai harum & hangat = proses berjalan).', duration: '12–15 hari', temperature: 'suhu ruang teduh' },
      { order: 5, title: 'Pemanenan & pemberian', detail: 'Buka wadah; pakan beraroma asam-harum & tidak berjamur. Angin-anginkan sebentar lalu berikan ke ternak.' },
    ],
    quality: [
      { name: 'Aroma', target: 'Asam-harum (fermentasi), tidak busuk', method: 'Uji aroma' },
      { name: 'Bebas jamur', target: 'Tidak ada jamur/lendir', method: 'Inspeksi visual' },
      { name: 'Kandungan protein', target: 'Naik signifikan (riset ±26%)', method: 'Analisis proksimat (lab)' },
      { name: 'Kelembapan', target: '±40–50% (tidak becek)', method: 'Uji genggam' },
    ],
    safety: [
      { risk: 'Pakan gagal (busuk) bila bocor udara', mitigation: 'Pastikan wadah benar-benar kedap & padat (anaerob)' },
      { risk: 'Kontaminasi jamur jika kelembapan salah', mitigation: 'Jaga kelembapan ±40–50%, alat bersih' },
      { risk: 'Gas fermentasi', mitigation: 'Buka wadah di area berventilasi' },
    ],
    economic: { capital: 150000, costPerBatch: 47000, batchInputKg: 20, batchOutputKg: 20, sellPricePerKg: 4000 },
    sources: ['Distan Prov. Bangka Belitung — Ampas Kelapa Fermentasi', 'JANHUS, Univ. Garut (dosis EM4)', 'Praktik peternak ayam kampung'],
    isBookmarked: false, replications: { success: 10, partial: 1, fail: 1 },
    variants: [{ id: 905, region: 'Jawa Tengah', title: 'Varian + ampas tahu untuk protein lebih tinggi' }],
    stats: { views: 760, saves: 121, replications: 12, successRate: 84 },
  },
]

// Seed selalu berstatus published; kontribusi baru akan berstatus submitted (menunggu kurasi).
export const blueprintsFull: BlueprintFull[] = blueprintSeeds.map((b) => ({
  ...b,
  status: 'published' as const,
  versions: makeVersions(b),
}))
