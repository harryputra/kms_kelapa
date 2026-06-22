# DOKUMEN DESAIN ANTARMUKA (UI DESIGN DOCUMENT)  
## Knowledge Management System (KMS) COCONEXUS v2.0  
### Platform Manajemen Pengetahuan Pengelolaan Limbah Buah Kelapa untuk UMKM  

---

**Versi Dokumen**: 2.0 (Super Ultra Lengkap)  
**Tanggal**: 22 Juni 2026  
**Status**: Final  
**Penyusun**: Tim Desain COCONEXUS  

---

## DAFTAR ISI

1. **PENDAHULUAN**  
   1.1 Tujuan Dokumen  
   1.2 Ruang Lingkup  
   1.3 Pihak yang Dituju  
2. **PRINSIP DESAIN**  
   2.1 Filosofi Desain  
   2.2 Pilar Utama Pengalaman Pengguna  
3. **SISTEM DESAIN (DESIGN SYSTEM)**  
   3.1 Warna  
   3.2 Tipografi  
   3.3 Spasi & Grid  
   3.4 Ikonografi  
   3.5 Bayangan & Elevasi  
   3.6 Radius Sudut  
   3.7 Tombol & Interaktif  
   3.8 Formulir & Validasi  
   3.9 Komponen Umum  
4. **TATA LETAK & STRUKTUR HALAMAN**  
   4.1 Sistem Grid  
   4.2 Template Halaman  
   4.3 Breakpoint Responsif  
5. **KOMPONEN GLOBAL**  
   5.1 Header & Navigasi  
   5.2 Sidebar  
   5.3 Footer  
   5.4 Kartu (Card)  
   5.5 Modal & Dialog  
   5.6 Notifikasi & Toast  
   5.7 Lonceng Notifikasi (Notification Center)  
   5.8 Panel Pencarian  
6. **HALAMAN & WIREFRAME**  
   6.1 Halaman Publik (Guest)  
       - Landing Page  
       - Daftar Artikel  
       - Detail Artikel (Pratinjau 50%)  
       - Login & Registrasi  
   6.2 Pengguna Terdaftar  
       - Dashboard Pengguna  
       - Profil Pengguna & Badge  
       - Form Submit Artikel  
       - Daftar Bacaan (Bookmark)  
       - Pusat Notifikasi  
   6.3 Moderator  
       - Dashboard Moderator  
       - Antrean Review  
       - Form Review & Catatan  
       - Template Artikel  
       - Moderasi Komentar & Laporan  
   6.4 Admin  
       - Dashboard Admin  
       - Manajemen Pengguna  
       - Pengaturan Sistem  
       - Menu Manager  
       - Recycle Bin  
       - Audit Log  
   6.5 Forum Diskusi (CoP)  
       - Daftar Topik  
       - Detail Topik & Balasan  
       - Form Topik Baru  
7. **STATUS & KONDISI ANTARMUKA**  
   7.1 Loading State  
   7.2 Empty State  
   7.3 Error State  
   7.4 Edge Cases & Limitasi  
8. **INTERAKSI & MIKRO-INTERAKSI**  
9. **AKSESIBILITAS (ACCESSIBILITY)**  
10. **ALUR PENGGUNA (USER FLOWS)**  
11. **PROTOTIPE & HANDOFF**  

---

## 1. PENDAHULUAN

### 1.1 Tujuan Dokumen
Dokumen ini mendeskripsikan secara rinci desain antarmuka pengguna (UI) dan pengalaman pengguna (UX) untuk sistem COCONEXUS v2.0. Tujuannya adalah:

- Menjadi acuan tunggal bagi pengembang frontend, UI/UX designer, dan QA.
- Memastikan konsistensi visual dan interaksi di seluruh platform.
- Menyediakan spesifikasi desain yang terukur untuk setiap halaman dan komponen.
- Mempercepat proses pengembangan dengan komponen yang terdokumentasi lengkap.

### 1.2 Ruang Lingkup
Meliputi seluruh layar dan komponen yang ada pada aplikasi web COCONEXUS, mencakup:

- Halaman publik (guest)
- Dashboard pengguna, moderator, admin
- Komponen sistem desain (warna, tipografi, tombol, formulir, dll.)
- Status loading, kosong, dan error
- Pedoman aksesibilitas (WCAG 2.1 AA)
- Interaksi dan transisi

