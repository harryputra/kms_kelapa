# KONSEP DIFERENSIASI — COCONEXUS KMS v2.0
## Sistem Informasi Manajemen Pengetahuan Pengelolaan Limbah Buah Kelapa
### Repositori Teknis & Kolaborasi untuk UMKM Agroindustri

---

**Versi**: 1.0
**Tanggal**: 22 Juni 2026
**Status**: Disepakati (arah pengembangan)
**Sifat dokumen**: Konsep produk + desain fitur pembeda + bingkai novelty penelitian

> Dokumen ini melengkapi `prd.md`, `perancangan_sistem.md`, dan `rencana_pengembangan.md`.
> Tujuannya menjadikan sistem **berbeda secara mencolok** dari KMS pasaran, dengan titik berat
> pada **repositori teknis** dan **kolaborasi UMKM** sesuai tujuan penelitian.

---

## 0. RINGKASAN KEPUTUSAN

| Aspek | Keputusan |
|---|---|
| **Objek pengetahuan utama** | **Cetak Biru Teknis** (terstruktur) — menggantikan "artikel teks bebas" |
| **Artikel lama** | Tetap hidup, dialihfungsikan menjadi **"Wawasan/Cerita"** (naratif pendukung) |
| **Pilar pembeda** | Keempatnya dibangun: (1) Repositori teknis hidup, (2) Validasi & penyempurnaan kolektif, (3) Simbiosis industri, (4) UMKM-first + Asisten AI |
| **Pendekatan** | Frontend-first, mock-first (lanjut dari `apps/web` yang sudah ada), bertahap A→D |

**Reframe inti:**
> Dari *"blog tentang limbah kelapa"* → menjadi **"mesin pengetahuan operasional ekonomi sirkular kelapa"**: setiap pengetahuan adalah **objek teknis terstruktur, terhitung secara ekonomi, dan tervalidasi lapangan oleh komunitas UMKM.**

---

## 1. MASALAH YANG DIBEDAKAN

KMS pasaran (dan versi kita saat ini) memperlakukan pengetahuan sebagai **dokumen naratif**. Konsekuensinya:

- ❌ Tidak bisa **dihitung** (UMKM tidak tahu modal/untungnya).
- ❌ Tidak bisa **dibandingkan** (mana teknik paling murah/mudah?).
- ❌ Tidak bisa **divalidasi** (benarkah resep ini berhasil di lapangan?).
- ❌ Tidak benar-benar **teknis** (tak ada parameter, takaran, mutu, K3).
- ❌ Nilai diukur dangkal (*like/views*), bukan kebermanfaatan nyata.

Pembeda kita menjawab kelima titik itu sekaligus.

---

## 2. MODEL PENGETAHUAN BARU: "CETAK BIRU TEKNIS"

Inti pembeda. Pengetahuan bukan paragraf, melainkan **objek terstruktur, sebagian machine-readable**, sehingga bisa dicari faceted, dihitung, dibandingkan, divalidasi, dan dieksekusi sebagai checklist.

### 2.1 Anatomi Cetak Biru Teknis

| Blok | Isi | Kegunaan |
|---|---|---|
| **Identitas** | Judul, ringkasan, penulis, status, kematangan | Header & kepercayaan |
| **Bahan Baku (Limbah)** | Jenis limbah (sabut/tempurung/air/ampas), kondisi, jumlah acuan | Filter & kalkulator |
| **Produk Keluaran** | Nama produk, kategori, foto contoh | Navigasi Pohon Nilai |
| **Alat & Bahan** | Daftar item + kuantitas + **opsi murah/mahal** + estimasi harga | Kalkulator modal |
| **Langkah** | Urutan ternomor; tiap langkah: deskripsi, **durasi, suhu, takaran**, foto/voice | **Mode Praktik (checklist)** |
| **Parameter Mutu** | Indikator (mis. kadar air, nilai kalor) + cara uji sederhana | Standar hasil |
| **K3 / Keselamatan** | Risiko (asap CO, panas, bahan kimia) + mitigasi | Tanggung jawab |
| **Ekonomi** | Modal alat, biaya produksi/batch, kapasitas, harga jual, **BEP & estimasi laba** | Kalkulator kelayakan |
| **Metadata** | Tingkat kesulitan, modal minimum, waktu, lokasi/varian, sumber referensi | Faceted search |
| **Validasi** | Jumlah replikasi, tingkat keberhasilan, galeri bukti | Kematangan |

