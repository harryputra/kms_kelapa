# DOKUMEN PERENCANAAN PENGEMBANGAN SISTEM (REVISI FINAL)
## Knowledge Management System (KMS) COCONEXUS v2.0
### Platform Manajemen Pengetahuan Pengelolaan Limbah Buah Kelapa untuk UMKM

---

**Versi Dokumen**: 2.0 (Super Ultra Lengkap)
**Tanggal**: 22 Juni 2026
**Status**: Final (Approved for Development)
**Penyusun**: Senior System Analyst – Tim Pengembang COCONEXUS

---

# DAFTAR ISI (REVISI)

1. PENDAHULUAN  
   1.1 Latar Belakang  
   1.2 Tujuan Dokumen  
   1.3 Ruang Lingkup  
   1.4 Definisi dan Istilah  
2. GAMBARAN PROYEK  
   2.1 Visi dan Misi Proyek  
   2.2 Tujuan Sistem  
   2.3 Manfaat Sistem  
   2.4 Sasaran Pengguna  
   2.5 Asumsi dan Ketergantungan  
3. **ANALISIS KEBUTUHAN (REVISI TOTAL)**  
   3.1 Kebutuhan Pengguna (User Stories Lengkap)  
   3.2 Kebutuhan Fungsional (FR v2.0)  
   3.3 Kebutuhan Non-Fungsional  
   3.4 Kebutuhan Bisnis  
4. ARSITEKTUR SISTEM  
   4.1 Arsitektur Sistem Secara Keseluruhan  
   4.2 Arsitektur Frontend  
   4.3 Arsitektur Backend  
   4.4 Arsitektur Database  
   4.5 Arsitektur Integrasi  
5. **PERANCANGAN SISTEM (REVISI TOTAL)**  
   5.1 Perancangan Use Case (Extended)  
   5.2 Perancangan Basis Data (ERD Extended)  
   5.3 Perancangan Antarmuka Pengguna  
   5.4 **Perancangan Matriks Hak Akses (RBAC Extended)**  
   5.5 Perancangan Struktur Menu (Extended)  
   5.6 Perancangan Activity Diagram (Submission & Review)  
6. **SPESIFIKASI FITUR DETAIL (REVISI & TAMBAHAN)**  
   6.1 Manajemen Artikel (Extended Workflow + Submission)  
   6.2 Manajemen Kategori & Template  
   6.3 Manajemen Media dan Unggahan  
   6.4 Forum Diskusi (Community of Practice)  
   6.5 Komentar Bersarang & Interaksi Sosial  
   6.6 Statistik, Analitik, & Gamifikasi  
   6.7 Manajemen Pengguna dan Profil  
   6.8 Audit Log & Recycle Bin  
   6.9 **Pusat Notifikasi (Notification Center)**  
   6.10 **Konfigurasi Sistem & Menu Manager**  
7. SPESIFIKASI TEKNIS  
   7.1 Teknologi Frontend  
   7.2 Teknologi Backend  
   7.3 Teknologi Database  
   7.4 Teknologi Pendukung  
   7.5 Spesifikasi Lingkungan  
8. RENCANA PENGEMBANGAN  
   8.1 Metodologi Pengembangan  
   8.2 Sprint Planning dan Timeline (Extended)  
   8.3 Struktur Tim  
   8.4 Milestone dan Deliverable  
9. RENCANA PENGUJIAN  
   9.1 Unit Testing  
   9.2 Integration Testing  
   9.3 API Contract Testing  
   9.4 End-to-End Testing  
   9.5 Security Testing  
   9.6 Performance Testing  
   9.7 User Acceptance Testing (UAT)  
10. RENCANA DEPLOYMENT  
   10.1 Strategi Deployment  
   10.2 Lingkungan Deployment  
   10.3 CI/CD Pipeline  
   10.4 Rollback Strategy  
11. RENCANA PEMELIHARAAN DAN DUKUNGAN  
   11.1 Pemeliharaan Sistem  
   11.2 Dukungan Pengguna  
   11.3 Pembaruan dan Peningkatan  
12. MANAJEMEN RISIKO  
   12.1 Identifikasi Risiko  
   12.2 Analisis Risiko  
   12.3 Mitigasi Risiko  
13. **ANGGARAN DAN SUMBER DAYA (REVISI)**  
   13.1 Estimasi Anggaran  
   13.2 Kebutuhan Sumber Daya Manusia  
   13.3 Kebutuhan Infrastruktur  
14. LAMPIRAN  
   14.1 Glosarium  
   14.2 Referensi  

---

# 1. PENDAHULUAN

*(Tidak berubah dari dokumen awal, tetap disertakan untuk kelengkapan)*

## 1.1 Latar Belakang

Indonesia merupakan salah satu produsen kelapa terbesar di dunia… *(isi lengkap seperti sebelumnya)*.

## 1.2 Tujuan Dokumen

Dokumen Perencanaan Pengembangan Sistem (Revisi Final) ini bertujuan untuk:

1. Menyediakan panduan **super-ultra-lengkap** bagi seluruh pemangku kepentingan dalam pengembangan KMS COCONEXUS v2.0.
2. Mendokumentasikan secara rinci seluruh aspek perencanaan, termasuk **fitur-fitur baru hasil evaluasi kebutuhan pengguna dan analisis celah fungsional**.
3. Menjadi acuan mutlak bagi tim pengembang dalam implementasi sistem.
4. Memastikan keterlibatan seluruh pemangku kepentingan melalui dokumentasi yang transparan dan terstruktur.