Tidak termasuk: aplikasi mobile native, aset branding (logo final), konten multimedia spesifik.

### 1.3 Pihak yang Dituju
- Tim Frontend Developer
- UI/UX Designer
- Product Manager
- QA Tester
- Pemangku kepentingan

---

## 2. PRINSIP DESAIN

### 2.1 Filosofi Desain
COCONEXUS mengusung tema **“Alam & Pengetahuan”**, menggabungkan kesan alami (hijau, bumi) dengan kejelasan informasi (bersih, modern). Desain harus **ramah bagi UMKM** – tidak menakutkan, mudah dioperasikan, dan cepat dipahami.

### 2.2 Pilar Utama Pengalaman Pengguna
1. **Kesederhanaan (Simplicity)**: Kurangi beban kognitif; tampilkan informasi penting, sembunyikan kompleksitas.
2. **Kejelasan (Clarity)**: Tipografi terbaca, hirarki visual jelas, label aksi tidak ambigu.
3. **Efisiensi (Efficiency)**: Minim langkah untuk tugas umum; pintasan untuk pengguna mahir.
4. **Konsistensi (Consistency)**: Pola interaksi dan visual yang seragam di seluruh platform.
5. **Keterlibatan (Engagement)**: Gunakan mikro-interaksi halus, umpan balik instan, gamifikasi (badge).

---

## 3. SISTEM DESAIN (DESIGN SYSTEM)

### 3.1 Warna
Palet warna dikurasi untuk menciptakan suasana profesional, alami, dan tenang.

| Peran              | Nama Warna      | Kode HEX   | Contoh Penggunaan |
|--------------------|-----------------|------------|-------------------|
| **Primer**         | Hijau Utama     | `#2D6A4F`  | Tombol utama, link, header |
| **Primer Gelap**   | Hijau Tua       | `#1B4332`  | Hover tombol, teks di atas hijau |
| **Primer Muda**    | Hijau Muda      | `#40916C`  | Aksen, badge, border fokus |
| **Sekunder**       | Emas/Coklat     | `#B07D3C`  | Sorotan, ikon premium, lencana |
| **Latar**          | Putih           | `#FFFFFF`  | Latar utama |
| **Latar Abu**      | Abu‑Muda        | `#F8F9FA`  | Latar section, kartu |
| **Teks Utama**     | Hitam‑Arang     | `#212529`  | Teks paragraf |
| **Teks Sekunder**  | Abu‑Teks        | `#6C757D`  | Metadata, placeholder |
| **Sukses**         | Hijau Sukses    | `#198754`  | Pesan sukses, disetujui |
| **Peringatan**     | Kuning          | `#FFC107`  | Peringatan, revisi |
| **Bahaya**         | Merah           | `#DC3545`  | Hapus, tolak, error |
| **Info**           | Biru            | `#0D6EFD`  | Informasi, link eksternal |

**Aksesibilitas**: Semua kombinasi teks‑latar telah diuji memenuhi rasio kontras minimal 4.5:1 untuk teks biasa dan 3:1 untuk teks besar (WCAG AA).

### 3.2 Tipografi
Font utama: **Inter** (untuk body teks) dan **Poppins** (untuk judul). Keduanya adalah font sans‑serif yang bersih dan mudah dibaca di layar.

| Hirarki | Font           | Ukuran (Desktop) | Ukuran (Mobile) | Ketebalan | Keterangan |
|---------|----------------|------------------|-----------------|-----------|------------|
| H1      | Poppins        | 32px             | 24px            | Bold 700  | Judul halaman |
| H2      | Poppins        | 24px             | 20px            | SemiBold 600 | Judul section |
| H3      | Poppins        | 20px             | 18px            | SemiBold 600 | Judul sub‑section |
| H4      | Inter          | 18px             | 16px            | Medium 500 | Judul kecil, modal |
| Body    | Inter          | 16px             | 15px            | Regular 400 | Teks paragraf |
| Body Kecil | Inter       | 14px             | 13px            | Regular 400 | Metadata, caption |
| Tombol  | Inter          | 16px             | 15px            | Medium 500 | Label tombol |
| Caption | Inter          | 12px             | 12px            | Regular 400 | Tanggal, info tambahan |