### 2.2 Contoh konkret (ilustrasi) — *Briket Arang dari Tempurung Kelapa*

```
Bahan baku   : Tempurung kelapa kering 10 kg (kadar air < 15%)
Produk       : Briket arang (~3 kg)
Alat & bahan : Drum karbonisasi [murah: drum bekas ~Rp150rb | mahal: kiln ~Rp4jt],
               penumbuk/penggiling, cetakan, ayakan; perekat: tepung tapioka 5%
Langkah      : 1) Karbonisasi tempurung (drum, ±2 jam)  ⏱ durasi
               2) Giling arang → serbuk halus            
               3) Campur perekat tapioka 5% + air        ⚖ takaran
               4) Cetak & padatkan
               5) Jemur 2–3 hari (kadar air < 8%)        ✅ parameter mutu
Mutu         : Kadar air < 8% · tidak mudah hancur · nyala stabil
K3           : Ventilasi (asap CO) · sarung tangan · jauhkan anak
Ekonomi      : Modal alat (drum) ~Rp200rb · biaya/batch ~Rp X · 
               harga briket ~Rp Y/kg · BEP ≈ Z batch
Kesulitan    : Sedang · Modal minimum: Rendah · Waktu: 3 hari
```

> Bandingkan dengan "artikel": semua angka di atas **terstruktur** → bisa difilter, dihitung ulang per skala, dan divalidasi.

### 2.3 Status & siklus
`draft → submitted → review → revision → published → archived`
(selaras state machine di `rencana_pengembangan.md` §5.4, ditambah dimensi **kematangan** di §4.4).

### 2.4 Cetak Biru vs Wawasan/Cerita

| | **Cetak Biru Teknis** | **Wawasan/Cerita** (eks-Artikel) |
|---|---|---|
| Bentuk | Terstruktur (resep teknis) | Naratif bebas |
| Tujuan | "Bagaimana membuat X" (eksekutabel) | Pengalaman, opini, studi kasus, tren pasar |
| Bisa dihitung/divalidasi? | Ya | Tidak |
| Contoh | "Briket dari tempurung" | "Kisah saya membangun UMKM cocopeat" |

---

## 3. PILAR 1 — REPOSITORI TEKNIS YANG HIDUP

### 3.1 Cetak Biru Teknis + Pencarian Faceted
Karena terstruktur, muncul pencarian yang mustahil di KMS biasa:
> *"Produk dari **tempurung**, modal **< Rp5jt**, kesulitan **rendah**, hasil **briket**, kematangan **tervalidasi**."*

Facet: jenis limbah · produk · modal minimum · tingkat kesulitan · waktu · kematangan · lokasi/varian.

### 3.2 Pohon Nilai Kelapa (ontologi + peta visual)
Navigasi dengan **menjelajah**, bukan menggulir daftar.

```
                       🥥 KELAPA
        ┌───────────┬───────────┬───────────┐
      Sabut      Tempurung     Air        Ampas
      │            │            │           │
   Cocopeat     Briket       Nata        Tepung
   Cocofiber    Arang aktif  Cuka        Pakan ternak
   Pot/media    Kerajinan    Minuman     Pangan
      │
   [Cetak Biru terkait + tingkat kematangan]
```

Tiap simpul → daftar Cetak Biru + meter kematangan. Ontologi ini sekaligus **artefak penelitian** (model domain limbah kelapa).

### 3.3 Kalkulator Kelayakan & Skala
Pilih Cetak Biru → isi *"limbah saya 200 kg/minggu"* → otomatis:
- skala bahan & alat,
- estimasi biaya produksi,
- potensi pendapatan & **titik impas (BEP)**, **ROI** kasar.

