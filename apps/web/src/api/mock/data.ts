// Seed data in-memory untuk mock API (demo standalone tanpa backend).
// Akun Quick Login selaras Lampiran F dokumen rencana_pengembangan.md.
import type {
  AdminUserItem,
  AppNotification,
  ArticleFull,
  AuditLog,
  Badge,
  Category,
  Comment,
  ContentTemplate,
  ForumTopicDetail,
  MenuItem,
  RecycleBinItem,
  ReportItem,
  Role,
  SystemSettings,
  UserProfileDetail,
} from '@/types'

export interface SeedUser extends UserProfileDetail {
  password: string
  status: 'active' | 'suspended' | 'deleted'
  created_at: string
}

const now = Date.now()
const daysAgo = (d: number) => new Date(now - d * 86_400_000).toISOString()
const hoursAgo = (h: number) => new Date(now - h * 3_600_000).toISOString()

function makeBadges(owned: string[]): Badge[] {
  const all: Omit<Badge, 'awarded_at' | 'progress'>[] = [
    { id: 1, name: 'Kontributor Pemula', description: '1 artikel disetujui', icon: 'sprout' },
    { id: 2, name: 'Penulis Aktif', description: '5 artikel diterbitkan', icon: 'pen-tool' },
    { id: 3, name: 'Komentator Handal', description: '20 komentar disetujui', icon: 'message-circle' },
    { id: 4, name: 'Pemberi Suara', description: 'Memberi 50 like', icon: 'thumbs-up' },
    { id: 5, name: 'Pembelajar Rajin', description: 'Membaca 30 artikel', icon: 'book-open' },
  ]
  return all.map((b) => {
    const has = owned.includes(b.name)
    return {
      ...b,
      awarded_at: has ? daysAgo(b.id * 3) : undefined,
      progress: has ? 100 : [40, 20, 65, 80, 50][b.id - 1],
    }
  })
}

export const users: SeedUser[] = [
  {
    id: 1,
    email: 'admin@coconexus.test',
    password: 'Admin#1234',
    display_name: 'Andi Pratama',
    role: 'admin',
    avatar_url: null,
    bio: 'Pengelola sistem COCONEXUS. Menjaga platform tetap sehat dan aman.',
    job_title: 'System Administrator',
    department: 'Teknologi',
    division: 'Operasional',
    status: 'active',
    created_at: daysAgo(120),
    badges: makeBadges(['Penulis Aktif', 'Komentator Handal']),
    stats: { articles_published: 8, comments_count: 42, likes_given: 120, followers: 56 },
  },
  {
    id: 2,
    email: 'moderator@coconexus.test',
    password: 'Mod#1234',
    display_name: 'Rina Salsabila',
    role: 'moderator',
    avatar_url: null,
    bio: 'Akademisi & praktisi pengolahan kelapa. Menjaga mutu konten komunitas.',
    job_title: 'Content Moderator',
    department: 'Kurasi',
    division: 'Konten',
    status: 'active',
    created_at: daysAgo(110),
    badges: makeBadges(['Kontributor Pemula', 'Penulis Aktif', 'Komentator Handal']),
    stats: { articles_published: 12, comments_count: 88, likes_given: 64, followers: 134 },
  },
  {
    id: 3,
    email: 'user@coconexus.test',
    password: 'User#1234',
    display_name: 'Budi Santoso',
    role: 'user',
    avatar_url: null,
    bio: 'Pemilik UMKM pengolahan kelapa di Sukabumi. Suka berbagi pengalaman lapangan.',
    job_title: 'Pemilik UMKM',
    department: 'Sabut Kelapa',
    division: 'Produksi',
    status: 'active',
    created_at: daysAgo(45),
    badges: makeBadges(['Kontributor Pemula']),
    stats: { articles_published: 2, comments_count: 11, likes_given: 23, followers: 9 },
  },
  {
    id: 4,
    email: 'siti@coconexus.test',
    password: 'User#1234',
    display_name: 'Siti Marwah',
    role: 'user',
    avatar_url: null,
    bio: 'Pengrajin briket tempurung kelapa.',
    job_title: 'Pengrajin',
    department: 'Tempurung',
    division: 'Produksi',
    status: 'active',
    created_at: daysAgo(30),
    badges: makeBadges(['Kontributor Pemula', 'Pemberi Suara']),
    stats: { articles_published: 3, comments_count: 19, likes_given: 51, followers: 21 },
  },
  {
    id: 5,
    email: 'joko@coconexus.test',
    password: 'User#1234',
    display_name: 'Joko Widodo',
    role: 'user',
    avatar_url: null,
    bio: 'Petani kelapa, baru bergabung untuk belajar diversifikasi limbah.',
    job_title: 'Petani',
    department: 'Umum',
    division: '-',
    status: 'suspended',
    created_at: daysAgo(12),
    badges: makeBadges([]),
    stats: { articles_published: 0, comments_count: 3, likes_given: 7, followers: 1 },
  },
]