### 3.3 Spasi & Grid
Menggunakan sistem **8‑point grid**: semua jarak, padding, dan margin kelipatan 8px (misal: 4px, 8px, 16px, 24px, 32px, 48px, 64px, 96px).

**Container maksimum**: 1200px (di tengah). **Padding lateral**: 16px (mobile), 24px (tablet), 32px (desktop).

### 3.4 Ikonografi
Menggunakan pustaka ikon **Lucide** (atau set ikon kustom yang serupa dengan gaya line icon). Ukuran ikon: 16px, 20px, 24px, 32px. Warna ikon mengikuti warna teks atau warna aksen.

### 3.5 Bayangan & Elevasi

| Level | Deskripsi | Properti CSS |
|-------|-----------|--------------|
| 0     | Tanpa elevasi | `none` |
| 1     | Card, panel statis | `0 1px 3px rgba(0,0,0,0.08)` |
| 2     | Card dengan hover, dropdown | `0 4px 12px rgba(0,0,0,0.12)` |
| 3     | Modal, drawer | `0 8px 24px rgba(0,0,0,0.15)` |
| 4     | Floating action button, tooltip | `0 16px 48px rgba(0,0,0,0.2)` |

### 3.6 Radius Sudut
- Tombol, input, card: **8px**
- Modal: **12px**
- Badge, chip: **16px (pill)**
- Gambar profil: **50% (lingkaran)**

### 3.7 Tombol & Interaktif

**Jenis Tombol**:
1. **Primary** – latar hijau utama, teks putih, digunakan untuk aksi utama (simpan, kirim).
2. **Secondary** – latar putih, border hijau, teks hijau, untuk aksi pendukung.
3. **Danger** – latar merah, teks putih, untuk hapus/tolak.
4. **Ghost** – tanpa latar, hanya teks/ikon, untuk aksi kurang penting.
5. **Link** – teks dengan underline/hover.

**State**:
- Default → Hover (gelap 10%) → Active (gelap 15%) → Focus (outline 2px hijau muda) → Disabled (opacity 0.5, no pointer)

**Ukuran**:
- Small: 32px tinggi, padding 8px 12px
- Medium: 40px tinggi, padding 8px 16px (standar)
- Large: 48px tinggi, padding 8px 24px

### 3.8 Formulir & Validasi

**Input Teks**:
- Border 1px `#ced4da`, radius 8px, tinggi 40px.
- Fokus: border hijau utama, box‑shadow 0 0 0 3px rgba(45,106,79,0.25).
- Error: border merah, teks bantuan merah.
- Disabled: latar `#e9ecef`.

**Textarea**: mirip input, tinggi minimal 120px.

**Dropdown (Select)**: tampilan kustom dengan panah.

**Checkbox/Radio**: ukuran 20px, warna hijau saat dicentang.

**Pesan Validasi**:
- Error: ikon ⚠️, teks merah di bawah field.
- Sukses: tidak ditampilkan (hindari clutter).

### 3.9 Komponen Umum
- **Badge**: latar hijau muda, teks hijau tua, digunakan untuk status artikel (published, draft, dll.) dan lencana pengguna.
- **Tooltip**: latar gelap, teks putih, muncul di hover/fokus pada ikon yang butuh penjelasan.
- **Progress Bar**: untuk loading halaman (top bar) atau progres pengisian profil.
- **Skeleton Screen**: placeholder berbentuk abu‑abu beranimasi saat konten dimuat.

---

## 4. TATA LETAK & STRUKTUR HALAMAN

### 4.1 Sistem Grid
Menggunakan grid 12 kolom CSS standar dengan gap 24px. Dapat digunakan untuk merapikan konten.

### 4.2 Template Halaman

**Template Publik**:
```
+-----------------------------+
| Header (nav, login/register)|
+-----------------------------+
|       Container Utama      |
|      (lebar 1200px)       |
+-----------------------------+
|          Footer            |
+-----------------------------+
```

**Template Dashboard**:
```
+---------------------+------+
|     Sidebar        |  Main|
|  - Menu            |  Content|
|  - Navigasi        |       |
+---------------------+------+
```