Mengubah pengetahuan menjadi **keputusan bisnis**. (Formula sederhana berbasis field "Ekonomi" pada Cetak Biru.)

### 3.4 Kematangan Pengetahuan (Knowledge Maturity)
Setiap Cetak Biru punya **tingkat kematangan** (badge + warna):

| Level | Nama | Syarat naik level |
|---|---|---|
| 1 | 🌱 Mentah | Baru dikirim/draft pengalaman |
| 2 | 🔍 Terkurasi | Disetujui moderator (akurasi & K3) |
| 3 | ✅ Tervalidasi Lapangan | ≥ N UMKM mereplikasi, mayoritas berhasil |
| 4 | 🏅 Standar Rujukan | Konsisten berhasil + ditetapkan moderator sebagai acuan |

Ini **metrik KM baru** (lihat §8) — kepercayaan berbasis **bukti lapangan**, bukan *like*.

---

## 4. PILAR 2 — VALIDASI & PENYEMPURNAAN KOLEKTIF

### 4.1 "Sudah Saya Praktikkan" (replikasi lapangan)
Pada tiap Cetak Biru, UMKM bisa membuat **Laporan Replikasi**:
- hasil: **berhasil / sebagian / gagal**,
- foto/voice bukti,
- modifikasi yang dilakukan, kendala, biaya nyata.

→ Memutakhirkan **meter kematangan** & galeri bukti: *"Tervalidasi 12 UMKM · 9 berhasil (75%)."*
Pembeda besar: pengetahuan **diuji komunitas**, bukan sekadar disukai.

### 4.2 Varian & Versi (penyempurnaan kolektif)
- **Varian daerah**: turunan resep (mis. *"Varian Sulawesi: tungku drum"*) tertaut ke induk.
- **Riwayat versi**: usulan perbaikan → review → versi baru, jejak perubahan tersimpan.
Pengetahuan **berevolusi**, bukan beku.

### 4.3 Tanya Pakar (Q&A terstruktur)
Bukan kolom komentar — Q&A bergaya tanya-jawab:
- pertanyaan tertaut ke Cetak Biru/produk,
- jawaban di-*upvote*, ada **"jawaban terbaik"**, badge **terverifikasi pakar** (moderator/akademisi),
- **reputasi kontributor** terakumulasi.
Pengetahuan tacit → eksplisit dan **mengendap**.

---

## 5. PILAR 3 — SIMBIOSIS INDUSTRI (kolaborasi ekonomi)

### 5.1 Bursa Limbah & Produk
Papan ringkas: *"Punya surplus 500 kg sabut/minggu"* ↔ *"Butuh tempurung untuk briket"*. Menautkan rantai nilai antar-UMKM (industrial symbiosis) — jantung ekonomi sirkular.

### 5.2 Direktori UMKM
Profil usaha: jenis limbah/produk, kapasitas, lokasi, kontak, Cetak Biru yang dikuasai. Mendukung kemitraan & rujukan.

### 5.3 Peta Sebaran
Peta sentra UMKM/limbah → menemukan mitra/pemasok/pembeli terdekat. (Mock dulu; integrasi peta ringan tanpa dependensi berat.)

---

## 6. PILAR 4 — UMKM-FIRST & ASISTEN AI

### 6.1 PWA Offline-first
Simpan Cetak Biru → baca **mode offline** di pabrik/lapangan tanpa sinyal. Sesuai realita UMKM (koneksi 3G). Install ke layar HP.

### 6.2 Mode Praktik & Aksesibilitas
- **Mode Praktik**: langkah jadi **checklist besar** + timer, ramah dipakai sambil bekerja.
- Langkah **bergambar / voice note** (literasi teknologi rendah).
- **Bahasa sederhana** + **glosarium istilah teknis inline** (tooltip: "karbonisasi", "decorticator").

### 6.3 Asisten AI "Tanya COCO" (opsional, Fase D)
Chat yang menjawab **HANYA dari repositori tervalidasi** (RAG) + **menyitir Cetak Biru sumber**:
> *"Modal 5 juta, limbah tempurung — produk apa yang cocok?"* → rekomendasi + tautan Cetak Biru + estimasi BEP.