## 1.3 Ruang Lingkup

Dokumen ini mencakup perencanaan pengembangan sistem KMS COCONEXUS yang telah **diperluas** dengan:

- Fitur **kontribusi pengguna (user submission)**
- Alur **review dan moderasi** konten
- Sistem **notifikasi dan gamifikasi**
- Panel **administrasi lanjut** (recycle bin, pengaturan sistem, menu manager)

Lingkup yang dikecualikan tetap sama: aplikasi mobile native, integrasi sistem eksternal, analisis kelayakan bisnis produk turunan, dan pelatihan lapangan langsung.

## 1.4 Definisi dan Istilah

| Istilah | Definisi |
|---------|----------|
| **KMS** | Knowledge Management System – Sistem manajemen pengetahuan |
| **CoP** | Community of Practice – Komunitas praktik |
| **UMKM** | Usaha Mikro, Kecil, dan Menengah |
| **Tacit Knowledge** | Pengetahuan implisit yang melekat pada individu |
| **Explicit Knowledge** | Pengetahuan eksplisit yang terdokumentasi |
| **User Submission** | Fitur di mana pengguna umum dapat mengirimkan artikel untuk direview |
| **Review Queue** | Antrean artikel yang menunggu tindakan moderator |
| **Review Notes** | Catatan yang diberikan moderator saat mengembalikan artikel untuk revisi |
| **Notification Center** | Pusat notifikasi dalam aplikasi yang memberi tahu pengguna tentang aktivitas relevan |
| **Recycle Bin** | Tempat penyimpanan data yang telah dihapus secara logis, bisa dipulihkan |
| **Voting** | Mekanisme like/dislike pada artikel untuk menilai kualitas |
| **Bookmark** | Fitur menyimpan artikel untuk dibaca nanti |
| **JWT** | JSON Web Token – Token autentikasi |
| **RBAC** | Role-Based Access Control – Kontrol akses berbasis peran |

---

# 2. GAMBARAN PROYEK

*(Sebagian besar tetap sama, dengan penyesuaian tujuan sistem untuk mencerminkan fitur baru)*

## 2.1 Visi dan Misi Proyek

**Visi**:
Mewujudkan ekosistem pembelajaran dan kolaborasi yang **partisipatif dan berkelanjutan** bagi pelaku UMKM agroindustri kelapa, di mana setiap pelaku dapat berkontribusi pengetahuan dan bersama-sama mendorong ekonomi sirkular.

**Misi**:
1. Menyediakan repositori pengetahuan digital **dua arah** (top-down dari pakar dan bottom-up dari UMKM).
2. Memfasilitasi interaksi dan berbagi pengetahuan melalui forum diskusi dan **fitur sosial (voting, berbagi, notifikasi)**.
3. Mendorong adopsi prinsip ekonomi sirkular melalui **keterlibatan aktif komunitas**.
4. Mengubah pengetahuan implisit menjadi eksplisit yang terdokumentasi dan **dapat dikurasi bersama**.

## 2.2 Tujuan Sistem

| No | Tujuan | Indikator Keberhasilan |
|----|--------|----------------------|
| 1 | Menyediakan repositori teknis **kolaboratif** | Minimal 50 artikel **termasuk 15 dari kontribusi UMKM** dalam 6 bulan pertama |
| 2 | Mengimplementasikan siklus Knowledge Management yang **partisipatif** | Seluruh tahap KM (discovery, creation, organization, dissemination, utilization) terimplementasi, dengan **knowledge creation dari pengguna** |
| 3 | Memfasilitasi kolaborasi dan penilaian kualitas konten | Rata-rata 20 voting per artikel, 80% artikel berlabel “bermanfaat” |
| 4 | Menyediakan fitur Community of Practice yang **responsif dan terkelola** | Forum diskusi aktif, semua topik termoderasi dalam 24 jam |
| 5 | Meningkatkan retensi pengguna melalui personalisasi dan notifikasi | 60% pengguna kembali dalam 7 hari setelah notifikasi |

## 2.3 Manfaat Sistem

*(Sama seperti sebelumnya, ditambah poin:)*

- Memberikan **kesempatan bagi UMKM untuk menjadi kontributor pengetahuan**, bukan sekadar konsumen.
- Menyediakan **umpan balik terstruktur** (voting) sehingga konten berkualitas lebih mudah ditemukan.

## 2.4 Sasaran Pengguna

| No | Kategori Pengguna | Deskripsi | Estimasi |
|----|-------------------|-----------|----------|
| 1 | Admin | Pengelola sistem penuh | 2-3 orang |
| 2 | Moderator Konten | Pengelola konten dan forum | 5-10 orang |
| 3 | **Pengguna Umum (UMKM)** | Pelaku UMKM agroindustri kelapa, **sekaligus kontributor** | 500-1000 orang |
| 4 | Guest | Pengunjung tidak terdaftar | Tidak terbatas |

---

# 3. ANALISIS KEBUTUHAN (REVISI TOTAL)

Bagian ini menggantikan seluruh Bab 3 sebelumnya, mencakup user stories, kebutuhan fungsional, non-fungsional, dan bisnis yang telah diperluas.

## 3.1 Kebutuhan Pengguna (User Stories Lengkap)