### 4.3 Breakpoint Responsif

| Breakpoint | Ukuran Layar | Tata Letak |
|------------|--------------|------------|
| XS (Mobile) | <576px | Satu kolom, menu hamburger |
| SM (Tablet)  | ≥576px | Dua kolom, sidebar kolaps |
| MD (Laptop)  | ≥768px | Sidebar terbuka sebagian |
| LG (Desktop) | ≥992px | Sidebar penuh, layout penuh |
| XL (Wide)    | ≥1200px | Container 1200px terpusat |

---

## 5. KOMPONEN GLOBAL

### 5.1 Header & Navigasi

**Untuk Guest**:
- Logo COCONEXUS (kiri).
- Menu: Beranda, Artikel, Forum (jika publik), Tentang.
- Tombol: Login, Daftar.

**Untuk Pengguna Login**:
- Logo (kiri).
- Menu: Dashboard, Artikel, Forum.
- Lonceng Notifikasi (dengan badge jumlah belum dibaca).
- Avatar + nama, dropdown menuju Profil, Bookmark, Logout.

Header memiliki tinggi 64px, latar putih, bayangan level 1.

### 5.2 Sidebar (Dashboard)
- Lebar 260px (terbuka), 80px (kolaps).
- Menu: Dashboard, Artikel Saya, Submit Artikel, Bookmark, Notifikasi, Profil, Badge.
- Untuk Moderator: tambahan Review Queue, Template, Moderasi Komentar, Laporan.
- Untuk Admin: Pengguna, Pengaturan, Menu, Recycle Bin, Backup, Audit Log.

### 5.3 Footer
Minimal, latar abu‑muda, teks abu, tautan: Tentang, Bantuan, Kebijakan Privasi, Kontak.

### 5.4 Kartu (Card)
Digunakan untuk menampilkan artikel, topik forum, atau item lainnya.
Struktur:
- Gambar (opsional, 16:9)
- Judul (H4)
- Metadata (penulis, tanggal, kategori)
- Ringkasan (2‑3 baris, teks abu)
- Footer: statistik (like, komentar, views) dan tombol aksi (bookmark, vote).

Kartu memiliki bayangan level 1, saat dihover naik ke level 2.

### 5.5 Modal & Dialog
- Digunakan untuk konfirmasi (hapus, approve, reject), form cepat (review notes), atau tampilan media.
- Lebar modal: 400px (kecil), 600px (sedang), 900px (besar).
- Header dengan judul, tombol close.
- Latar belakang semi‑transparan hitam (50%).
- Fokus terjebak di dalam modal (aksesibilitas).

### 5.6 Notifikasi & Toast
Toast muncul di sudut kanan atas (atau bawah pada mobile) untuk umpan balik singkat: sukses (hijau), error (merah), info (biru). Durasi 5 detik, bisa ditutup manual.

### 5.7 Lonceng Notifikasi (Notification Center)
- Dropdown dengan lebar 360px.
- Tab: Semua / Belum Dibaca.
- Item notifikasi: ikon jenis (komentar, artikel, dll.), teks, waktu relatif (misal “3 menit lalu”).
- Klik item menuju ke halaman terkait.
- Tombol “Tandai Semua Dibaca” di bawah.

### 5.8 Panel Pencarian
- Input search dengan ikon kaca pembesar.
- Hasil pencarian muncul sebagai dropdown (live search setelah 300ms debounce).

---

## 6. HALAMAN & WIREFRAME

### 6.1 Halaman Publik (Guest)

#### 6.1.1 Landing Page
**Tujuan**: Memperkenalkan platform, menarik minat untuk daftar.

