# PRODUCT REQUIREMENTS DOCUMENT (PRD)  
## Knowledge Management System (KMS) COCONEXUS v2.0  
### Platform Manajemen Pengetahuan Pengelolaan Limbah Buah Kelapa untuk UMKM  

---

**Versi Dokumen**: 2.0 (Super Ultra Lengkap)  
**Tanggal**: 22 Juni 2026  
**Status**: Final  
**Pemilik Produk**: Tim Pengembang COCONEXUS  
**Penyusun**: Senior System Analyst  

---

# DOKUMEN SEJARAH PERUBAHAN

| Versi | Tanggal | Penulis | Deskripsi Perubahan |
|-------|---------|---------|---------------------|
| 1.0 | 01 Juni 2026 | Tim Awal | Dokumen PRD awal dengan fitur dasar |
| 2.0 | 22 Juni 2026 | Senior Analyst | Penambahan fitur kolaboratif, interaksi sosial, notifikasi, admin lanjut |

---

# DAFTAR ISI

1. **IKHTISAR EKSEKUTIF**
2. **VISI & STRATEGI PRODUK**
3. **TUJUAN & METRIK KEBERHASILAN**
4. **PERSONA PENGGUNA**
5. **USER STORIES & KRITERIA PENERIMAAN**
   - 5.1 Guest
   - 5.2 Pengguna UMKM
   - 5.3 Moderator Konten
   - 5.4 Admin
6. **KEBUTUHAN FUNGSIONAL (DETAIL)**
7. **KEBUTUHAN NON‑FUNGSIONAL**
8. **GAMBARAN ARSITEKTUR SISTEM**
9. **PEMODELAN DATA & SKEMA DATABASE**
10. **SPESIFIKASI API (RINGKAS)**
11. **PERSYARATAN UI/UX**
12. **KEAMANAN**
13. **PERFORMA & SKALABILITAS**
14. **MONITORING & ANALITIK**
15. **AKSESIBILITAS & INTERNASIONALISASI**
16. **MANAJEMEN RISIKO**
17. **ASUMSI & KETERGANTUNGAN**
18. **MILESTONE & LINIMASA**
19. **LAMPIRAN**

---

# 1. IKHTISAR EKSEKUTIF

COCONEXUS adalah platform Knowledge Management System (KMS) berbasis web yang dirancang untuk membantu UMKM agroindustri kelapa di Indonesia mengelola, berbagi, dan mendokumentasikan pengetahuan tentang diversifikasi limbah kelapa. Sistem ini mengubah pengetahuan tacit (pengalaman pribadi) menjadi explicit (dokumen terstruktur) melalui siklus manajemen pengetahuan partisipatif.

Versi 2.0 memperluas peran pengguna biasa menjadi **kontributor aktif**. Fitur baru mencakup:
- Pengiriman artikel oleh UMKM (*user submission*)
- Alur review terstruktur dengan catatan moderator
- Interaksi sosial (voting, bookmark, report)
- Pusat notifikasi real-time
- Gamifikasi lencana
- Panel administrasi lanjut (recycle bin, pengaturan sistem, manajer menu)

Dokumen ini adalah acuan utama bagi tim pengembang, QA, dan pemangku kepentingan untuk membangun sistem sesuai kebutuhan.

---

# 2. VISI & STRATEGI PRODUK

**Visi Produk**  
Menjadi ekosistem pembelajaran sirkular terdepan yang memberdayakan ribuan UMKM kelapa Indonesia untuk berkolaborasi dan berinovasi dari limbah.

**Strategi**  
- **Bawah‑Atas**: Membuka kanal resmi bagi UMKM untuk mendokumentasikan praktik lapangan mereka.
- **Kurasi Berkualitas**: Moderator dan mekanisme voting menjaga kredibilitas konten.
- **Keterlibatan Berkelanjutan**: Notifikasi, gamifikasi, dan personalisasi mendorong retensi.

---

# 3. TUJUAN & METRIK KEBERHASILAN