### 3.1.1 Guest (Pengunjung Tidak Terdaftar)

| ID | Sebagai | Saya ingin | Sehingga | Prioritas |
|----|---------|------------|----------|-----------|
| G-01 | Guest | Melihat daftar artikel publik | Saya bisa menemukan informasi pengolahan kelapa | High |
| G-02 | Guest | Mencari artikel dengan kata kunci | Saya cepat menemukan topik spesifik | High |
| G-03 | Guest | Melihat komentar yang telah disetujui | Saya bisa melihat diskusi komunitas | Medium |
| G-04 | Guest | **Membaca hanya 50% konten artikel** (preview) | Saya tertarik untuk mendaftar agar bisa membaca penuh | High |
| G-05 | Guest | Membagikan artikel ke WhatsApp/Facebook | Saya bisa menyebarkan informasi bermanfaat | Medium |
| G-06 | Guest | Melihat jumlah vote dan komentar pada artikel | Saya bisa menilai popularitas artikel | Low |

### 3.1.2 Pengguna Umum (UMKM) – **Diperluas Signifikan**

| ID | Sebagai | Saya ingin | Sehingga | Prioritas |
|----|---------|------------|----------|-----------|
| U-01 | User | Mendaftar dan login dengan email | Saya bisa mengakses fitur lengkap | High |
| U-02 | User | **Mengirimkan draft artikel pengetahuan** | Saya bisa berbagi pengalaman praktik saya | **High** |
| U-03 | User | **Memberi like/dislike pada artikel** | Saya bisa menilai kualitas konten | High |
| U-04 | User | **Melaporkan artikel/komentar yang melanggar** | Saya bisa menjaga komunitas tetap sehat | Medium |
| U-05 | User | **Menyimpan artikel ke daftar bacaan (Bookmark)** | Saya bisa membaca nanti | High |
| U-06 | User | **Melihat riwayat artikel yang pernah saya baca** | Saya bisa melanjutkan pembelajaran | Low |
| U-07 | User | **Menerima notifikasi** (balasan komentar, artikel saya disetujui/direvisi) | Saya tidak ketinggalan interaksi | High |
| U-08 | User | Mengedit profil dan avatar saya | Identitas saya jelas di komunitas | High |
| U-09 | User | Mengikuti kontributor lain (Follow) | Saya mendapat update dari penulis favorit | Medium |
| U-10 | User | **Melihat lencana/badge saya** | Saya termotivasi untuk berkontribusi | Medium |

### 3.1.3 Moderator Konten

| ID | Sebagai | Saya ingin | Sehingga | Prioritas |
|----|---------|------------|----------|-----------|
| M-01 | Mod | **Melihat antrean review artikel (Review Queue)** | Saya bisa memproses kiriman dari pengguna | **High** |
| M-02 | Mod | **Menulis catatan reviewer (Review Notes) saat mengembalikan artikel** | Penulis tahu alasan pasti dan bisa memperbaiki | **High** |
| M-03 | Mod | Membuat, mengedit, dan mempublikasikan artikel sendiri | Saya bisa menyediakan konten resmi | High |
| M-04 | Mod | **Mengelola template artikel** (misal: template “Cara Membuat Briket”) | Penulisan konten standar dan mudah | Medium |
| M-05 | Mod | Memoderasi komentar (approve/reject) | Diskusi tetap berkualitas | High |
| M-06 | Mod | **Menyematkan (pin) topik forum** | Topik penting mudah ditemukan | Medium |
| M-07 | Mod | **Mengunci topik forum** | Diskusi yang sudah selesai tidak melebar | Medium |
| M-08 | Mod | Melihat statistik artikel yang saya kelola | Saya bisa mengevaluasi performa konten | Medium |

### 3.1.4 Admin

| ID | Sebagai | Saya ingin | Sehingga | Prioritas |
|----|---------|------------|----------|-----------|
| A-01 | Admin | **Melihat Recycle Bin dan memulihkan data yang terhapus** | Saya bisa menyelamatkan data dari kesalahan hapus | **High** |
| A-02 | Admin | **Mengubah konfigurasi sistem** (logo, nama situs, deskripsi) | Tampilan situs bisa disesuaikan tanpa coding | High |
| A-03 | Admin | **Mengelola menu navigasi** (menambah, menyembunyikan, mengurutkan) | Saya bisa menyesuaikan struktur situs | Medium |
| A-04 | Admin | Mengelola semua pengguna dan peran | Kontrol penuh terhadap akses | High |
| A-05 | Admin | Melihat audit log lengkap | Saya bisa melacak semua aktivitas penting | High |
| A-06 | Admin | **Melakukan backup database dari panel admin** | Keamanan data lebih terjamin | Medium |
| A-07 | Admin | Mengelola seluruh kategori dan template | Standarisasi konten | High |

## 3.2 Kebutuhan Fungsional (Functional Requirements v2.0)

*(Mencakup seluruh fitur awal + tambahan, diberi kode baru untuk menghindari kebingungan)*

### 3.2.1 Manajemen Autentikasi dan Pengguna

| ID | Kebutuhan Fungsional | Prioritas |
|----|---------------------|-----------|
| FR-001 | Registrasi akun baru (email, password) | High |
| FR-002 | Login dan logout | High |
| FR-003 | Autentikasi JWT | High |
| FR-004 | Lihat dan edit profil sendiri | High |
| FR-005 | Soft delete pengguna (oleh admin) | Medium |
| FR-006 | Manajemen peran pengguna (admin) | High |
| **FR-007** | **Upload avatar** | Medium |