**Wireframe (Desktop)**:
```
┌─────────────────────────────────────────────────────────┐
│  LOGO   Beranda  Artikel  Forum   Login   Daftar       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │     🥥  COCONEXUS                              │   │
│  │   Platform Pengetahuan Pengelolaan Limbah Kelapa│   │
│  │   [Jelajahi Artikel] [Daftar Gratis]            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Statistik: 📚 150+ Artikel  👥 500+ Pengguna           │
│                                                         │
│  ───Artikel Terbaru─────────────────────────────────    │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐               │
│  │ [Gambar] │  │ [Gambar] │  │ [Gambar] │               │
│  │ Judul    │  │ Judul    │  │ Judul    │               │
│  │ Meta     │  │ Meta     │  │ Meta     │               │
│  └─────────┘  └─────────┘  └─────────┘               │
│                                                         │
│  ───Kategori Populer────────────────────────────────    │
│  [Sabut] [Tempurung] [Ampas] [Ekonomi Sirkular]...      │
│                                                         │
│  ───Testimoni / Ajakan Daftar─────────────────────     │
└─────────────────────────────────────────────────────────┘
```

**Responsif (Mobile)**: Statistik ditumpuk vertikal, kartu artikel satu kolom.

#### 6.1.2 Daftar Artikel
- Header: judul halaman + tombol “Tulis Artikel” (jika login).
- Filter: dropdown kategori, input search, sort (Terbaru/Populer).
- Grid 3 kolom (desktop), 2 kolom (tablet), 1 kolom (mobile).
- Setiap kartu menampilkan ringkasan.
- Pagination di bawah.

#### 6.1.3 Detail Artikel (Pratinjau 50% untuk Guest)
- Judul artikel, penulis, tanggal, kategori, tag.
- Konten artikel: setelah paragraf ke‑X (50% dari total teks), muncul **overlay gradien** (transparan ke putih) dan kotak ajakan “Daftar untuk membaca sepenuhnya” dengan tombol Daftar / Login.
- Di bawah (sebelum overlay, atau setelahnya untuk yang login penuh): tombol like/dislike, bookmark, share, report.
- Daftar komentar (hanya yang disetujui). Untuk guest, tidak ada form balas.

#### 6.1.4 Login & Registrasi
- Formulir di tengah halaman.
- **Login**: email, password, “Lupa Password?”, tombol Login. Atau tautan ke Daftar.
- **Registrasi**: email, password, nama tampilan, tombol Daftar. Atau tautan ke Login.
- Setelah daftar: tampilkan pesan “Cek email untuk verifikasi”.

### 6.2 Pengguna Terdaftar

#### 6.2.1 Dashboard Pengguna
**Layout**: Sidebar + Main content.
**Main content**:
- **Selamat datang, [Nama]!** (poin badge terbaru jika ada).
- **Ringkasan Statistik**: Artikel diterbitkan, Komentar, Like diberikan, Bookmark.
- **Artikel Saya**: tabel atau daftar artikel yang pernah disubmit (status: draft, submitted, revision, published). Aksi: edit, lihat, hapus draft.
- **Bookmark Terbaru**: kartu kecil artikel yang disimpan.
- **Notifikasi Terkini**: daftar 5 notifikasi terbaru.

#### 6.2.2 Profil Pengguna & Badge
- Halaman Profil: avatar, nama, bio, badge (ikon).
- Form edit profil (display name, bio, job title, department, division).
- Upload avatar (drag & drop atau klik).
- Daftar badge yang diperoleh beserta progresnya.

#### 6.2.3 Form Submit Artikel
- Pilihan **Template** (dropdown) → konten awal.
- Field: Judul (text), Kategori (dropdown), Tags (input chip), Konten (WYSIWYG editor: bold, italic, heading, list, image upload, link).
- Gambar unggulan (opsional, upload).
- Tombol: Simpan Draft, Submit for Review.
- Validasi: judul tidak kosong, konten minimal 200 karakter, kategori dipilih.
- Setelah submit, redirect ke Artikel Saya dengan status “Submitted”.

#### 6.2.4 Daftar Bacaan (Bookmark)
- Halaman mirip daftar artikel, filter hanya milik sendiri.
- Setiap kartu memiliki tombol hapus bookmark.

#### 6.2.5 Pusat Notifikasi (Halaman Penuh)
- Daftar notifikasi dengan pagination, filter sudah/belum dibaca.
- Setiap item: ikon tipe, teks, waktu, tautan.
- Checkbox untuk pilih banyak, lalu “Tandai Dibaca”.

### 6.3 Moderator