Menutup siklus KM (*utilization*). Arsitektur ringan & opsional agar muat di lab (retrieval atas korpus Cetak Biru + sintesis via Claude Haiku; mati secara default, aktif bila API key tersedia). **Jaminan anti-halusinasi**: jawaban wajib bersumber pada objek pengetahuan internal.

---

## 7. KMS BIASA vs COCONEXUS (ringkasan pembeda)

| Aspek | KMS biasa | COCONEXUS |
|---|---|---|
| Bentuk pengetahuan | Artikel teks | **Cetak Biru Teknis** terstruktur |
| Navigasi | Daftar + kategori | **Pohon Nilai Kelapa** |
| Pencarian | Kata kunci | **Faceted** (modal/kesulitan/limbah/hasil) |
| Nilai | Like/views | **Kematangan + validasi lapangan** |
| Kolaborasi | Komentar/forum | "Sudah saya coba" + varian/versi + Q&A pakar |
| Output | Membaca | **Bertindak** (kalkulator BEP, checklist praktik) |
| Koneksi | — | **Bursa limbah + direktori + peta** |
| Akses | Web online | **PWA offline** + visual/voice + glosarium |
| Cerdas | — | **Asisten AI** ter-*grounding* ke repositori |

---

## 8. PEMETAAN KE TEORI KM (NOVELTY PENELITIAN)

### 8.1 Model SECI (Nonaka) terlihat di UX
| Mode SECI | Wujud di COCONEXUS |
|---|---|
| **Socialization** (tacit→tacit) | Tanya Pakar, forum, bursa/direktori |
| **Externalization** (tacit→eksplisit) | Menulis **Cetak Biru** & Laporan Replikasi |
| **Combination** (eksplisit→eksplisit) | Kurasi, **Pohon Nilai**, varian/versi, kalkulator |
| **Internalization** (eksplisit→tacit) | **Mode Praktik (checklist)**, offline, "sudah saya coba" |

### 8.2 Kontribusi yang dapat diklaim
1. **Model objek pengetahuan teknis terstruktur** + **ontologi domain limbah kelapa** (Pohon Nilai).
2. **Metrik "Kematangan Pengetahuan" berbasis validasi lapangan** (replikasi UMKM) — metrik KM baru.
3. **Integrasi simbiosis industri** ke dalam KMS (jembatan pengetahuan↔ekonomi sirkular).
4. **AI grounded** pada pengetahuan komunitas tervalidasi (bukan web umum).

### 8.3 Instrumen evaluasi (untuk bab hasil penelitian)
- Adopsi: jumlah Cetak Biru, % tervalidasi lapangan, jumlah Laporan Replikasi.
- Kolaborasi: rasio kontribusi UMKM, transaksi bursa, Q&A terjawab.
- Usability: **SUS ≥ 75**; task-success mode praktik.
- Dampak: estimasi UMKM yang menerapkan (self-report "sudah saya coba").

---

## 9. DAMPAK KE ARSITEKTUR & DATA (perluasan SDP)

Menambah **entitas baru** pada skema Prisma (`rencana_pengembangan.md` Lampiran A). Sketsa:

```
Blueprint            (id, title, slug, author, status, maturity, difficulty,
                      min_capital, est_time, waste_node_id, product_node_id, summary, ...)
BlueprintMaterial    (blueprint_id, name, qty, unit, option_tier[low|high], est_price)
BlueprintStep        (blueprint_id, order, text, duration, temperature, dose, media)
QualityParam         (blueprint_id, name, target, test_method)
SafetyNote           (blueprint_id, risk, mitigation)
EconomicModel        (blueprint_id, capital, cost_per_batch, batch_output, sell_price, bep)
ValueNode            (id, parent_id, type[waste|product|technique], name, icon)   ← Pohon Nilai
ReplicationReport    (blueprint_id, user_id, outcome[success|partial|fail], note, cost_real, media)
BlueprintVersion     (blueprint_id, version, changelog, author)   ← riwayat
BlueprintVariant     (parent_blueprint_id, region, blueprint_id)  ← varian daerah
Question / Answer     (Q&A terstruktur + best_answer + votes + verified)
ReputationEvent      (user_id, points, reason)
WasteListing         (umkm_id, kind[surplus|need], material, qty, location, contact)  ← bursa
UmkmProfile          (user_id, business_name, materials, products, capacity, location, geo)
```