export const categories: Category[] = [
  { id: 1, name: 'Sabut Kelapa', slug: 'sabut-kelapa', description: 'Cocopeat, cocofiber, dan turunannya', articles_count: 3 },
  { id: 2, name: 'Tempurung', slug: 'tempurung', description: 'Briket, arang aktif, kerajinan', articles_count: 2 },
  { id: 3, name: 'Ampas Kelapa', slug: 'ampas-kelapa', description: 'Pakan ternak, tepung, pangan', articles_count: 1 },
  { id: 4, name: 'Air Kelapa', slug: 'air-kelapa', description: 'Nata de coco, cuka, minuman', articles_count: 1 },
  { id: 5, name: 'Ekonomi Sirkular', slug: 'ekonomi-sirkular', description: 'Model bisnis & keberlanjutan', articles_count: 1 },
  { id: 6, name: 'Pemasaran', slug: 'pemasaran', description: 'Strategi jual produk turunan kelapa', articles_count: 0 },
]

const longContent = `
<h2>Pendahuluan</h2>
<p>Limbah buah kelapa kerap dianggap tidak bernilai, padahal setiap bagian — sabut, tempurung, hingga air — dapat diolah menjadi produk bernilai ekonomi tinggi. Artikel ini merangkum praktik lapangan yang telah terbukti meningkatkan pendapatan UMKM.</p>
<h3>Alat & Bahan</h3>
<ul>
  <li>Sabut kelapa kering 5 kg</li>
  <li>Mesin pengurai serat (decorticator)</li>
  <li>Ayakan dan wadah penampung</li>
</ul>
<h2>Langkah-langkah</h2>
<ol>
  <li>Keringkan sabut hingga kadar air di bawah 15%.</li>
  <li>Urai serat menggunakan mesin decorticator hingga terpisah antara <strong>cocofiber</strong> dan <strong>cocopeat</strong>.</li>
  <li>Ayak cocopeat untuk memisahkan partikel halus dan kasar.</li>
  <li>Kemas sesuai standar pasar (blok terkompresi atau curah).</li>
</ol>
<blockquote>Tips: jaga kelembapan ruang penyimpanan agar produk tidak berjamur sebelum dijual.</blockquote>
<h2>Hasil & Pemanfaatan</h2>
<p>Cocopeat banyak diserap industri hortikultura sebagai media tanam, sementara cocofiber dipakai untuk matras, geotekstil, dan jok. Dengan proses sederhana ini, satu UMKM kecil mampu mengolah 200 kg sabut per minggu.</p>
<p>Kunci keberhasilan adalah konsistensi kualitas dan kemitraan dengan pembeli tetap. Dokumentasikan setiap batch agar mutu terjaga dan mudah ditelusuri.</p>
`