#### 6.3.1 Dashboard Moderator
- Tambahan di sidebar: Review Queue, Template, Moderasi Komentar, Laporan.
- Main content:
  - Statistik: Artikel direview, publikasi, komentar dimoderasi.
  - **Antrean Review (ringkasan)**: 5 item teratas yang perlu tindakan.
  - **Komentar Pending**: jumlah.

#### 6.3.2 Antrean Review
- Tabel/list artikel dengan status “Submitted” atau “Review”.
- Filter: status, kategori.
- Setiap baris: Judul, Penulis, Tanggal Submit, Status.
- Aksi: **Tinjau** → membuka halaman review detail.

**Halaman Review Detail**:
- Tampilan penuh artikel (readonly).
- Panel aksi di samping (atau bawah):
  - **Approve**: tombol hijau “Terbitkan”, langsung ubah status ke Published.
  - **Revisi**: tombol kuning “Minta Revisi”, muncul form **Review Notes** (wajib diisi) → status jadi Revision, kirim notifikasi ke penulis.
  - **Tolak**: tombol merah “Tolak”, muncul form alasan (wajib) → status jadi Rejected, notifikasi.
- Setelah aksi, kembali ke antrean.

#### 6.3.3 Template Artikel
- Daftar template (kartu), bisa diedit, dihapus.
- Form: Nama template, Konten (editor teks). Simpan.

#### 6.3.4 Moderasi Komentar & Laporan
- Tab: Komentar Pending, Laporan.
- Komentar: tampilan komentar dengan artikel asal, aksi Approve/Reject.
- Laporan: tabel laporan dengan konten yang dilaporkan, alasan, pelapor, aksi “Abaikan” atau “Hapus Konten”.

### 6.4 Admin

#### 6.4.1 Dashboard Admin
- Statistik platform: total pengguna, total artikel, total komentar, views hari ini, dll.
- Grafik tren (bar chart sederhana) views dan registrasi (opsional, bisa menggunakan library chart.js).
- Log aktivitas terbaru (ringkasan).

#### 6.4.2 Manajemen Pengguna
- Tabel pengguna (search, filter role, status).
- Aksi: edit (ubah role), suspen (nonaktifkan), soft delete.
- Detail pengguna (popup/slide): profil, badge, artikel, komentar.

#### 6.4.3 Pengaturan Sistem
- Form terstruktur:
  - Site Name, Site Description (textarea)
  - Logo (upload), Favicon (upload)
  - Posts per page (number)
  - Maintenance Mode (toggle)
- Simpan.

#### 6.4.4 Menu Manager
- List menu dengan struktur pohon (parent-child).
- Drag & drop untuk urutan.
- Form tambah/edit: Label, URL, Icon (opsional), Parent, Target, Visibility.
- Tampilan langsung terlihat di preview navigasi (jika memungkinkan).

#### 6.4.5 Recycle Bin
- Filter: Artikel, Komentar, Pengguna.
- Tabel: Nama/Judul, Dihapus oleh, Tanggal hapus.
- Aksi: Pulihkan. Tidak ada hapus permanen (otomatis setelah 30 hari).

#### 6.4.6 Audit Log
- Filter: tanggal, pengguna, aksi.
- Tabel: Waktu, Pengguna, Aksi, Deskripsi, IP.
- Tidak bisa diedit/dihapus.

### 6.5 Forum Diskusi (CoP)

#### 6.5.1 Daftar Topik
- Mirip daftar artikel, tetapi setiap item forum memiliki: judul, penulis, kategori, balasan terakhir, status pin/lock.
- Tombol “Buat Topik Baru” (jika login).
- Pagination.

#### 6.5.2 Detail Topik & Balasan
- Judul topik, konten, penulis, tanggal, status (pin/lock).
- Daftar balasan (avatar, nama, konten, waktu) dengan urutan kronologis.
- Jika topik terkunci, form balasan dinonaktifkan.

#### 6.5.3 Form Topik Baru
- Field: Judul, Kategori, Konten (editor teks), notifikasi subscribe.
- Submit.

---

## 7. STATUS & KONDISI ANTARMUKA

### 7.1 Loading State
- **Halaman penuh**: skeleton screen (placeholder berbentuk garis abu-abu beranimasi) untuk kartu artikel, profil.
- **Tombol**: setelah klik, muncul spinner dan teks berubah (misal: “Menyimpan…”), tombol dinonaktifkan sementara.
- **Upload gambar**: progress bar.