### 3.2.2 Manajemen Artikel (Extended)

| ID | Kebutuhan Fungsional | Prioritas |
|----|---------------------|-----------|
| FR-101 | Membuat, mengedit, menghapus artikel (moderator/admin) | High |
| FR-102 | Alur kerja: Draft → Submitted → Review → Revision → Published → Archived | High |
| **FR-103** | **Pengguna umum dapat mengirimkan artikel (User Submission)** – status otomatis "Submitted" | **High** |
| **FR-104** | **Review Queue**: Moderator melihat daftar artikel yang menunggu review | **High** |
| **FR-105** | **Review Notes**: Moderator wajib menulis catatan jika mengembalikan artikel untuk revisi | **High** |
| FR-106 | Menampilkan artikel lengkap (full content) hanya untuk pengguna login; guest melihat 50% | High |
| FR-107 | Pencarian artikel berdasarkan judul, konten, kategori, tag | High |
| FR-108 | Slug otomatis dari judul | Medium |

### 3.2.3 Kategori, Tag, dan Template

| ID | Kebutuhan Fungsional | Prioritas |
|----|---------------------|-----------|
| FR-201 | CRUD kategori (admin/moderator) | High |
| FR-202 | Tag artikel (banyak ke banyak) | Medium |
| **FR-203** | **Template Artikel**: Moderator dapat membuat template konten yang bisa dipilih saat menulis artikel | Medium |
| FR-204 | Kategori tidak bisa dihapus jika masih memiliki artikel | Medium |

### 3.2.4 Interaksi Sosial dan Komentar

| ID | Kebutuhan Fungsional | Prioritas |
|----|---------------------|-----------|
| FR-301 | Komentar bersarang (nested) dengan parent_id | High |
| FR-302 | Moderasi komentar (approve/reject/pending) | High |
| **FR-303** | **Voting artikel (like/dislike)** – satu suara per pengguna per artikel | **High** |
| **FR-304** | **Bookmark artikel** – simpan ke daftar bacaan | High |
| **FR-305** | **Laporkan konten (Report)** – artikel atau komentar yang melanggar | Medium |
| FR-306 | Tampilkan jumlah like/dislike dan komentar di daftar artikel | Medium |

### 3.2.5 Forum Diskusi (CoP)

| ID | Kebutuhan Fungsional | Prioritas |
|----|---------------------|-----------|
| FR-401 | Buat, lihat, balas topik forum | High |
| FR-402 | **Pin/unpin topik** oleh moderator | Medium |
| FR-403 | **Lock/unlock topik** oleh moderator | Medium |
| FR-404 | Subscribe topik untuk notifikasi | Medium |

### 3.2.6 Notifikasi

| ID | Kebutuhan Fungsional | Prioritas |
|----|---------------------|-----------|
| **FR-501** | **Pusat notifikasi in-app** (ikon lonceng) menampilkan notifikasi terbaru | **High** |
| **FR-502** | Notifikasi ketika komentar dibalas | High |
| **FR-503** | Notifikasi ketika artikel yang disubmit disetujui/direvisi | High |
| **FR-504** | Notifikasi ketika artikel yang di-follow terbit | Medium |
| **FR-505** | Tandai notifikasi sudah dibaca | Medium |

### 3.2.7 Statistik, Analitik, dan Gamifikasi

| ID | Kebutuhan Fungsional | Prioritas |
|----|---------------------|-----------|
| FR-601 | Dashboard statistik untuk admin, moderator, dan pengguna | High |
| FR-602 | View counter artikel | High |
| FR-603 | **Tampilkan badge/lencana di profil pengguna** (Penulis Aktif, Komentator, dll.) | Medium |
| FR-604 | Statistik populer berdasarkan like | Medium |

### 3.2.8 Administrasi Lanjut (Admin Only)

| ID | Kebutuhan Fungsional | Prioritas |
|----|---------------------|-----------|
| **FR-701** | **Recycle Bin**: melihat data yang di-soft-delete (artikel, komentar) dan memulihkan | **High** |
| **FR-702** | **System Settings**: mengubah site name, logo, favicon, meta description | High |
| **FR-703** | **Menu Manager**: menambah, mengedit, mengurutkan, menyembunyikan menu navigasi | Medium |
| **FR-704** | **Backup database** via UI (admin) | Medium |
| FR-705 | Audit log lengkap dengan filter | High |

## 3.3 Kebutuhan Non-Fungsional

*(Tidak banyak berubah, hanya ditambah yang berkaitan dengan fitur baru)*

- **Usability**: Antarmuka tetap intuitif; notifikasi tidak mengganggu.
- **Performance**: Notifikasi real-time tidak menambah beban signifikan; daftar notifikasi dimuat terpisah.
- **Security**: Token JWT expire pendek; perlindungan terhadap vote abuse (satu suara per pengguna); validasi file upload.
- **Reliability**: Data di Recycle Bin harus terlindungi; backup otomatis.

## 3.4 Kebutuhan Bisnis