const articleSeeds: Array<Partial<ArticleFull> & { id: number; title: string; authorId: number; category: string; status: ArticleFull['status'] }> = [
  { id: 1, title: 'Mengubah Sabut Kelapa Menjadi Cocopeat Bernilai Ekspor', authorId: 2, category: 'Sabut Kelapa', status: 'published', tags: ['cocopeat', 'media-tanam', 'ekspor'] },
  { id: 2, title: 'Panduan Lengkap Membuat Briket Tempurung Kelapa', authorId: 4, category: 'Tempurung', status: 'published', tags: ['briket', 'energi', 'arang'] },
  { id: 3, title: 'Nata de Coco Rumahan: Dari Air Kelapa ke Pasar', authorId: 3, category: 'Air Kelapa', status: 'published', tags: ['nata', 'pangan', 'fermentasi'] },
  { id: 4, title: 'Cocofiber untuk Geotekstil: Peluang Pasar Konstruksi', authorId: 2, category: 'Sabut Kelapa', status: 'published', tags: ['cocofiber', 'konstruksi'] },
  { id: 5, title: 'Arang Aktif dari Tempurung: Proses & Standar Mutu', authorId: 4, category: 'Tempurung', status: 'published', tags: ['arang-aktif', 'mutu'] },
  { id: 6, title: 'Tepung Ampas Kelapa sebagai Bahan Pangan Fungsional', authorId: 3, category: 'Ampas Kelapa', status: 'published', tags: ['tepung', 'pangan'] },
  { id: 7, title: 'Model Ekonomi Sirkular untuk Sentra Kelapa Desa', authorId: 2, category: 'Ekonomi Sirkular', status: 'published', tags: ['sirkular', 'desa'] },
  { id: 8, title: 'Pengalaman Saya Mengolah Sabut Jadi Pot Ramah Lingkungan', authorId: 3, category: 'Sabut Kelapa', status: 'submitted', tags: ['pot', 'eco'] },
  { id: 9, title: 'Cuka Air Kelapa: Draft Eksperimen Fermentasi', authorId: 4, category: 'Air Kelapa', status: 'revision', tags: ['cuka', 'fermentasi'] },
  { id: 10, title: 'Catatan Awal Pemasaran Produk Kelapa via Marketplace', authorId: 3, category: 'Pemasaran', status: 'draft', tags: ['pemasaran'] },
]

export const articles: ArticleFull[] = articleSeeds.map((a, idx) => {
  const author = users.find((u) => u.id === a.authorId)!
  const likes = a.status === 'published' ? 30 + ((idx * 17) % 90) : 0
  return {
    id: a.id,
    title: a.title,
    slug: a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    author: { id: author.id, email: author.email, display_name: author.display_name, role: author.role, avatar_url: author.avatar_url },
    category: a.category,
    tags: a.tags ?? [],
    excerpt: 'Praktik lapangan terbukti mengubah limbah kelapa menjadi produk bernilai ekonomi tinggi untuk UMKM agroindustri.',
    thumbnail_url: null,
    status: a.status,
    published_at: a.status === 'published' ? daysAgo(idx + 1) : null,
    content: longContent,
    sources: ['Kementerian Pertanian RI (2024)', 'Jurnal Agroindustri Kelapa Vol. 12'],
    user_vote: null,
    is_bookmarked: idx === 0 || idx === 2,
    review_notes: a.status === 'revision' ? 'Mohon tambahkan takaran bahan yang lebih spesifik dan sumber referensi pada bagian fermentasi.' : null,
    stats: {
      views: a.status === 'published' ? 120 + ((idx * 53) % 800) : 4 + idx,
      likes,
      dislikes: a.status === 'published' ? (idx * 3) % 9 : 0,
      comments: a.status === 'published' ? (idx * 2) % 7 : 0,
    },
  }
})

export const commentsByArticle: Record<number, Comment[]> = {
  1: [
    {
      id: 1,
      content: 'Artikel yang sangat membantu! Kira-kira mesin decorticator yang terjangkau untuk pemula merek apa ya?',
      user: pub(3),
      created_at: daysAgo(2),
      status: 'approved',
      parent_id: null,
      replies: [
        {
          id: 2,
          content: 'Untuk skala kecil bisa mulai dari mesin lokal kapasitas 50 kg/jam, Pak. Nanti saya tulis ulasannya.',
          user: pub(2),
          created_at: daysAgo(1),
          status: 'approved',
          parent_id: 1,
          replies: [],
        },
      ],
    },
    {
      id: 3,
      content: 'Apakah cocopeat ini aman untuk semua jenis tanaman hias?',
      user: pub(4),
      created_at: hoursAgo(20),
      status: 'approved',
      parent_id: null,
      replies: [],
    },
  ],
}