| Tujuan Bisnis | Metrik Kunci (6 bulan pertama) |
|---------------|--------------------------------|
| Membangun repositori kolaboratif | 50 artikel, ≥30% berasal dari kontribusi UMKM |
| Mendorong partisipasi | ≥200 voting per bulan, 100 artikel dibookmark |
| Meningkatkan kualitas diskusi | ≥80% komentar disetujui tanpa laporan |
| Retensi pengguna | 60% pengguna kembali dalam 7 hari setelah notifikasi |
| Kepuasan pengguna | Skor SUS (System Usability Scale) ≥ 75 |

---

# 4. PERSONA PENGGUNA

**1. Guest (Pengunjung)**  
- Tidak login, hanya bisa membaca 50% konten dan melihat komentar.
- Tujuan: menemukan informasi awal, lalu terdorong mendaftar.

**2. Pelaku UMKM (Pengguna Terdaftar)**  
- Nama: Budi, pemilik usaha kecil pengolahan kelapa.
- Kebutuhan: belajar teknik baru, berbagi pengalaman, bertanya, menilai kualitas artikel.
- Karakteristik: melek teknologi dasar, akses internet via ponsel.

**3. Moderator Konten**  
- Nama: Rina, akademisi/praktisi yang bertugas menjaga mutu konten.
- Tugas: mereview kiriman artikel, memoderasi komentar, menyusun template.

**4. Admin**  
- Nama: Andi, pengelola sistem.
- Tugas: konfigurasi situs, mengelola pengguna, memulihkan data, memantau keamanan.

---

# 5. USER STORIES & KRITERIA PENERIMAAN

*(Semua cerita pengguna disusun dalam format “Sebagai … saya ingin … sehingga …” disertai kriteria terukur.)*

## 5.1 Guest

| ID | Cerita Pengguna | Kriteria Penerimaan |
|----|-----------------|---------------------|
| G‑01 | Sebagai Guest, saya ingin melihat daftar artikel publik agar bisa mencari informasi. | 1. Halaman `/articles` menampilkan artikel berstatus **Published** saja.<br>2. Setiap artikel menampilkan: judul, penulis, tanggal, jumlah like, jumlah komentar.<br>3. Pencarian berfungsi pada judul dan konten. |
| G‑02 | Sebagai Guest, saya ingin membaca hanya 50% konten artikel agar saya termotivasi mendaftar. | 1. Setelah paragraf ke‑X (50% panjang konten), muncul overlay bertuliskan “Daftar untuk melanjutkan membaca”.<br>2. Tombol “Daftar” dan “Login” tersedia di overlay. |
| G‑03 | Sebagai Guest, saya ingin melihat komentar yang disetujui agar bisa mengikuti diskusi. | 1. Komentar dengan status **approved** tampil di bawah artikel.<br>2. Tidak ada form komentar untuk Guest. |
| G‑04 | Sebagai Guest, saya ingin membagikan artikel ke media sosial. | 1. Tombol share (WhatsApp, Facebook, Twitter) tersedia.<br>2. Link yang dibagikan membuka halaman artikel. |

## 5.2 Pengguna UMKM