| ID | Kebutuhan Bisnis | Prioritas |
|----|------------------|-----------|
| BR-001 | Mendukung pertumbuhan pengguna hingga 2000 di tahun pertama | High |
| BR-002 | 30% konten berasal dari UMKM dalam 12 bulan | High |
| BR-003 | Akses gratis untuk pelaku UMKM | High |
| BR-004 | Model keberlanjutan melalui kemitraan | Medium |

---

# 4. ARSITEKTUR SISTEM

*(Tidak berubah signifikan, hanya menambahkan komponen baru di application layer)*

Arsitektur tetap three-tier: presentation (Vue.js, Tailwind), application (Express.js + middleware), data (MySQL). Komponen baru:

- **Notification Service** (bagian dari backend, menggunakan event emitter untuk push notifikasi)
- **Voting Service** (logika vote)
- **Bookmark Service**

API endpoint baru akan ditambahkan: `/api/submissions`, `/api/notifications`, `/api/admin/settings`, dll.

---

# 5. PERANCANGAN SISTEM (REVISI TOTAL)

## 5.1 Perancangan Use Case (Extended)

### 5.1.1 Aktor Sistem

| Aktor | Deskripsi |
|-------|-----------|
| Admin | Pengelola sistem penuh |
| Moderator | Pengelola konten dan forum |
| Pengguna | Pelaku UMKM terdaftar |
| Guest | Pengunjung tidak terdaftar |

### 5.1.2 Use Case Diagram (Extended)