### 7.2 Empty State
- Ilustrasi sederhana (ikon) dan teks ajakan.
- Contoh: “Belum ada artikel tersimpan. [Jelajahi artikel]”
- Untuk moderator: “Antrean review kosong, bagus!”

### 7.3 Error State
- **404**: Halaman tidak ditemukan, tautan kembali ke beranda.
- **500**: Kesalahan server, pesan “Terjadi kesalahan, coba beberapa saat lagi”, tombol muat ulang.
- **Validasi formulir**: pesan di bawah field.
- **Error jaringan**: toast “Tidak dapat terhubung ke server”.

### 7.4 Edge Cases & Limitasi
- Judul artikel terlalu panjang: dipotong dengan ellipsis.
- Konten kosong (misal, artikel hanya gambar): tetap ditampilkan.
- Komentar sangat panjang: di-collapse dengan “Baca selengkapnya”.
- Nama pengguna unicode: harus didukung penuh.

---

## 8. INTERAKSI & MIKRO-INTERAKSI

- **Hover pada kartu**: skala 1.02 dan bayangan naik.
- **Tombol like/dislike**: animasi “pop” kecil, warna berubah sesuai status.
- **Submit formulir**: tombol berubah menjadi spinner, lalu toast sukses muncul.
- **Notifikasi lonceng**: getaran kecil pada badge saat ada notifikasi baru (opsional jika browser mendukung).
- **Drag and drop menu**: transisi mulus, indikator drop zone.
- **Modal**: muncul dengan animasi fade-in dan slide-up, tutup dengan fade-out.

Semua animasi tidak lebih dari 300ms untuk menjaga performa dan tidak mengganggu.

---

## 9. AKSESIBILITAS (ACCESSIBILITY)

- **Semua gambar** memiliki atribut `alt` yang deskriptif.
- **Kontras warna** memenuhi WCAG AA (diuji dengan plugin).
- **Navigasi keyboard**: semua interaktif dapat diakses via tab, fokus terlihat jelas.
- **ARIA label** untuk ikon yang tidak disertai teks (misal, lonceng notifikasi: `aria-label="Notifikasi"`).
- **Formulir**: setiap input memiliki `<label>` yang terasosiasi.
- **Skip to content**: tautan di awal halaman untuk langsung ke konten utama (tersembunyi, muncul saat fokus).
- **Toast** menggunakan `role="alert"` atau `role="status"` agar dibacakan oleh screen reader.
- **Modal** menerapkan trap fokus dan menutup dengan Escape.

---

## 10. ALUR PENGGUNA (USER FLOWS)

**Alur Registrasi & Kontribusi** (User Journey sederhana):
1. Guest mendarat di landing page → klik “Daftar”.
2. Isi formulir → verifikasi email → login.
3. Dashboard → klik “Tulis Artikel”.
4. Pilih template (opsional) → isi konten → “Submit”.
5. Artikel masuk antrean moderasi.
6. Notifikasi: diterima/revisi.
7. (Jika revisi) perbaiki & submit ulang.
8. (Jika disetujui) artikel tayang, lihat di profil, badge diperoleh.

**Alur Moderasi**:
1. Mod login → lihat antrean review.
2. Buka artikel → baca → pilih: “Terbitkan” atau “Revisi” (isi catatan) atau “Tolak”.
3. Notifikasi otomatis ke penulis.

**Alur Admin mengubah pengaturan**:
1. Admin login → sidebar “Pengaturan”.
2. Ubah field, simpan → langsung berlaku.

---

## 11. PROTOTIPE & HANDOFF

- Desain high‑fidelity dibuat di **Figma** dengan komponen dan style guide.
- Handoff menggunakan fitur **Figma Dev Mode** atau **Zeplin** untuk mendapatkan spesifikasi (warna, ukuran, margin) dan kode CSS siap pakai.
- Semua ikon diekspor dalam format SVG.
- Aset desain (logo, gambar placeholder) disediakan di folder `assets/`.

---

**Dokumen ini disusun sebagai acuan lengkap implementasi UI/UX. Setiap penyimpangan harus didiskusikan dengan Product Owner dan UI/UX designer.**