| ID | Cerita Pengguna | Kriteria Penerimaan |
|----|-----------------|---------------------|
| U‑01 | **Registrasi & Login**<br>Sebagai Pengguna, saya ingin mendaftar dan login agar bisa mengakses fitur penuh. | 1. Form registrasi: email, password (min 8 karakter), nama tampilan.<br>2. Email verifikasi dikirim; akun aktif setelah verifikasi.<br>3. Login menggunakan email dan password. |
| U‑02 | **Submit Artikel**<br>Sebagai Pengguna, saya ingin mengirimkan artikel pengetahuan agar pengalaman saya bisa dibagikan. | 1. Tombol “Tulis Artikel” di dashboard.<br>2. Form: judul, konten (WYSIWYG), pilih kategori, tag, unggah gambar (opsional).<br>3. Setelah submit, status otomatis **Submitted**; muncul di “Artikel Saya”. |
| U‑03 | **Voting**<br>Sebagai Pengguna, saya ingin memberi like/dislike artikel untuk menilai kualitasnya. | 1. Tombol like/dislike di setiap artikel.<br>2. Satu pengguna hanya bisa satu suara; dapat diubah.<br>3. Jumlah like dan dislike diperbarui secara real-time. |
| U‑04 | **Bookmark**<br>Sebagai Pengguna, saya ingin menyimpan artikel ke daftar bacaan agar bisa dibaca nanti. | 1. Tombol “Simpan” di detail artikel.<br>2. Artikel tersimpan muncul di halaman “Bacaan Saya”.<br>3. Dapat dihapus kapan saja. |
| U‑05 | **Komentar & Balasan**<br>Sebagai Pengguna, saya ingin berkomentar dan membalas komentar lain. | 1. Form komentar di bawah artikel (harus login).<br>2. Balasan menggunakan struktur nested (indentasi).<br>3. Komentar baru berstatus **Pending** sampai disetujui moderator. |
| U‑06 | **Report**<br>Sebagai Pengguna, saya ingin melaporkan konten yang melanggar. | 1. Tautan “Laporkan” di setiap artikel dan komentar.<br>2. Form singkat: pilih alasan (Spam, Tidak Pantas, Info Salah, Lainnya).<br>3. Laporan masuk ke antrean moderasi. |
| U‑07 | **Notifikasi**<br>Sebagai Pengguna, saya ingin menerima notifikasi jika komentar saya dibalas atau artikel saya direview. | 1. Ikon lonceng di header menampilkan jumlah belum dibaca.<br>2. Notifikasi terbaru: balasan komentar, status artikel (disetujui/revisi), artikel baru dari yang diikuti.<br>3. Notifikasi bisa diklik menuju konten terkait. |
| U‑08 | **Profil & Badge**<br>Sebagai Pengguna, saya ingin melihat profil dan lencana saya. | 1. Halaman profil: avatar, bio, jumlah artikel diterbitkan, badge.<br>2. Badge otomatis diberikan saat kriteria tercapai (misal: 1 artikel diterbitkan → “Kontributor Pemula”). |
| U‑09 | **Ikuti Penulis**<br>Sebagai Pengguna, saya ingin mengikuti kontributor favorit. | 1. Tombol “Ikuti” di profil penulis.<br>2. Artikel baru dari yang diikuti muncul di notifikasi atau feed khusus. |

## 5.3 Moderator Konten

| ID | Cerita Pengguna | Kriteria Penerimaan |
|----|-----------------|---------------------|
| M‑01 | **Review Queue**<br>Sebagai Moderator, saya ingin melihat antrean artikel yang menunggu review. | 1. Halaman “Review Queue” menampilkan tabel artikel berstatus **Submitted** atau **Review**.<br>2. Setiap baris: judul, penulis, tanggal submit, aksi (Tinjau). |
| M‑02 | **Review & Review Notes**<br>Sebagai Moderator, saya ingin menyetujui atau mengembalikan artikel dengan catatan. | 1. Saat “Tinjau”, tampil artikel penuh.<br>2. Tombol “Terbitkan” langsung ubah status ke Published.<br>3. Tombol “Revisi” membuka modal catatan wajib, lalu status berubah ke **Revision** dan notifikasi dikirim ke penulis. |
| M‑03 | **Template Konten**<br>Sebagai Moderator, saya ingin membuat template artikel. | 1. Halaman “Template” dengan CRUD.<br>2. Template berisi kerangka teks (dapat disertakan placeholder `{variabel}`).<br>3. Saat penulis membuat artikel, dapat memilih template dari dropdown, konten terisi otomatis. |
| M‑04 | **Moderasi Komentar & Laporan**<br>Sebagai Moderator, saya ingin menyetujui/menolak komentar dan menangani laporan. | 1. Halaman “Komentar” menampilkan semua komentar dengan status (Pending/Approved/Rejected).<br>2. Aksi: Approve/Reject per komentar.<br>3. Tab “Laporan” menampilkan artikel/komentar yang dilaporkan, dengan aksi “Abaikan” atau “Hapus”. |
| M‑05 | **Kelola Forum**<br>Sebagai Moderator, saya ingin menyematkan dan mengunci topik. | 1. Di halaman topik forum, tersedia tombol Pin/Unpin dan Lock/Unlock.<br>2. Topik terkunci tidak bisa dibalas. |

## 5.4 Admin

