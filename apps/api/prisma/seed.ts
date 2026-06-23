import { PrismaClient } from '@prisma/client'
import { env } from '../src/env.js'
import { hashPassword } from '../src/lib/password.js'

const prisma = new PrismaClient()

const ROLES = ['guest', 'user', 'moderator', 'admin']

const VALUE_NODES = [
  { id: 1, parentId: null, type: 'root', name: 'Kelapa', slug: 'kelapa', icon: 'palmtree' },
  { id: 10, parentId: 1, type: 'waste', name: 'Sabut', slug: 'sabut', icon: 'layers' },
  { id: 11, parentId: 1, type: 'waste', name: 'Tempurung', slug: 'tempurung', icon: 'shell' },
  { id: 12, parentId: 1, type: 'waste', name: 'Air Kelapa', slug: 'air', icon: 'droplets' },
  { id: 13, parentId: 1, type: 'waste', name: 'Ampas', slug: 'ampas', icon: 'wheat' },
  { id: 100, parentId: 10, type: 'product', name: 'Cocopeat', slug: 'cocopeat', icon: 'sprout' },
  { id: 101, parentId: 10, type: 'product', name: 'Cocofiber', slug: 'cocofiber', icon: 'brush' },
  { id: 102, parentId: 10, type: 'product', name: 'Pot Sabut', slug: 'pot-sabut', icon: 'flower-2' },
  { id: 110, parentId: 11, type: 'product', name: 'Briket', slug: 'briket', icon: 'flame' },
  { id: 111, parentId: 11, type: 'product', name: 'Arang Aktif', slug: 'arang-aktif', icon: 'filter' },
  { id: 112, parentId: 11, type: 'product', name: 'Kerajinan', slug: 'kerajinan', icon: 'palette' },
  { id: 120, parentId: 12, type: 'product', name: 'Nata de Coco', slug: 'nata-de-coco', icon: 'cherry' },
  { id: 121, parentId: 12, type: 'product', name: 'Cuka', slug: 'cuka', icon: 'flask-conical' },
  { id: 130, parentId: 13, type: 'product', name: 'Tepung', slug: 'tepung', icon: 'cookie' },
  { id: 131, parentId: 13, type: 'product', name: 'Pakan Ternak', slug: 'pakan', icon: 'beef' },
]

const DEMO_USERS = [
  { email: 'moderator@coconexus.test', password: 'Mod#1234', role: 'moderator', displayName: 'Rina Salsabila', jobTitle: 'Content Moderator' },
  { email: 'user@coconexus.test', password: 'User#1234', role: 'user', displayName: 'Budi Santoso', jobTitle: 'Pemilik UMKM' },
  { email: 'siti@coconexus.test', password: 'User#1234', role: 'user', displayName: 'Siti Marwah', jobTitle: 'Pengrajin' },
]

const dAgo = (d: number) => new Date(Date.now() - d * 86_400_000)