export const pendingComments: Comment[] = [
  {
    id: 50,
    content: 'Mantap, izin share ke grup UMKM kami ya!',
    user: pub(5),
    created_at: hoursAgo(3),
    status: 'pending',
    parent_id: null,
    replies: [],
  },
  {
    id: 51,
    content: 'Bisa minta kontak pembeli cocofiber-nya?',
    user: pub(4),
    created_at: hoursAgo(6),
    status: 'pending',
    parent_id: null,
    replies: [],
  },
]

export const forumTopics: ForumTopicDetail[] = [
  {
    id: 1,
    title: 'Bagaimana menjaga kualitas cocopeat saat musim hujan?',
    author: pub(3),
    category: 'Sabut Kelapa',
    is_pinned: true,
    is_locked: false,
    replies_count: 2,
    created_at: daysAgo(4),
    last_activity: hoursAgo(5),
    content: 'Halo rekan-rekan, saat musim hujan cocopeat saya sering lembap dan berjamur. Ada tips penyimpanan yang ampuh?',
    replies: [
      { id: 1, content: 'Gunakan silica gel dalam kemasan dan pastikan gudang punya ventilasi serta palet kayu agar tidak kontak lantai.', user: pub(2), created_at: hoursAgo(20) },
      { id: 2, content: 'Saya pakai oven pengering sederhana sebelum pengemasan, cukup membantu.', user: pub(4), created_at: hoursAgo(5) },
    ],
  },
  {
    id: 2,
    title: 'Diskusi: harga pasar briket tempurung 2026',
    author: pub(4),
    category: 'Tempurung',
    is_pinned: false,
    is_locked: false,
    replies_count: 1,
    created_at: daysAgo(2),
    last_activity: hoursAgo(10),
    content: 'Yuk bahas tren harga briket ekspor tahun ini. Di daerah saya naik 8%.',
    replies: [
      { id: 3, content: 'Di Jawa Timur juga naik, permintaan Timur Tengah sedang tinggi.', user: pub(3), created_at: hoursAgo(10) },
    ],
  },
  {
    id: 3,
    title: '[Terkunci] Aturan komunitas & etika berbagi',
    author: pub(2),
    category: 'Ekonomi Sirkular',
    is_pinned: true,
    is_locked: true,
    replies_count: 0,
    created_at: daysAgo(20),
    last_activity: daysAgo(20),
    content: 'Mohon dibaca aturan komunitas sebelum memposting. Topik ini dikunci.',
    replies: [],
  },
]

export const notifications: AppNotification[] = [
  { id: 1, type: 'article_approved', data: { message: 'Artikel "Nata de Coco Rumahan" telah disetujui dan terbit.', link: '/articles/3' }, is_read: false, created_at: hoursAgo(2) },
  { id: 2, type: 'reply', data: { message: 'Rina Salsabila membalas komentar Anda.', link: '/articles/1' }, is_read: false, created_at: hoursAgo(8) },
  { id: 3, type: 'article_revision', data: { message: 'Artikel "Cuka Air Kelapa" perlu revisi. Lihat catatan moderator.', link: '/dashboard/articles' }, is_read: false, created_at: daysAgo(1) },
  { id: 4, type: 'badge_awarded', data: { message: 'Selamat! Anda meraih lencana "Kontributor Pemula".', link: '/dashboard/profile' }, is_read: true, created_at: daysAgo(2) },
  { id: 5, type: 'follow_publish', data: { message: 'Penulis yang Anda ikuti menerbitkan artikel baru.', link: '/articles/7' }, is_read: true, created_at: daysAgo(3) },
]

export const templates: ContentTemplate[] = [
  {
    id: 1,
    name: 'Cara Membuat (Langkah Praktis)',
    content: '<h2>Pendahuluan</h2><p>{deskripsi_singkat}</p><h3>Alat & Bahan</h3><ul><li>{bahan_1}</li></ul><h2>Langkah-langkah</h2><ol><li>{langkah_1}</li></ol><h2>Hasil & Tips</h2><p>{hasil}</p>',
    created_at: daysAgo(60),
  },
  {
    id: 2,
    name: 'Studi Kasus UMKM',
    content: '<h2>Latar Belakang</h2><p>{latar}</p><h2>Tantangan</h2><p>{tantangan}</p><h2>Solusi</h2><p>{solusi}</p><h2>Dampak</h2><p>{dampak}</p>',
    created_at: daysAgo(40),
  },
]