| ID | Cerita Pengguna | Kriteria Penerimaan |
|----|-----------------|---------------------|
| A‑01 | **Recycle Bin**<br>Sebagai Admin, saya ingin melihat dan memulihkan data yang dihapus. | 1. Halaman “Recycle Bin” menampilkan data yang di-soft delete (artikel, komentar, pengguna).<br>2. Setiap item memiliki tombol “Restore” dan info penghapus & waktu.<br>3. Data di recycle bin otomatis dihapus permanen setelah 30 hari. |
| A‑02 | **System Settings**<br>Sebagai Admin, saya ingin mengubah konfigurasi umum situs. | 1. Halaman “Pengaturan” dengan input: Nama Situs, Deskripsi, Logo, Favicon, Artikel per Halaman, Mode Pemeliharaan.<br>2. Perubahan langsung berefek di frontend. |
| A‑03 | **Menu Manager**<br>Sebagai Admin, saya ingin mengelola item navigasi. | 1. Halaman “Menu” menampilkan struktur navigasi saat ini.<br>2. Dapat menambah, mengubah, menghapus, menyembunyikan, dan mengurutkan (drag-and-drop).<br>3. Tersedia opsi parent untuk submenu. |
| A‑04 | **Manajemen Pengguna & Peran**<br>Sebagai Admin, saya ingin mengelola semua akun. | 1. Tabel pengguna: email, nama, peran, status, aksi (edit, nonaktifkan, hapus).<br>2. Dapat mengubah peran (Guest → User → Mod → Admin). |
| A‑05 | **Audit Log**<br>Sebagai Admin, saya ingin melihat riwayat aktivitas. | 1. Halaman log dengan filter: tanggal, aksi, pengguna.<br>2. Menampilkan: waktu, pengguna, aksi, deskripsi, IP. |
| A‑06 | **Backup Database**<br>Sebagai Admin, saya ingin mencadangkan database dari panel. | 1. Tombol “Backup Sekarang” menghasilkan file SQL dan menyimpannya di server (dapat diunduh).<br>2. Riwayat backup terlihat dengan opsi unduh. |

---

# 6. KEBUTUHAN FUNGSIONAL (DETAIL)

*(Daftar seluruh kebutuhan fungsional, dikelompokkan berdasarkan modul, lengkap dengan prioritas dan deskripsi singkat.)*

| ID | Modul | Kebutuhan | Prioritas | Detail |
|----|-------|-----------|-----------|--------|
| FR‑AUTH‑01 | Auth | Registrasi pengguna baru | High | Email unik, password (bcrypt), verifikasi email. |
| FR‑AUTH‑02 | Auth | Login/logout | High | JWT token (access + refresh). |
| FR‑ART‑01 | Artikel | CRUD artikel (Mod/Admin) | High | Draft, edit, hapus. |
| FR‑ART‑02 | Artikel | User submission | **High** | Pengguna dapat submit; otomatis status “Submitted”. |
| FR‑ART‑03 | Artikel | Workflow status | High | Draft → Submitted → Review → Revision → Published / Rejected / Archived. |
| FR‑ART‑04 | Artikel | Review Queue (Moderator) | **High** | Tampil artikel berstatus Submitted/Review. |
| FR‑ART‑05 | Artikel | Review Notes | **High** | Moderator wajib menulis catatan saat revisi/reject. |
| FR‑ART‑06 | Artikel | Preview 50% untuk Guest | High | Overlay setelah paragraf ke‑50% konten. |
| FR‑ART‑07 | Artikel | Pencarian & filter | High | Berdasarkan judul, konten, kategori, tag. |
| FR‑CAT‑01 | Kategori | CRUD kategori | High | Tidak bisa hapus jika masih ada artikel. |
| FR‑CAT‑02 | Template | CRUD template artikel | Medium | Moderator/admin; dapat dipilih saat buat artikel. |
| FR‑SOC‑01 | Interaksi | Voting artikel | **High** | Like/dislike, satu suara per pengguna per artikel. |
| FR‑SOC‑02 | Interaksi | Bookmark | High | Simpan/lihat/hapus artikel dari daftar bacaan. |
| FR‑SOC‑03 | Interaksi | Report konten | Medium | Laporkan artikel/komentar; masuk antrean moderasi. |
| FR‑COM‑01 | Komentar | CRUD komentar bersarang | High | Nested, dengan parent_id. |
| FR‑COM‑02 | Komentar | Moderasi komentar | High | Approve/reject komentar oleh moderator. |
| FR‑FOR‑01 | Forum | Topik diskusi | High | Buat, lihat, balas topik. |
| FR‑FOR‑02 | Forum | Pin/Lock topik | Medium | Hanya moderator. |
| FR‑NOT‑01 | Notifikasi | Pusat notifikasi | **High** | Notifikasi real-time (polling/SSE) untuk balasan, review, follow. |
| FR‑GAM‑01 | Gamifikasi | Badge otomatis | Medium | Lencana berdasarkan kriteria aktivitas. |
| FR‑ADM‑01 | Admin | Recycle Bin | **High** | Lihat & restore data soft‑deleted. |
| FR‑ADM‑02 | Admin | System Settings | High | Konfigurasi umum via UI. |
| FR‑ADM‑03 | Admin | Menu Manager | Medium | Kelola item menu navigasi. |
| FR‑ADM‑04 | Admin | Backup database | Medium | Backup manual dari panel. |
| FR‑ADM‑05 | Admin | Audit log | High | Log semua aktivitas penting. |