const BLUEPRINTS = [
  {
    slug: 'briket-arang-tempurung', title: 'Briket Arang dari Tempurung Kelapa', authorEmail: 'siti@coconexus.test',
    wasteKind: 'tempurung', wasteLabel: 'Tempurung', product: 'Briket',
    excerpt: 'Ubah tempurung kelapa menjadi briket arang bernilai jual dengan modal kecil.',
    maturity: 'validated', difficulty: 'sedang', capitalTier: 'rendah', minCapital: 200000, estTime: '3 hari',
    tags: ['briket', 'energi', 'arang'], sources: ['Kementerian Pertanian RI (2024)'],
    economic: { capital: 200000, costPerBatch: 8000, batchInputKg: 10, batchOutputKg: 3, sellPricePerKg: 9000 },
    materials: [
      { name: 'Tempurung kelapa kering', qty: '10 kg', tier: 'wajib', price: 5000, note: 'kadar air < 15%' },
      { name: 'Drum karbonisasi bekas', qty: '1 unit', tier: 'murah', price: 150000 },
      { name: 'Tepung tapioka (perekat)', qty: '0,5 kg (5%)', tier: 'wajib', price: 8000 },
    ],
    steps: [
      { order: 1, title: 'Karbonisasi', detail: 'Bakar tempurung dalam drum tertutup hingga menjadi arang.', duration: '±2 jam', temperature: '300–500°C' },
      { order: 2, title: 'Penggilingan', detail: 'Giling arang hingga serbuk halus.', duration: '30 menit' },
      { order: 3, title: 'Pencampuran perekat', detail: 'Campur serbuk arang dengan larutan tapioka.', dose: 'tapioka 5% + air' },
      { order: 4, title: 'Pencetakan & pengeringan', detail: 'Cetak lalu jemur hingga kadar air di bawah 8%.', duration: '2–3 hari' },
    ],
    quality: [{ name: 'Kadar air', target: '< 8%', method: 'Timbang sebelum & sesudah oven' }, { name: 'Nyala', target: 'Stabil, asap minim', method: 'Uji bakar' }],
    safety: [{ risk: 'Asap karbon monoksida (CO)', mitigation: 'Karbonisasi di ruang berventilasi' }, { risk: 'Panas tinggi', mitigation: 'Gunakan sarung tangan' }],
    reports: [
      { authorEmail: 'user@coconexus.test', outcome: 'success', note: 'Berhasil! Briket nyala stabil. Pakai drum bekas.', costReal: 230000, photoSeed: 'briket-budi', daysAgo: 6 },
      { authorEmail: 'siti@coconexus.test', outcome: 'partial', note: 'Agak rapuh, tapioka kurang. Coba 6%.', costReal: 210000, photoSeed: 'briket-siti', daysAgo: 3 },
    ],
    versions: [{ version: 1, changelog: 'Versi awal dipublikasikan.', authorName: 'Siti Marwah', daysAgo: 40 }, { version: 2, changelog: 'Penyempurnaan takaran perekat dari masukan komunitas.', authorName: 'Rina Salsabila', daysAgo: 12 }],
    variants: [{ region: 'Sulawesi', title: 'Varian tungku drum vertikal' }],
  },
  {
    slug: 'cocopeat-media-tanam', title: 'Cocopeat Media Tanam dari Sabut Kelapa', authorEmail: 'moderator@coconexus.test',
    wasteKind: 'sabut', wasteLabel: 'Sabut', product: 'Cocopeat',
    excerpt: 'Olah sabut menjadi cocopeat — media tanam yang diserap industri hortikultura.',
    maturity: 'validated', difficulty: 'mudah', capitalTier: 'menengah', minCapital: 3500000, estTime: '2 hari',
    tags: ['cocopeat', 'media-tanam', 'ekspor'], sources: ['Balai Penelitian Tanaman Palma (2023)'],
    economic: { capital: 3500000, costPerBatch: 20000, batchInputKg: 100, batchOutputKg: 35, sellPricePerKg: 2500 },
    materials: [
      { name: 'Sabut kelapa kering', qty: '100 kg', tier: 'wajib', price: 30000 },
      { name: 'Mesin pengurai (decorticator)', qty: '1 unit', tier: 'mahal', price: 3500000 },
      { name: 'Ayakan getar', qty: '1 unit', tier: 'wajib', price: 250000 },
    ],
    steps: [
      { order: 1, title: 'Pengeringan sabut', detail: 'Keringkan sabut hingga kadar air < 15%.', duration: '1 hari' },
      { order: 2, title: 'Penguraian', detail: 'Urai sabut dengan decorticator, pisahkan serat & gabus.', duration: '2 jam' },
      { order: 3, title: 'Pengayakan & kemas', detail: 'Ayak cocopeat lalu kemas curah atau blok.' },
    ],
    quality: [{ name: 'Kadar air', target: '15–20%', method: 'Timbang sampel' }, { name: 'EC (garam)', target: '< 1.0 mS/cm', method: 'EC meter' }],
    safety: [{ risk: 'Debu serat halus', mitigation: 'Pakai masker' }, { risk: 'Mesin berputar', mitigation: 'SOP operasi mesin' }],
    reports: [{ authorEmail: 'siti@coconexus.test', outcome: 'success', note: 'Cocopeat halus, EC rendah. Laku ke pembibitan.', costReal: 3600000, photoSeed: 'cocopeat-siti', daysAgo: 5 }],
    versions: [{ version: 1, changelog: 'Versi awal dipublikasikan.', authorName: 'Rina Salsabila', daysAgo: 40 }, { version: 2, changelog: 'Tambah catatan kontrol EC.', authorName: 'Rina Salsabila', daysAgo: 10 }],
    variants: [],
  },
  {
    slug: 'nata-de-coco', title: 'Nata de Coco dari Air Kelapa', authorEmail: 'user@coconexus.test',
    wasteKind: 'air', wasteLabel: 'Air Kelapa', product: 'Nata de Coco',
    excerpt: 'Fermentasi air kelapa menjadi pangan bernilai tambah tinggi.',
    maturity: 'validated', difficulty: 'sedang', capitalTier: 'rendah', minCapital: 500000, estTime: '8 hari',
    tags: ['nata', 'pangan', 'fermentasi'], sources: ['Jurnal Teknologi Pangan (2022)'],
    economic: { capital: 500000, costPerBatch: 25000, batchInputKg: 50, batchOutputKg: 8, sellPricePerKg: 15000 },
    materials: [
      { name: 'Air kelapa segar', qty: '50 liter', tier: 'wajib', price: 0, note: 'limbah industri kelapa' },
      { name: 'Starter Acetobacter xylinum', qty: '5 liter', tier: 'wajib', price: 20000 },
      { name: 'Nampan fermentasi', qty: '20 pcs', tier: 'wajib', price: 200000 },
    ],
    steps: [
      { order: 1, title: 'Penyaringan & perebusan', detail: 'Saring air kelapa lalu rebus.', duration: '30 menit' },
      { order: 2, title: 'Atur nutrisi & pH', detail: 'Tambah gula & atur pH dengan asam asetat.', dose: 'pH 4–4,5' },
      { order: 3, title: 'Inokulasi & fermentasi', detail: 'Tuang ke nampan + starter, diamkan di ruang tenang.', duration: '7 hari' },
      { order: 4, title: 'Pemanenan', detail: 'Panen lembaran nata, cuci & rebus untuk netralkan asam.' },
    ],
    quality: [{ name: 'Ketebalan', target: '> 1 cm', method: 'Ukur penggaris' }, { name: 'Kebersihan', target: 'Bebas jamur', method: 'Inspeksi visual' }],
    safety: [{ risk: 'Kontaminasi jamur', mitigation: 'Sterilisasi alat & ruang bersih' }],
    reports: [{ authorEmail: 'siti@coconexus.test', outcome: 'success', note: 'Nata tebal 1,5 cm. Kuncinya ruang tenang.', costReal: 480000, photoSeed: 'nata-siti', daysAgo: 4 }],
    versions: [{ version: 1, changelog: 'Versi awal dipublikasikan.', authorName: 'Budi Santoso', daysAgo: 40 }, { version: 2, changelog: 'Perjelas kontrol pH.', authorName: 'Rina Salsabila', daysAgo: 12 }],
    variants: [],
  },
  {
    slug: 'tepung-ampas-kelapa', title: 'Tepung Ampas Kelapa Pangan Fungsional', authorEmail: 'user@coconexus.test',
    wasteKind: 'ampas', wasteLabel: 'Ampas', product: 'Tepung',
    excerpt: 'Ampas kelapa menjadi tepung tinggi serat untuk produk pangan.',
    maturity: 'standard', difficulty: 'mudah', capitalTier: 'rendah', minCapital: 800000, estTime: '1 hari',
    tags: ['tepung', 'pangan'], sources: ['SNI Tepung; Jurnal Pangan Fungsional'],
    economic: { capital: 800000, costPerBatch: 12000, batchInputKg: 20, batchOutputKg: 5, sellPricePerKg: 18000 },
    materials: [
      { name: 'Ampas kelapa segar', qty: '20 kg', tier: 'wajib', price: 0 },
      { name: 'Oven/pengering', qty: '1 unit', tier: 'murah', price: 600000 },
      { name: 'Mesin penepung + ayakan 80 mesh', qty: '1 set', tier: 'murah', price: 230000 },
    ],
    steps: [
      { order: 1, title: 'Pengeringan', detail: 'Keringkan ampas hingga kadar air rendah.', temperature: '60–70°C', duration: '4 jam' },
      { order: 2, title: 'Penepungan & ayak', detail: 'Giling ampas kering lalu ayak halus.' },
      { order: 3, title: 'Pengemasan', detail: 'Kemas kedap udara + silica gel.' },
    ],
    quality: [{ name: 'Kadar air', target: '< 7%', method: 'Timbang sampel' }, { name: 'Kehalusan', target: 'Lolos 80 mesh', method: 'Ayakan standar' }],
    safety: [{ risk: 'Higienitas pangan', mitigation: 'Alat food-grade & bersih' }],
    reports: [{ authorEmail: 'siti@coconexus.test', outcome: 'success', note: 'Tepung halus, aroma kelapa kuat.', costReal: 750000, photoSeed: 'tepung-siti', daysAgo: 8 }],
    versions: [{ version: 1, changelog: 'Versi awal dipublikasikan.', authorName: 'Budi Santoso', daysAgo: 40 }, { version: 2, changelog: 'Standarisasi mesh & kadar air.', authorName: 'Rina Salsabila', daysAgo: 9 }],
    variants: [{ region: 'Jawa Timur', title: 'Varian sangrai tanpa oven' }],
  },
]

