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

  console.log(`✅ Seed selesai: ${ROLES.length} role, ${DEMO_USERS.length + 1} user, ${VALUE_NODES.length} value node, ${BLUEPRINTS.length} cetak biru.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