---

# 7. KEBUTUHAN NON‑FUNGSIONAL

| Aspek | Persyaratan |
|-------|------------|
| **Usability** | - Antarmuka responsif, mobile‑first.<br>- Navigasi intuitif, waktu belajar minimal (<5 menit untuk tugas dasar). |
| **Performa** | - Waktu muat halaman < 2 detik (p95).<br>- API response < 300 ms (p95).<br>- Mendukung 500 concurrent user. |
| **Keamanan** | - Enkripsi password bcrypt (cost 12).<br>- JWT expiry 15 menit (access), 7 hari (refresh).<br>- Validasi & sanitasi semua input.<br>- CORS ketat, CSP header.<br>- Rate limiting pada login (5 percobaan/menit) dan API. |
| **Reliability** | - Uptime 99.5% (tidak termasuk pemeliharaan terjadwal).<br>- Backup database harian otomatis + manual.<br>- Disaster recovery plan (RTO < 4 jam, RPO < 1 jam). |
| **Maintainability** | - Kode modular, dokumentasi API (OpenAPI/Swagger).<br>- Unit test coverage ≥80% (fungsi inti).<br>- Logging terstruktur (JSON). |
| **Kompatibilitas** | - Browser modern (Chrome, Firefox, Safari, Edge dua versi terakhir).<br>- Dukungan perangkat seluler (viewport ≥320px). |

---

# 8. GAMBARAN ARSITEKTUR SISTEM

Sistem menggunakan arsitektur **Three‑Tier**:
- **Frontend**: Vue.js 3 SPA, Tailwind CSS, Pinia state management.
- **Backend**: Node.js + Express.js, REST API.
- **Database**: MySQL 8, Sequelize ORM.

Komponen kunci:
- `Notification Service`: event‑driven, menggunakan polling atau SSE untuk push notifikasi.
- `Voting & Bookmark Service`: logika bisnis terpisah.
- `Audit Logger`: middleware yang mencatat aksi penting ke tabel audit_logs.
- `File Storage`: lokal (development) / object storage (produksi).

*(Diagram arsitektur sama seperti di dokumen perencanaan, ditambahkan modul notifikasi dan cache Redis opsional.)*

---

# 9. PEMODELAN DATA & SKEMA DATABASE

*(Dijelaskan seluruh tabel dengan kolom, tipe, constraint, dan relasi.)*

**Tabel Utama (13 tabel)**:
1. **roles** (id, nama)
2. **users** (id, email, password, role_id, status, last_login, created_at, updated_at, deleted_at)
3. **user_profiles** (id, user_id, display_name, bio, avatar_path, job_title, department, division)
4. **articles** (id, title, slug, author_id, status, submission_status, review_notes, view_count, published_at, created_at, updated_at, deleted_at)
5. **article_details** (id, article_id, content, sections JSON, sources JSON)
6. **category_tags** (id, name, slug, description, created_at)
7. **article_category** (article_id, category_id) – pivot
8. **article_media** (id, article_id, file_path, file_type, caption)
9. **comments** (id, article_id, user_id, parent_id, content, status, created_at, updated_at, deleted_at)
10. **votes** (id, user_id, article_id, vote_type ENUM('like','dislike'), created_at, UNIQUE(user_id, article_id))
11. **bookmarks** (id, user_id, article_id, created_at, UNIQUE(user_id, article_id))
12. **notifications** (id, user_id, type VARCHAR, data JSON, read_at, created_at)
13. **audit_logs** (id, user_id, action, entity_type, entity_id, description, ip_address, created_at)