async function main() {
  console.log('🌱 Seeding…')

  // --- Esensial: roles ---
  for (const name of ROLES) await prisma.role.upsert({ where: { name }, update: {}, create: { name } })
  const roleId = Object.fromEntries((await prisma.role.findMany()).map((r) => [r.name, r.id]))

  // --- Esensial: admin dari .env ---
  if (env.ADMIN_PASSWORD === 'Admin#1234') console.warn('⚠ ADMIN_PASSWORD masih placeholder — ganti sebelum produksi!')
  await prisma.user.upsert({
    where: { email: env.ADMIN_EMAIL },
    update: {},
    create: {
      email: env.ADMIN_EMAIL,
      password: await hashPassword(env.ADMIN_PASSWORD),
      roleId: roleId.admin,
      emailVerified: true,
      profile: { create: { displayName: 'Andi Pratama', jobTitle: 'System Administrator' } },
    },
  })

  if (!env.SEED_DEMO) {
    console.log('✅ Seed esensial selesai (SEED_DEMO=false).')
    return
  }

  // --- Demo: users ---
  for (const u of DEMO_USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        password: await hashPassword(u.password),
        roleId: roleId[u.role],
        emailVerified: true,
        profile: { create: { displayName: u.displayName, jobTitle: u.jobTitle } },
      },
    })
  }
  const userId = Object.fromEntries((await prisma.user.findMany({ select: { id: true, email: true } })).map((u) => [u.email, u.id]))

  // --- Demo: value tree ---
  for (const n of VALUE_NODES) {
    await prisma.valueNode.upsert({ where: { id: n.id }, update: { name: n.name, slug: n.slug, icon: n.icon, type: n.type, parentId: n.parentId }, create: n })
  }

  // --- Demo: categories ---
  for (const c of ['Sabut Kelapa', 'Tempurung', 'Air Kelapa', 'Ampas Kelapa', 'Ekonomi Sirkular']) {
    const slug = c.toLowerCase().replace(/\s+/g, '-')
    await prisma.category.upsert({ where: { slug }, update: {}, create: { name: c, slug } })
  }

  // --- Demo: blueprints (skip bila sudah ada) ---
  for (const b of BLUEPRINTS) {
    if (await prisma.blueprint.findUnique({ where: { slug: b.slug } })) continue
    await prisma.blueprint.create({
      data: {
        title: b.title, slug: b.slug, authorId: userId[b.authorEmail], wasteKind: b.wasteKind, wasteLabel: b.wasteLabel,
        product: b.product, excerpt: b.excerpt, summary: b.excerpt, status: 'published', maturity: b.maturity,
        difficulty: b.difficulty, capitalTier: b.capitalTier, minCapital: b.minCapital, estTime: b.estTime,
        tags: b.tags, sources: b.sources, views: 200 + (b.minCapital % 500), saves: 50 + (b.minCapital % 90),
        economic: { create: b.economic },
        materials: { create: b.materials.map((m, i) => ({ ...m, sort: i })) },
        steps: { create: b.steps },
        quality: { create: b.quality },
        safety: { create: b.safety },
        reports: { create: b.reports.map((r) => ({ userId: userId[r.authorEmail], outcome: r.outcome, note: r.note, costReal: r.costReal, photoSeed: r.photoSeed, createdAt: dAgo(r.daysAgo) })) },
        versions: { create: b.versions.map((v) => ({ version: v.version, changelog: v.changelog, authorName: v.authorName, createdAt: dAgo(v.daysAgo) })) },
        variants: { create: b.variants },
      },
    })
  }

  // --- Demo: Tanya Pakar (Q&A) ---
  if ((await prisma.question.count()) === 0) {
    const bpBySlug = Object.fromEntries((await prisma.blueprint.findMany({ select: { id: true, slug: true, title: true } })).map((b) => [b.slug, b]))
    const QA = [
      {
        bpSlug: 'briket-arang-tempurung', userEmail: 'user@coconexus.test', solved: true,
        title: 'Bisakah karbonisasi pakai tungku tanah liat?',
        content: 'Saya belum punya drum, apakah tungku tanah liat tradisional bisa dipakai?',
        answers: [
          { userEmail: 'moderator@coconexus.test', content: 'Bisa, namun kontrol suhunya lebih sulit sehingga rendemen arang bisa turun. Untuk konsistensi mutu, drum tertutup tetap lebih disarankan.', votes: 9, isBest: true, isExpert: true },
          { userEmail: 'siti@coconexus.test', content: 'Saya pernah coba tungku, hasilnya lumayan tapi lebih boros bahan.', votes: 3, isBest: false, isExpert: false },
        ],
      },
      {
        bpSlug: 'nata-de-coco', userEmail: 'siti@coconexus.test', solved: false,
        title: 'Kenapa nata saya tipis dan berair?',
        content: 'Sudah fermentasi 7 hari tapi nata hanya tipis ~0,3 cm. Ada saran?',
        answers: [{ userEmail: 'moderator@coconexus.test', content: 'Umumnya karena pH belum tepat (idealnya 4–4,5) atau starter kurang aktif. Jangan sering menggoyang nampan.', votes: 6, isBest: false, isExpert: true }],
      },
      {
        bpSlug: null, userEmail: 'siti@coconexus.test', solved: false,
        title: 'Sabut basah perlu dijemur berapa lama sebelum diolah?',
        content: 'Di daerah saya sering hujan, sabut selalu lembap. Idealnya kadar air berapa?',
        answers: [{ userEmail: 'moderator@coconexus.test', content: 'Targetkan kadar air di bawah 15%. Penjemuran matahari penuh biasanya 1–2 hari; jika mendung gunakan oven sederhana.', votes: 4, isBest: false, isExpert: true }],
      },
    ]
    for (const q of QA) {
      const bp = q.bpSlug ? bpBySlug[q.bpSlug] : null
      await prisma.question.create({
        data: {
          blueprintId: bp?.id ?? null, blueprintTitle: bp?.title ?? null, userId: userId[q.userEmail], title: q.title, content: q.content, solved: q.solved,
          answers: { create: q.answers.map((a) => ({ userId: userId[a.userEmail], content: a.content, votes: a.votes, isBest: a.isBest, isExpert: a.isExpert })) },
        },
      })
    }
  }

  // ====================== DEMO DOMAIN LENGKAP ======================
  const catBySlug = Object.fromEntries((await prisma.category.findMany()).map((c) => [c.slug, c.id]))
  const hAgo = (h: number) => new Date(Date.now() - h * 3_600_000)
  const articleHtml = '<h2>Pendahuluan</h2><p>Pengalaman lapangan mengolah limbah kelapa menjadi produk bernilai. Artikel ini berbagi praktik dan pelajaran yang bisa langsung diterapkan UMKM.</p><h3>Inti</h3><ul><li>Konsistensi mutu</li><li>Kemitraan pembeli</li><li>Dokumentasi batch</li></ul><p>Semoga bermanfaat untuk komunitas.</p>'

  // ---- Templates ----
  if ((await prisma.contentTemplate.count()) === 0) {
    await prisma.contentTemplate.createMany({ data: [
      { name: 'Cara Membuat (Langkah Praktis)', content: '<h2>Pendahuluan</h2><p>{deskripsi}</p><h3>Alat & Bahan</h3><ul><li>{bahan}</li></ul><h2>Langkah</h2><ol><li>{langkah}</li></ol><h2>Hasil & Tips</h2><p>{hasil}</p>' },
      { name: 'Studi Kasus UMKM', content: '<h2>Latar</h2><p>{latar}</p><h2>Tantangan</h2><p>{tantangan}</p><h2>Solusi</h2><p>{solusi}</p><h2>Dampak</h2><p>{dampak}</p>' },
    ] })
  }

  // ---- Articles (Wawasan) + komentar + vote + bookmark ----
  if ((await prisma.article.count()) === 0) {
    const A = [
      { title: 'Kisah Saya Membangun UMKM Cocopeat', authorEmail: 'user@coconexus.test', cat: 'sabut-kelapa', status: 'published', tags: ['cerita', 'cocopeat'], days: 1 },
      { title: 'Strategi Pemasaran Briket ke Pasar Ekspor', authorEmail: 'siti@coconexus.test', cat: 'tempurung', status: 'published', tags: ['pemasaran', 'ekspor'], days: 3 },
      { title: 'Pelajaran dari Gagal Panen Nata de Coco', authorEmail: 'user@coconexus.test', cat: 'air-kelapa', status: 'published', tags: ['nata', 'pelajaran'], days: 5 },
      { title: 'Ekonomi Sirkular di Sentra Kelapa Desa', authorEmail: 'moderator@coconexus.test', cat: 'ekonomi-sirkular', status: 'published', tags: ['sirkular', 'desa'], days: 7 },
      { title: 'Tips Menjaga Mutu Tepung Ampas Kelapa', authorEmail: 'siti@coconexus.test', cat: 'ampas-kelapa', status: 'published', tags: ['tepung', 'mutu'], days: 9 },
      { title: 'Draft: Catatan Pemasaran via Marketplace', authorEmail: 'user@coconexus.test', cat: 'sabut-kelapa', status: 'submitted', tags: ['pemasaran'], days: 0 },
      { title: 'Eksperimen Pupuk dari Sabut (perlu revisi)', authorEmail: 'siti@coconexus.test', cat: 'sabut-kelapa', status: 'revision', tags: ['pupuk'], days: 0 },
    ]
    for (const a of A) {
      const slug = a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      await prisma.article.create({ data: {
        title: a.title, slug, authorId: userId[a.authorEmail], categoryId: catBySlug[a.cat], content: articleHtml,
        excerpt: 'Pengalaman & praktik lapangan mengolah limbah kelapa menjadi produk bernilai untuk UMKM.',
        status: a.status, tags: a.tags, views: 80 + a.days * 13, reviewNotes: a.status === 'revision' ? 'Mohon tambahkan takaran & sumber.' : null,
        publishedAt: a.status === 'published' ? hAgo(a.days * 24) : null,
      } })
    }
    const arts = await prisma.article.findMany({ where: { status: 'published' }, orderBy: { id: 'asc' } })
    const first = arts[0]
    if (first) {
      await prisma.comment.createMany({ data: [
        { articleId: first.id, userId: userId['siti@coconexus.test'], content: 'Inspiratif! Boleh tahu modal awalnya berapa?', status: 'approved', createdAt: hAgo(20) },
        { articleId: first.id, userId: userId['moderator@coconexus.test'], content: 'Terima kasih sudah berbagi, sangat membantu komunitas.', status: 'approved', createdAt: hAgo(8) },
        { articleId: first.id, userId: userId['siti@coconexus.test'], content: 'Izin share ke grup UMKM ya!', status: 'pending', createdAt: hAgo(3) },
      ] })
      await prisma.articleVote.createMany({ data: [
        { articleId: first.id, userId: userId['siti@coconexus.test'], type: 'like' },
        { articleId: first.id, userId: userId['moderator@coconexus.test'], type: 'like' },
      ] })
      await prisma.articleBookmark.create({ data: { articleId: first.id, userId: userId['user@coconexus.test'] } })
      const subm = await prisma.article.findFirst({ where: { status: 'submitted' } })
      const pend = await prisma.comment.findFirst({ where: { status: 'pending' } })
      await prisma.report.createMany({ data: [
        ...(pend ? [{ reporterId: userId['user@coconexus.test'], entityType: 'comment', entityId: pend.id, reason: 'spam', description: 'Promosi berulang.', preview: pend.content }] : []),
        ...(subm ? [{ reporterId: userId['moderator@coconexus.test'], entityType: 'article', entityId: subm.id, reason: 'misinformation', description: 'Klaim perlu verifikasi.', preview: subm.title }] : []),
      ] })
    }
  }

  // ---- Notifikasi (untuk Budi) ----
  if ((await prisma.notification.count()) === 0) {
    await prisma.notification.createMany({ data: [
      { userId: userId['user@coconexus.test'], type: 'article_approved', data: { message: 'Artikel "Kisah Saya Membangun UMKM Cocopeat" telah terbit.', link: '/dashboard/articles' } },
      { userId: userId['user@coconexus.test'], type: 'reply', data: { message: 'Rina Salsabila membalas komentar Anda.', link: '/articles/1' } },
      { userId: userId['user@coconexus.test'], type: 'badge_awarded', data: { message: 'Anda meraih lencana "Kontributor Pemula".', link: '/dashboard/profile' }, readAt: hAgo(48) },
    ] })
  }

  // ---- Forum ----
  if ((await prisma.forumTopic.count()) === 0) {
    const t1 = await prisma.forumTopic.create({ data: { userId: userId['user@coconexus.test'], title: 'Menjaga kualitas cocopeat saat musim hujan?', content: 'Saat hujan cocopeat sering lembap & berjamur. Tips penyimpanan?', category: 'Sabut Kelapa', isPinned: true } })
    await prisma.forumReply.createMany({ data: [
      { topicId: t1.id, userId: userId['moderator@coconexus.test'], content: 'Gunakan silica gel + palet kayu agar tidak kontak lantai.' },
      { topicId: t1.id, userId: userId['siti@coconexus.test'], content: 'Saya pakai oven pengering sederhana sebelum kemas.' },
    ] })
    await prisma.forumTopic.create({ data: { userId: userId['siti@coconexus.test'], title: 'Diskusi harga briket tempurung 2026', content: 'Yuk bahas tren harga briket ekspor tahun ini.', category: 'Tempurung' } })
    await prisma.forumTopic.create({ data: { userId: userId['moderator@coconexus.test'], title: '[Terkunci] Aturan komunitas', content: 'Mohon baca aturan sebelum memposting.', category: 'Ekonomi Sirkular', isPinned: true, isLocked: true } })
  }

  // ---- System settings + menu ----
  for (const [k, v] of Object.entries({ site_name: 'COCONEXUS', site_description: 'Platform manajemen pengetahuan limbah kelapa untuk UMKM.', posts_per_page: '20', maintenance_mode: 'false', favicon: '/favicon.svg', site_logo: '' })) {
    await prisma.systemSetting.upsert({ where: { key: k }, update: {}, create: { key: k, value: v } })
  }
  if ((await prisma.menuItem.count()) === 0) {
    await prisma.menuItem.createMany({ data: [
      { label: 'Beranda', url: '/', icon: 'home', sortOrder: 1 },
      { label: 'Cetak Biru', url: '/cetak-biru', icon: 'wrench', sortOrder: 2 },
      { label: 'Pohon Nilai', url: '/pohon-nilai', icon: 'network', sortOrder: 3 },
      { label: 'Wawasan', url: '/articles', icon: 'file-text', sortOrder: 4 },
    ] })
  }

  // ---- Audit logs ----
  if ((await prisma.auditLog.count()) === 0) {
    await prisma.auditLog.createMany({ data: [
      { userId: userId['moderator@coconexus.test'], action: 'article.approve', entityType: 'article', entityId: 1, description: 'Menyetujui artikel', ipAddress: '172.16.67.5', createdAt: hAgo(2) },
      { userId: userId['admin@coconexus.test'] ?? null, action: 'settings.update', entityType: 'system', description: 'Mengubah posts_per_page', ipAddress: '172.16.67.5', createdAt: hAgo(9) },
      { userId: userId['moderator@coconexus.test'], action: 'comment.reject', entityType: 'comment', entityId: 99, description: 'Menolak komentar spam', ipAddress: '172.16.67.5', createdAt: hAgo(26) },
    ].filter((x) => x.userId !== undefined) })
  }

  // ---- Bursa & Direktori ----
  if ((await prisma.wasteListing.count()) === 0) {
    const L = [
      { kind: 'surplus', material: 'Sabut kelapa', category: 'sabut', quantity: '500 kg/minggu', price: 'Rp300/kg', region: 'Jawa Barat', note: 'Sabut kering siap urai.', email: 'user@coconexus.test', umkm: 'Kelapa Jaya' },
      { kind: 'need', material: 'Tempurung kelapa', category: 'tempurung', quantity: '200 kg/minggu', price: 'Nego', region: 'Jawa Timur', note: 'Untuk produksi briket.', email: 'siti@coconexus.test', umkm: 'Briket Makmur' },
      { kind: 'surplus', material: 'Air kelapa', category: 'air', quantity: '1.000 L/minggu', price: 'Gratis (ambil)', region: 'Sulawesi Selatan', note: 'Limbah produksi santan.', email: 'user@coconexus.test', umkm: 'Santan Sulawesi' },
      { kind: 'surplus', material: 'Tempurung kelapa', category: 'tempurung', quantity: '800 kg/minggu', price: 'Rp500/kg', region: 'Sumatera Utara', note: 'Cocok arang aktif.', email: 'siti@coconexus.test', umkm: 'Arang Medan' },
      { kind: 'need', material: 'Ampas kelapa', category: 'ampas', quantity: '100 kg/minggu', price: 'Nego', region: 'Riau', note: 'Untuk tepung pangan.', email: 'user@coconexus.test', umkm: 'Tepung Riau' },
    ]
    for (const l of L) await prisma.wasteListing.create({ data: { kind: l.kind, material: l.material, category: l.category, quantity: l.quantity, price: l.price, region: l.region, note: l.note, umkmName: l.umkm, contact: l.email, userId: userId[l.email] } })
  }
  if ((await prisma.umkmDirectory.count()) === 0) {
    const D = [
      { email: 'user@coconexus.test', name: 'Kelapa Jaya', region: 'Jawa Barat', materials: ['Sabut'], products: ['Cocopeat', 'Pot Sabut'], cap: '±200 kg/minggu', bio: 'UMKM olah sabut di Sukabumi.', bp: 2, verified: true },
      { email: 'siti@coconexus.test', name: 'Briket Makmur', region: 'Jawa Timur', materials: ['Tempurung'], products: ['Briket', 'Arang Aktif'], cap: '±500 kg/minggu', bio: 'Produsen briket & arang aktif.', bp: 2, verified: true },
      { email: 'moderator@coconexus.test', name: 'Cocopeat Nusantara', region: 'Jawa Barat', materials: ['Sabut'], products: ['Cocopeat', 'Cocofiber'], cap: '±2 ton/bulan', bio: 'Pemasok mutu ekspor.', bp: 0, verified: true },
    ]
    for (const d of D) await prisma.umkmDirectory.create({ data: { userId: userId[d.email], businessName: d.name, region: d.region, materials: d.materials, products: d.products, capacity: d.cap, contact: d.email, bio: d.bio, blueprintsCount: d.bp, verified: d.verified } })
  }

  console.log(`✅ Seed selesai: ${ROLES.length} role, ${DEMO_USERS.length + 1} user, ${VALUE_NODES.length} value node, ${BLUEPRINTS.length} cetak biru, + Wawasan/forum/bursa/direktori/notif/menu/audit.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