**Use Case Baru** (ditambahkan dari versi awal):

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         SISTEM KMS COCONEXUS v2.0                         │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                    MANAJEMEN ARTIKEL (Extended)                     │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │ Submit       │  │ Review Queue │  │ Write Review │              │   │
│  │  │ Article      │  │ (Moderator)  │  │ Notes        │              │   │
│  │  │ (User)       │  │              │  │              │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                    INTERAKSI SOSIAL                                 │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │ Vote Article │  │ Bookmark     │  │ Report       │              │   │
│  │  │ (Like/Dislike│  │ Article      │  │ Content      │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                    NOTIFIKASI                                       │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │ View         │  │ Mark as Read │  │ Receive      │              │   │
│  │  │ Notifications│  │              │  │ Notifications│              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                    ADMINISTRASI LANJUT                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │ System       │  │ Menu Manager │  │ Recycle Bin  │              │   │
│  │  │ Settings     │  │              │  │ (Restore)    │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
├──────────────────────────────────────────────────────────────────────────┤
│  AKTOR: [Admin] [Moderator] [Pengguna] [Guest]                            │
└──────────────────────────────────────────────────────────────────────────┘
```

### 5.1.3 Skenario Use Case Kunci (Baru/Revisi)

**UC-NEW: User Submission & Review Workflow**

| Elemen | Deskripsi |
|--------|-----------|
| Aktor | Pengguna (UMKM), Moderator |
| Prekondisi | Pengguna login; sistem dalam mode publik |
| Alur Utama | 1. Pengguna klik “Tulis Artikel”. 2. Mengisi form (judul, konten, kategori). 3. Submit → status “Submitted”. 4. Moderator masuk Review Queue, melihat artikel. 5. Jika layak, Moderator klik “Approve” → status “Published”, notifikasi ke penulis. 6. Jika perlu revisi, Moderator tulis Review Notes, status “Revision”. 7. Penulis menerima notifikasi, mengedit, submit ulang. |
| Postkondisi | Artikel terbit atau kembali ke penulis untuk revisi. |

## 5.2 Perancangan Basis Data (ERD Extended)

### 5.2.1 Entity Relationship Diagram (Extended)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  ┌─────────┐      ┌─────────────┐      ┌─────────────────┐                 │
│  │  roles  │──────│    users    │──────│  user_profiles  │                 │
│  └─────────┘ 1   *└─────────────┘ 1   1└─────────────────┘                 │
│                     │                                                       │
│                     │ 1                                                     │
│                     │                                                       │
│                     ▼                                                       │
│              ┌─────────────┐      ┌─────────────────┐                      │
│              │  articles   │──────│ article_details │                      │
│              └─────────────┘ 1   1└─────────────────┘                      │
│                     │                                                       │
│                     │ 1                                                     │
│          ┌─────────┼─────────┬─────────┬──────────┐                       │
│          │         │         │         │          │                       │
│          ▼         ▼         ▼         ▼          ▼                       │
│  ┌─────────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │category_tags│ │article_ │ │ product_│ │  comments   │ │  votes      │ │
│  └─────────────┘ │ media   │ │  cards  │ └─────────────┘ └─────────────┘ │
│                  └─────────┘ └─────────┘       │                         │
│                                                │                         │
│                              ┌─────────────────┼─────────────────────┐   │
│                              │                 │                     │   │
│                              ▼                 ▼                     ▼   │
│                    ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│                    │ notifications│  │  bookmarks   │  │  article_views  │ │
│                    └──────────────┘  └──────────────┘  └─────────────────┘ │
│                                                                              │
│  ┌─────────────────┐                                                         │
│  │  audit_logs     │                                                         │
│  └─────────────────┘                                                         │
│                                                                              │
│  (Admin-only tables)                                                         │
│  ┌─────────────────┐  ┌─────────────────────┐                               │
│  │ system_settings │  │  menu_items         │                               │
│  └─────────────────┘  └─────────────────────┘                               │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 5.2.2 Skema Tabel Baru/Penyesuaian

**Tabel: votes**  
Mendukung fitur like/dislike.

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | INT PK | |
| user_id | INT FK | Pengguna yang vote |
| article_id | INT FK | Artikel yang divote |
| vote_type | ENUM('like', 'dislike') | |
| created_at | DATETIME | |
| *UNIQUE(user_id, article_id)* | | Satu suara per artikel |

**Tabel: bookmarks**  

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | INT PK | |
| user_id | INT FK | |
| article_id | INT FK | |
| created_at | DATETIME | |
| *UNIQUE(user_id, article_id)* | | |

**Tabel: notifications**  

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | INT PK | |
| user_id | INT FK | Penerima notifikasi |
| type | VARCHAR | reply, article_approved, article_revision, dll. |
| data | JSON | Data terkait (misal: article_id, comment_id) |
| read_at | DATETIME NULL | |
| created_at | DATETIME | |

**Tabel: system_settings** (key-value)  

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| key | VARCHAR PK | site_name, site_logo, dll. |
| value | TEXT | |

**Tabel: menu_items**  

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | INT PK | |
| label | VARCHAR | Nama menu |
| url | VARCHAR | |
| icon | VARCHAR | |
| parent_id | INT NULL | Untuk submenu |
| sort_order | INT | |
| is_visible | BOOLEAN | |
| target | VARCHAR | _self, _blank |

**Artikel** – tambahkan kolom `submission_status` ENUM('draft','submitted','review','revision','published','archived','rejected') dan `review_notes` TEXT.

## 5.4 Perancangan Matriks Hak Akses (RBAC Extended)

| Fitur | Guest | Pengguna | Moderator | Admin |
|-------|-------|----------|-----------|-------|
| Baca artikel (full) | ❌ (50% preview) | ✅ | ✅ | ✅ |
| Lihat komentar (approved) | ✅ | ✅ | ✅ | ✅ |
| **Submit artikel** | ❌ | ✅ | ✅ | ✅ |
| **Review Queue** | ❌ | ❌ | ✅ | ✅ |
| **Tulis Review Notes** | ❌ | ❌ | ✅ | ✅ |
| **Vote artikel** | ❌ | ✅ | ✅ | ✅ |
| **Bookmark** | ❌ | ✅ | ✅ | ✅ |
| **Report konten** | ❌ | ✅ | ✅ | ✅ |
| **Notification Center** | ❌ | ✅ | ✅ | ✅ |
| **Lihat Badge** | ❌ | ✅ | ✅ | ✅ |
| **Manage Template** | ❌ | ❌ | ✅ | ✅ |
| **Pin/Lock Topik** | ❌ | ❌ | ✅ | ✅ |
| **Recycle Bin (Restore)** | ❌ | ❌ | ❌ | ✅ |
| **System Settings** | ❌ | ❌ | ❌ | ✅ |
| **Menu Manager** | ❌ | ❌ | ❌ | ✅ |
| **Backup Database** | ❌ | ❌ | ❌ | ✅ |
| Kelola pengguna | ❌ | ❌ | ❌ | ✅ |

## 5.6 Perancangan Activity Diagram

*(Selain diagram sebelumnya, tambahkan diagram penting untuk workflow submission)*

### Activity Diagram: User Submission & Review Workflow

*(Sama seperti yang ditampilkan di bagian evaluasi sebelumnya, dimasukkan kembali secara lengkap di sini)*

```
┌──────────────────────────────────────────────────────────────────────────┐
│              ACTIVITY DIAGRAM - SUBMISSION & REVIEW WORKFLOW             │
├──────────────────────────────────────────────────────────────────────────┤
│  [Start]                                                                 │
│     │                                                                     │
│     ▼                                                                     │
│  ┌─────────────────────────┐                                             │
│  │ User: Tulis Draft       │                                             │
│  └─────────────────────────┘                                             │
│     │                                                                     │
│     ▼                                                                     │
│  ┌─────────────────────────┐                                             │
│  │ User: Submit for Review │                                             │
│  └─────────────────────────┘                                             │
│     │                                                                     │
│     ▼                                                                     │
│  ┌─────────────────────────┐                                             │
│  │ Sistem: Set status      │                                             │
│  │ "Submitted", masuk      │                                             │
│  │ Review Queue            │                                             │
│  └─────────────────────────┘                                             │
│     │                                                                     │
│     ▼                                                                     │
│  ┌─────────────────────────┐                                             │
│  │ Moderator: Buka         │                                             │
│  │ Antrean Review          │                                             │
│  └─────────────────────────┘                                             │
│     │                                                                     │
│     ▼                                                                     │
│  ┌─────────────────────────────────────┐                                 │
│  │         [Decision]                  │                                 │
│  │  Apakah artikel layak terbit?       │                                 │
│  └─────────────────────────────────────┘                                 │
│     │                    │                                               │
│     │ Ya                 │ Tidak                                         │
│     ▼                    ▼                                               │
│  ┌──────────────────┐  ┌────────────────────────────────────────────┐    │
│  │ Approve & Publish│  │ Moderator: Tulis Review Notes (Catatan)    │    │
│  │ Status: Published│  │ Set status: "Revision"                     │    │
│  └──────────────────┘  └────────────────────────────────────────────┘    │
│     │                    │                                               │
│     ▼                    ▼                                               │
│  ┌──────────────────┐  ┌──────────────────┐                             │
│  │ Notifikasi ke    │  │ Notifikasi ke    │                             │
│  │ User: "Disetujui"│  │ User: "Revisi"   │                             │
│  └──────────────────┘  └──────────────────┘                             │
│     │                    │                                               │
│     ▼                    ▼                                               │
│  [End]              ┌─────────────────────────┐                          │
│                      │ User: Edit Artikel &    │                          │
│                      │ Submit Ulang            │                          │
│                      └─────────────────────────┘                          │
│                            │                                              │
│                            ▼                                              │
│                      [Kembali ke Review]                                  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

# 6. SPESIFIKASI FITUR DETAIL (REVISI & TAMBAHAN)

## 6.1 Manajemen Artikel (Extended Workflow + Submission)

### 6.1.1 Alur Kerja Detail

| Status | Deskripsi | Siapa yang bisa mengubah |
|--------|-----------|--------------------------|
| **Draft** | Disimpan sendiri, belum dikirim. | Penulis (Mod/User) |
| **Submitted** | Dikirim oleh penulis untuk direview. | User/Mod; Moderator bisa ambil tindakan |
| **Review** | Sedang dalam proses review oleh moderator. | Moderator |
| **Revision** | Dikembalikan ke penulis dengan catatan perbaikan. | Penulis (setelah edit, submit ulang otomatis ke Submitted) |
| **Published** | Artikel tayang untuk publik. | Moderator/Admin |
| **Rejected** | Ditolak permanen (disertai alasan). | Moderator/Admin |
| **Archived** | Artikel lama yang tidak ditampilkan di beranda. | Moderator/Admin |

### 6.1.2 Fitur User Submission

- Setiap pengguna terdaftar dapat mengakses tombol “Tulis Artikel” di dashboard.
- Form standar: judul, konten (rich text), kategori, tag, gambar utama.
- Setelah submit, artikel muncul di **Review Queue** moderator dengan status “Submitted”.
- Penulis dapat melihat status artikelnya di “Artikel Saya”.

### 6.1.3 Fitur Review Queue (Moderator)

- Tampilan tabel dengan kolom: Judul, Penulis, Tanggal Submit, Status.
- Aksi: **Lihat Detail**, **Approve** (langsung publish), **Revisi** (tampilkan form Review Notes).
- Review Notes wajib diisi sebelum mengubah status ke Revision atau Rejected.
- Notifikasi otomatis ke penulis.

## 6.2 Manajemen Kategori & Template

### 6.2.1 Template Artikel

- Moderator dapat membuat template konten di panel “Template”.
- Template berisi kerangka artikel (misal: pendahuluan, alat & bahan, langkah-langkah, hasil, tips).
- Saat membuat artikel, penulis dapat memilih template, sehingga konten awal langsung terisi.
- Template bisa memiliki placeholder (misal: `{nama_produk}`) untuk diisi.

## 6.5 Komentar Bersarang & Interaksi Sosial

### 6.5.1 Voting Artikel (Like/Dislike)

- Pengguna yang login dapat menekan tombol like atau dislike pada setiap artikel.
- Satu pengguna hanya satu suara per artikel (dapat diubah).
- Total like dan dislike ditampilkan di bawah judul.
- Artikel dengan like tinggi dapat masuk ke halaman “Artikel Terpopuler”.

### 6.5.2 Bookmark

- Tombol “Simpan ke Bacaan” di detail artikel.
- Daftar artikel yang dibookmark tersedia di dashboard pengguna.
- Dapat dihapus kapan saja.

### 6.5.3 Report Konten

- Tautan “Laporkan” di setiap artikel dan komentar.
- Form singkat: alasan (pilih: spam, tidak pantas, informasi salah, lainnya).
- Laporan masuk ke antrean moderasi khusus (panel moderator) atau langsung ke admin.

## 6.6 Statistik, Analitik, & Gamifikasi

### 6.6.1 Badge/Lencana

| Nama Badge | Kriteria |
|------------|----------|
| **Kontributor Pemula** | Mengirimkan 1 artikel disetujui |
| **Penulis Aktif** | 5 artikel diterbitkan |
| **Komentator Handal** | 20 komentar disetujui |
| **Pemberi Suara** | Memberi 50 like |
| **Pembelajar Rajin** | Membaca 30 artikel |

Badge ditampilkan di profil pengguna dan di samping nama pada komentar.

## 6.7 Manajemen Pengguna dan Profil

*(Termasuk follow/unfollow kontributor lain – tambahkan tabel `follows`)*

## 6.8 Audit Log & Recycle Bin

### 6.8.1 Recycle Bin

- Semua penghapusan (soft delete) dari artikel, komentar, pengguna masuk ke Recycle Bin.
- Admin dapat melihat daftar item yang dihapus, lengkap dengan metadata (siapa yang menghapus, kapan).
- Tersedia tombol **Restore** untuk mengembalikan data.
- Data di Recycle Bin otomatis dihapus permanen setelah 30 hari (opsi).

## 6.9 Pusat Notifikasi (Notification Center)

- Ikon lonceng di header dengan badge jumlah notifikasi belum dibaca.
- Dropdown menampilkan 5 notifikasi terbaru, klik “Lihat Semua” ke halaman notifikasi penuh.
- Jenis notifikasi sudah dijelaskan di bagian 3.2.6.
- Notifikasi dibuat secara otomatis melalui sistem event (observer pattern di backend).

## 6.10 Konfigurasi Sistem & Menu Manager

### 6.10.1 System Settings

Halaman admin dengan form:

| Key | Deskripsi | Tipe Input |
|-----|-----------|------------|
| `site_name` | Nama situs | text |
| `site_description` | Meta description | textarea |
| `site_logo` | Logo header | image upload |
| `favicon` | Ikon browser | image upload |
| `posts_per_page` | Artikel per halaman | number |
| `maintenance_mode` | Mode pemeliharaan | toggle |

Simpan sebagai key-value di tabel `system_settings`; cache di server untuk performa.

### 6.10.2 Menu Manager

Admin dapat:

- Menambah item menu baru (label, URL, ikon, parent, urutan, target).
- Drag & drop untuk mengurutkan.
- Menyembunyikan item tanpa menghapus.
- Pengaturan ini langsung mempengaruhi navigasi utama dan footer.

---

# 7. SPESIFIKASI TEKNIS

*(Penyesuaian kecil)*

Middleware baru:
- `notificationEmitter` – dipanggil setelah aksi seperti comment, review, dll.
- `voteLimiter` – memastikan satu suara per artikel.
- `adminOnly` – untuk rute pengaturan dan recycle bin.

---

# 8. RENCANA PENGEMBANGAN (Extended)

## 8.2 Sprint Planning dan Timeline (Extended – 24 Minggu)

Dengan penambahan fitur, timeline diperpanjang menjadi 24 minggu (12 sprint @ 2 minggu).

| Sprint | Fokus | Deliverable Utama |
|--------|-------|-------------------|
| 1-2 | Foundation (Auth, DB, Setup) | (seperti awal) |
| 3-4 | Manajemen Artikel Dasar | CRUD artikel, kategori, draft-publish |
| 5-6 | Upload & Profil | Media upload, profil |
| 7-8 | **User Submission & Review Workflow** | Submit artikel, review queue, review notes, notifikasi terkait |
| 9-10 | Komentar & Interaksi Sosial | Nested comments, voting, bookmark, report, notifikasi |
| 11-12 | Forum CoP (Extended) | Pin/lock, subscribe |
| 13-14 | Dashboard & Statistik | Dashboard masing-masing role, gamifikasi (badge) |
| 15-16 | Administrasi Lanjut | Recycle bin, system settings, menu manager, backup UI |
| 17-18 | Frontend – Halaman Publik & Artikel | Landing, daftar, detail, preview 50% |
| 19-20 | Frontend – Dashboard & Manajemen | Dashboard pengguna, form submission, notifikasi |
| 21-22 | Frontend – Admin & Moderator | Panel admin lengkap, review queue, settings |
| 23 | Testing & Bug Fixing | Seluruh pengujian |
| 24 | UAT & Deployment | Finalisasi, go-live |

*(Struktur tim dan milestone disesuaikan dengan timeline baru)*

---

# 9. RENCANA PENGUJIAN (Extended)

Tambahkan skenario pengujian untuk fitur baru:

- **User Submission**: Kirim artikel, muncul di review queue, moderator approve/reject, notifikasi ke penulis.
- **Voting**: Like/dislike, validasi satu suara per pengguna.
- **Bookmark**: Simpan, lihat di dashboard.
- **Report**: Laporkan artikel, masuk ke panel moderator.
- **Recycle Bin**: Hapus artikel, muncul di recycle bin, restore.
- **Notification**: Pastikan notifikasi muncul real-time (bisa menggunakan polling atau WebSocket).
- **Settings & Menu**: Perubahan setting langsung berefek di frontend.

---

# 10. RENCANA DEPLOYMENT

*(Tidak ada perubahan berarti)*

---

# 11. RENCANA PEMELIHARAAN

*(Tambahkan: Backup database otomatis setiap hari + fitur backup manual admin)*

---

# 12. MANAJEMEN RISIKO

*(Tambah risiko: Abuse fitur voting/report; mitigasi dengan rate limiting dan moderasi)*

---

# 13. ANGGARAN DAN SUMBER DAYA (REVISI)

### 13.1 Estimasi Anggaran (Revisi)

| Komponen | Estimasi Revisi | Keterangan |
|----------|-----------------|------------|
| SDM (12 bulan, 8 orang) | Rp 240.000.000 | Termasuk full-stack, QA, DevOps |
| Infrastruktur (1 tahun) | Rp 25.000.000 | Server sedikit lebih tinggi untuk notifikasi real-time |
| Tools & Lisensi | Rp 5.000.000 | |
| Konten Awal | Rp 10.000.000 | |
| **Total** | **Rp 280.000.000** | |

### 13.2 Kebutuhan SDM (Revisi)

| Peran | Jumlah | Keterangan |
|-------|--------|------------|
| Project Manager | 1 | |
| Scrum Master | 1 | |
| Frontend Developer | 2 | |
| Backend Developer | 2 | |
| UI/UX Designer | 1 | |
| QA Engineer | 1 | |
| DevOps Engineer | 1 | |

---

# 14. LAMPIRAN

*(Glosarium dan Referensi diperbarui sesuai)*

---

**Dokumen ini telah disetujui dan siap didistribusikan ke seluruh tim pengembang.**

*Versi 2.0 Super Ultra Lengkap – mencakup seluruh evaluasi dan penyempurnaan oleh Senior System Analyst.*