**Tabel Admin‑Only**:
14. **system_settings** (key VARCHAR PK, value TEXT)
15. **menu_items** (id, label, url, icon, parent_id, sort_order, is_visible, target)

**Tabel Forum** (sederhana):
16. **forum_topics** (id, title, content, user_id, category_id, is_pinned, is_locked, created_at, updated_at)
17. **forum_replies** (id, topic_id, user_id, content, created_at)

**Tabel Badge**:
18. **badges** (id, name, description, icon, criteria JSON)
19. **user_badges** (id, user_id, badge_id, awarded_at)

**Relasi**: one‑to‑many, many‑to‑many dengan foreign key dan indeks yang sesuai.

---

# 10. SPESIFIKASI API (RINGKAS)

Seluruh API menggunakan REST dengan base URL `/api/v1`. Autentikasi via header `Authorization: Bearer <token>`.

| Metode | Endpoint | Deskripsi | Role |
|--------|----------|-----------|------|
| POST | `/auth/register` | Registrasi | Public |
| POST | `/auth/login` | Login | Public |
| GET | `/articles/published` | Daftar artikel published | Public |
| GET | `/articles/:id` | Detail artikel (full jika login, 50% jika guest) | Public |
| POST | `/articles/submit` | Kirim artikel baru | User, Mod |
| GET | `/moderator/review-queue` | Antrean review | Mod |
| PUT | `/moderator/articles/:id/review` | Approve/Revisi | Mod |
| POST | `/articles/:id/vote` | Like/dislike | User |
| POST | `/articles/:id/bookmark` | Simpan ke bacaan | User |
| GET | `/notifications` | Daftar notifikasi | User |
| GET | `/admin/recycle-bin` | Data terhapus | Admin |
| PUT | `/admin/settings` | Update konfigurasi | Admin |
| … | *(lengkap ada di dokumentasi OpenAPI terpisah)* | | |

---

# 11. PERSYARATAN UI/UX