Artikel lama → tetap (label "Wawasan/Cerita"). Tabel `votes/bookmarks/comments/notifications/...`
dipakai ulang lintas tipe (polymorphic `entity_type`).

**API baru** (ringkas): `/blueprints*`, `/blueprints/:id/replications`, `/value-tree`,
`/blueprints/:id/calc`, `/qa*`, `/exchange*`, `/directory*`, `/ai/ask`.

**Dampak frontend (yang sudah ada):** menambah rute & view (Cetak Biru list/detail/form,
Pohon Nilai, Kalkulator, Replikasi, Q&A, Bursa, Direktori, Peta, Asisten AI); store baru
(`blueprints`, `valueTree`, `exchange`); facade mock diperluas. Komponen UI eksisting
(card, modal, chip, dll.) dipakai ulang.

---

## 10. PETA LAYAR BARU (UX)

| Layar | Inti |
|---|---|
| **Pohon Nilai** (`/pohon-nilai`) | Peta interaktif limbah→produk→Cetak Biru |
| **Daftar Cetak Biru** (`/cetak-biru`) | Grid + **faceted filter** + badge kematangan |
| **Detail Cetak Biru** (`/cetak-biru/:id`) | Anatomi lengkap + tab: Langkah · Ekonomi · Mutu/K3 · Validasi · Varian · Q&A |
| **Mode Praktik** (`/cetak-biru/:id/praktik`) | Checklist langkah + timer, offline |
| **Form Cetak Biru** | Editor terstruktur (bukan WYSIWYG bebas) |
| **Kalkulator** (`/cetak-biru/:id/kalkulator`) | Input skala → biaya/BEP/laba |
| **Bursa Limbah** (`/bursa`) | Papan surplus ↔ kebutuhan |
| **Direktori & Peta** (`/direktori`, `/peta`) | Profil UMKM + sebaran |
| **Tanya Pakar** (`/tanya`) | Q&A + reputasi |
| **Asisten AI** (`/asisten`) | Chat grounded + sitasi |

---

## 11. ROADMAP IMPLEMENTASI (frontend-first, mock-first)

| Fase | Fokus | Keluaran |
|---|---|---|
| **A — Inti Repositori Teknis** | Model Cetak Biru, Pohon Nilai, faceted search, Kalkulator, Kematangan | Pembeda paling mencolok hidup; reframe artikel→Wawasan |
| **B — Validasi & Kolektif** | "Sudah Saya Praktikkan", varian/versi, Q&A pakar + reputasi | Kolaborasi yang memvalidasi pengetahuan |
| **C — Simbiosis Industri** | Bursa limbah, direktori UMKM, peta | Jembatan pengetahuan↔ekonomi |
| **D — UMKM-first + AI** | PWA offline, mode praktik, voice/glosarium, Asisten AI (RAG) | Aksesibilitas & kecerdasan |

Setiap fase: bangun di `apps/web` dengan mock, verifikasi di browser, commit. Backend (Express+Prisma)
menyusul dengan skema yang sudah diperluas di §9.

---

## 12. METRIK SUKSES PEMBEDA

- ≥ 30% Cetak Biru mencapai **Tervalidasi Lapangan** dalam 6 bulan.
- Rata-rata ≥ 3 Laporan Replikasi per Cetak Biru populer.
- ≥ 50 entri Bursa/Direktori (kolaborasi ekonomi terjadi).
- SUS ≥ 75; ≥ 60% pengguna mencoba **Mode Praktik**.

---

**Disepakati sebagai arah pengembangan. Implementasi mulai dari Fase A (frontend, mock-first),
melanjutkan `apps/web` yang sudah berjalan.**