export const reports: ReportItem[] = [
  { id: 1, reporter: pub(3), reason: 'spam', description: 'Komentar promosi berulang.', entity_type: 'comment', entity_id: 50, entity_preview: 'Mantap, izin share ke grup UMKM kami ya!', created_at: hoursAgo(4) },
  { id: 2, reporter: pub(4), reason: 'misinformation', description: 'Klaim takaran tidak akurat.', entity_type: 'article', entity_id: 9, entity_preview: 'Cuka Air Kelapa: Draft Eksperimen Fermentasi', created_at: hoursAgo(12) },
]

export const adminUsers: AdminUserItem[] = users.map((u) => ({
  id: u.id,
  email: u.email,
  display_name: u.display_name,
  role: u.role,
  status: u.status,
  created_at: u.created_at,
}))

export const auditLogs: AuditLog[] = [
  { id: 1, user: pub(2), action: 'article.approve', entity_type: 'article', entity_id: 3, description: 'Menyetujui artikel "Nata de Coco Rumahan"', ip_address: '172.16.67.5', created_at: hoursAgo(2) },
  { id: 2, user: pub(1), action: 'settings.update', entity_type: 'system', entity_id: null, description: 'Mengubah posts_per_page menjadi 20', ip_address: '172.16.67.5', created_at: hoursAgo(9) },
  { id: 3, user: pub(2), action: 'comment.reject', entity_type: 'comment', entity_id: 99, description: 'Menolak komentar spam', ip_address: '172.16.67.5', created_at: daysAgo(1) },
  { id: 4, user: pub(1), action: 'user.suspend', entity_type: 'user', entity_id: 5, description: 'Menonaktifkan akun Joko Widodo', ip_address: '172.16.67.5', created_at: daysAgo(2) },
  { id: 5, user: pub(3), action: 'article.submit', entity_type: 'article', entity_id: 8, description: 'Mengirim artikel untuk direview', ip_address: '103.20.11.4', created_at: daysAgo(2) },
]

export const recycleBin: RecycleBinItem[] = [
  { type: 'articles', id: 99, title: 'Draft lama: olahan kelapa parut', deleted_by: pub(2), deleted_at: daysAgo(3) },
  { type: 'comments', id: 120, title: 'Komentar dihapus karena spam', deleted_by: pub(2), deleted_at: daysAgo(5) },
  { type: 'users', id: 88, title: 'akun-ganda@coconexus.test', deleted_by: pub(1), deleted_at: daysAgo(8) },
]

export const menuItems: MenuItem[] = [
  { id: 1, label: 'Beranda', url: '/', icon: 'home', parent_id: null, sort_order: 1, is_visible: true, target: '_self' },
  { id: 2, label: 'Artikel', url: '/articles', icon: 'book-open', parent_id: null, sort_order: 2, is_visible: true, target: '_self' },
  { id: 3, label: 'Forum', url: '/forum', icon: 'message-square', parent_id: null, sort_order: 3, is_visible: true, target: '_self' },
  { id: 4, label: 'Tentang', url: '/tentang', icon: 'info', parent_id: null, sort_order: 4, is_visible: false, target: '_self' },
]

export const systemSettings: SystemSettings = {
  site_name: 'COCONEXUS',
  site_description: 'Platform manajemen pengetahuan pengelolaan limbah buah kelapa untuk UMKM.',
  site_logo: '',
  favicon: '/favicon.svg',
  posts_per_page: 20,
  maintenance_mode: false,
}

// Helper publik (ringkasan profil)
export function pub(id: number) {
  const u = users.find((x) => x.id === id)!
  return { id: u.id, email: u.email, display_name: u.display_name, role: u.role as Role, avatar_url: u.avatar_url }
}