**Prinsip Desain**:
- **Mobile‑first**: Komponen dioptimasi untuk layar kecil, lalu desktop.
- **Konsistensi**: Warna hijau (#2D6A4F) sebagai primer, abu‑abu netral.
- **Umpan Balik**: Setiap aksi menampilkan toast notifikasi (sukses/gagal).
- **Aksesibilitas**: Kontras warna WCAG AA, label form jelas, navigasi keyboard.

**Wireframe Kunci** (dijelaskan secara tekstual):
- **Landing Page**: Hero dengan judul platform, statistik (jumlah artikel, pengguna), artikel terbaru, kategori.
- **Detail Artikel**: konten dengan tombol like/bookmark di samping, kolom komentar di bawah.
- **Review Queue**: tabel dengan status dan aksi tinjau.
- **Dashboard Pengguna**: ringkasan artikel sendiri, bookmark, badge.
- **Notification Center**: dropdown dari ikon lonceng, daftar 5 notifikasi terbaru.

*(Semua wireframe detail dan prototype akan disediakan oleh UI/UX designer di Figma.)*

---

# 12. KEAMANAN

- Semua endpoint dilindungi JWT, kecuali yang publik.
- Password di‑hash dengan bcrypt (salt rounds 12).
- Validasi input di sisi server (express‑validator) untuk mencegah XSS, SQL Injection.
- File upload: validasi ekstensi (hanya jpg, png, webp, pdf, mp4), scan virus (jika memungkinkan), simpan di direktori non‑public.
- CORS hanya mengizinkan origin yang ditentukan.
- Helmet.js untuk HTTP security headers.
- Rate limiting: 100 request per menit per IP untuk API umum; 5 percobaan login per menit.
- Data sensitif (password, token) tidak pernah dicatat di log.

---

# 13. PERFORMA & SKALABILITAS

- **Caching**: Endpoint artikel publik di‑cache selama 5 menit (Redis / in‑memory).
- **Pagination**: Semua daftar mengembalikan max 20 item per halaman.
- **Lazy Loading**: Gambar dan komentar dimuat saat diperlukan.
- **Database indexing**: indeks pada foreign key, slug, status, created_at.
- **Load testing**: sistem harus menangani 500 concurrent user dengan response time <500 ms.

---

# 14. MONITORING & ANALITIK

- **Application Monitoring**: Winston log dikirim ke file & console; error dikirim ke Sentry (opsional).
- **Server Monitoring**: CPU, RAM, disk via PM2 + dashboard sederhana.
- **Google Analytics** (jika disetujui) untuk traffic halaman publik.
- **Custom analytics**: view artikel, vote, bookmark direkam untuk dashboard admin.

---

# 15. AKSESIBILITAS & INTERNASIONALISASI

- **Aksesibilitas**: Semua gambar memiliki alt text; form memiliki label; navigasi mendukung keyboard; fokus indikator terlihat.
- **Bahasa**: Tahap awal hanya Bahasa Indonesia. Arsitektur frontend mendukung i18n (Vue I18n) untuk perluasan di masa depan.

---

# 16. MANAJEMEN RISIKO

| Risiko | Dampak | Probabilitas | Mitigasi |
|--------|--------|--------------|----------|
| Penyalahgunaan fitur voting (bot) | Menurunkan kepercayaan | Sedang | Rate limiting, satu suara per user, verifikasi email. |
| Konten spam/tidak pantas dari user submission | Menurunkan kualitas | Tinggi | Review ketat, fitur report, soft‑delete otomatis jika banyak laporan. |
| Server down saat trafik tinggi | Kehilangan akses | Rendah | Auto‑scaling (jika cloud), monitoring, backup server. |
| Kehilangan data | Kerugian besar | Rendah | Backup harian otomatis + manual, uji restore berkala. |

---

# 17. ASUMSI & KETERGANTUNGAN

**Asumsi**:
- Pengguna memiliki koneksi internet minimal 3G.
- Konten awal disediakan oleh tim pakar sebelum peluncuran.
- Tersedia dana operasional untuk hosting dan domain.

**Keterhubungan**:
- Tim pengembang menguasai Vue.js, Express, MySQL.
- Server produksi menggunakan Ubuntu dengan Node.js 20 LTS.
- SMTP server untuk pengiriman email verifikasi.

---

# 18. MILESTONE & LINIMASA

| Tahap | Durasi | Kiriman |
|-------|--------|---------|
| Foundation | Minggu 1‑4 | Auth, DB, API dasar |
| Manajemen Artikel & Kategori | Minggu 5‑8 | CRUD, workflow draft‑published |
| Upload & Profil | Minggu 9‑10 | Media, profil, avatar |
| **User Submission & Review** | Minggu 11‑14 | Submit, review queue, review notes |
| **Interaksi Sosial** | Minggu 15‑16 | Voting, bookmark, report |
| Forum & Notifikasi | Minggu 17‑18 | Forum, pin/lock, pusat notifikasi |
| Dashboard & Gamifikasi | Minggu 19‑20 | Dashboard semua role, badge |
| **Admin Lanjut** | Minggu 21‑22 | Recycle bin, settings, menu manager, backup |
| Frontend (semua) | Minggu 23‑26 | Seluruh UI terintegrasi |
| Testing & Perbaikan | Minggu 27‑28 | QA, UAT |
| Peluncuran | Minggu 29‑30 | Go‑live, pelatihan |

---

# 19. LAMPIRAN

**A. Glosarium**  
*(Sama seperti sebelumnya)*

**B. Referensi**  
*(Daftar pustaka dari dokumen awal)*

**C. Kriteria Penerimaan UAT**  
*(Disediakan dalam spreadsheet terpisah)*

**D. Dokumentasi API (OpenAPI)**  
*(Akan disediakan oleh backend developer)*

**E. Desain Database SQL Script**  
*(Akan disediakan oleh backend developer)*

---

**Dokumen ini telah disahkan dan menjadi acuan pengembangan KMS COCONEXUS v2.0.**  
*Setiap perubahan harus melalui proses change request yang disetujui Product Owner.*