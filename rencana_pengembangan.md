# RENCANA PENGEMBANGAN PERANGKAT LUNAK (SDP)
## Knowledge Management System (KMS) COCONEXUS v2.0
### Platform Manajemen Pengetahuan Pengelolaan Limbah Buah Kelapa untuk UMKM

---

**Versi Dokumen**: 1.0
**Tanggal**: 22 Juni 2026
**Status**: Final (Approved for Development)
**Penyusun**: Tim Engineering COCONEXUS
**Klasifikasi**: Software Development Plan (SDP) — acuan tunggal tim engineering

> Dokumen ini adalah **jembatan eksekusi** antara dokumen *apa-yang-dibangun* (`prd.md`, `perancangan_sistem.md`, `api_dokumen.md`, `ui_design.md`) dan kode nyata. Ia menjawab **"bagaimana membangunnya secara profesional & enterprise"**: arsitektur repo, standar koding, data layer, keamanan, DevOps/CI-CD, testing, observability, deployment (khusus lab POLMAN), WBS/roadmap, manajemen risiko, dan Definition of Done.

---

# DAFTAR ISI

0. Ringkasan Keputusan & Cara Membaca Dokumen
1. Ikhtisar & Prinsip Engineering
2. Technology Stack & Rasional
3. Arsitektur Solusi
4. Struktur Monorepo
5. Backend — Arsitektur Layered & Modul
6. Data Layer (Prisma + MySQL)
7. Standar API & Kontrak
8. Frontend — Arsitektur & Design System
9. Keamanan (Baseline Global + OWASP)
10. Cross-cutting & Operasi Ringan (sadar 4 GB)
11. DevOps, Environment & Deployment
12. CI/CD & Quality Gates
13. Strategi Pengujian
14. Observability & Reliability
15. Manajemen Proyek & WBS
16. Manajemen Risiko
17. Performa, Skalabilitas & Aksesibilitas
18. Lampiran (A–H)

---

# 0. RINGKASAN KEPUTUSAN & CARA MEMBACA DOKUMEN

## 0.1 Keputusan Arsitektural yang Dikunci

| Aspek | Keputusan | Catatan |
|---|---|---|
| **Frontend** | Vue 3 + TypeScript + Vite + Pinia + Vue Router + Tailwind | SPA, mobile-first |
| **Backend** | Node 20 LTS + Express + TypeScript + Prisma | Layered architecture |
| **Database** | **MySQL 8** | Sesuai dokumen; Prisma sebagai ORM |
| **ORM** | **Prisma** (mengganti Sequelize di dokumen) | Penyimpangan sah — type-safety penuh + DX migrasi |
| **Auth** | JWT access 15m (memori) + refresh 7d (cookie HttpOnly) | Sesuai NFR & baseline keamanan |
| **Notifikasi real-time** | **SSE** (default, ringan) + fallback polling | WebSocket = jalur scale-up |
| **Cache/Queue/Storage** | In-memory + volume lokal (default lab) | Redis/S3/queue = scale-up terdokumentasi |
| **Target deploy** | Lab POLMAN `docker-host` (4 GB/2 vCPU) + Cloudflare Tunnel | Plan dioptimasi ringan |
| **Strategi rilis** | Semua fitur (19+ tabel) direncanakan sekaligus | Tanpa gating MVP |
| **Monorepo** | pnpm workspaces | `apps/*` + `packages/*` |

## 0.2 Penyimpangan Sah dari Dokumen Perancangan (Change Log Teknis)

| # | Dokumen menyebut | Implementasi | Alasan |
|---|---|---|---|
| D-1 | Sequelize ORM | **Prisma** | Type-safety end-to-end dengan TS, migrasi deklaratif, DX & keamanan query lebih baik |
| D-2 | JavaScript | **TypeScript (FE & BE)** | Permintaan stack hybrid; mengurangi bug runtime, kontrak tipe FE↔BE |
| D-3 | "polling/SSE/WebSocket" notifikasi | **SSE default** | Paling ringan untuk lab 4 GB; tidak butuh server stateful seperti WS |
| D-4 | Redis "opsional" | **In-memory `node-cache` default** | Hemat RAM; Redis disiapkan sebagai jalur scale-up tanpa mengubah kode aplikasi (adapter) |

> Setiap penyimpangan tetap **memenuhi NFR dan kriteria penerimaan** dokumen asli. Tidak ada FR yang dikorbankan.

## 0.3 Cara Membaca

- **Manajer/PO** → Section 0, 1, 15, 16.
- **Backend engineer** → Section 5, 6, 7, 9, 10 + Lampiran A.
- **Frontend engineer** → Section 8 + `ui_design.md`.
- **DevOps** → Section 11, 12, 14 + Lampiran C, D, E.
- **QA** → Section 13 + Lampiran H (traceability).

---

# 1. IKHTISAR & PRINSIP ENGINEERING

COCONEXUS dibangun sebagai aplikasi web kolaboratif untuk UMKM kelapa: repositori pengetahuan dua arah (top-down pakar + bottom-up UMKM) dengan alur submission→review, interaksi sosial (vote/bookmark/report/komentar), forum CoP, notifikasi, gamifikasi, dan panel admin lanjut.

## 1.1 Prinsip Engineering (Non-negotiable)

1. **Type-safety end-to-end** — TS strict di FE & BE; tipe & skema validasi dibagikan via `packages/shared`. Tidak ada `any` tanpa justifikasi.
2. **Layered & modular** — pemisahan tegas: HTTP (router/controller) ↔ domain (service) ↔ data (repository/Prisma). Logika bisnis tidak pernah di controller.
3. **Security-by-default** — semua endpoint dianggap *protected* kecuali ditandai publik; validasi input wajib; secret tidak pernah di-commit/di-log. (Detail di Section 9.)
4. **Documentation as source of truth** — `api_dokumen.md` (OpenAPI) adalah kontrak; perubahan API mengubah kontrak dulu, lalu kode.
5. **Idempotent & self-healing ops** — `run.sh`/`run.bat`, migrasi, dan seed aman dijalankan berulang; entrypoint produksi menjalankan migrate+seed otomatis.
6. **Resource-aware** — sadar batas lab 4 GB RAM (berbagi dengan `koperasi-app`): hindari stack berat, cache in-memory, pagination ketat, build multi-stage ramping.
7. **Frontend siap-deploy** — base URL API relatif (`/api`), tidak ada hardcode `localhost`, env build-time disadari.
8. **Definition of Done jelas** (Section 12.4) — fitur dianggap selesai hanya jika lulus lint+typecheck+test+review+a11y+keamanan.

## 1.2 Aktor & Peran (ringkas)

Guest · Pengguna (UMKM) · Moderator · Admin — matriks RBAC penuh ada di `perancangan_sistem.md` §5.4 dan diimplementasikan sebagai middleware `requireRole` (Section 5.3).

---

# 2. TECHNOLOGY STACK & RASIONAL

## 2.1 Frontend

| Komponen | Pilihan | Versi target | Rasional |
|---|---|---|---|
| Framework | **Vue 3** (Composition API + `<script setup>`) | ^3.4 | Sesuai dokumen; reaktif, ringan |
| Bahasa | **TypeScript** (strict) | ^5.4 | Type-safety, kontrak dengan BE |
| Build | **Vite** | ^5 | Dev cepat, build static optimal |
| State | **Pinia** | ^2 | Store modular, dukungan TS |
| Router | **Vue Router** | ^4 | Route guard berbasis role |
| Styling | **Tailwind CSS** | ^3.4 | Token design system langsung dari `ui_design.md` |
| HTTP | **axios** | ^1 | Interceptor refresh-token & error |
| Validasi form | **vee-validate + zod** | latest | Skema zod dibagikan dari `packages/shared` |
| Editor | **TipTap** | ^2 | WYSIWYG aman (anti-XSS, output ter-sanitasi) |
| Ikon | **lucide-vue-next** | latest | Sesuai dokumen UI (Lucide) |
| Chart | **Chart.js + vue-chartjs** | ^4 | Dashboard admin/moderator |
| i18n | **vue-i18n** | ^9 | Siap multi-bahasa (default ID) |
| Test | **Vitest + Vue Test Utils + Playwright** | latest | Unit + E2E |

## 2.2 Backend

| Komponen | Pilihan | Versi target | Rasional |
|---|---|---|---|
| Runtime | **Node.js LTS** | 20.x | Sesuai asumsi dokumen |
| Framework | **Express** | ^4 | Sesuai dokumen, ringan |
| Bahasa | **TypeScript** (strict) | ^5.4 | Type-safety |
| ORM | **Prisma** | ^5 | Migrasi deklaratif, query type-safe (anti-SQLi) |
| DB | **MySQL** | 8.x | Sesuai dokumen |
| Validasi | **zod** | ^3 | Skema dibagikan FE↔BE |
| Auth | **jsonwebtoken + bcrypt** | latest | JWT + hash cost 12 |
| Security | **helmet + express-rate-limit + cors + cookie-parser** | latest | Header, rate limit, CORS, cookie |
| Upload | **multer** (+ `file-type` sniffing) | latest | Validasi MIME asli, simpan non-public |
| Log | **winston** (JSON) + **morgan** (HTTP, dev) | latest | Log terstruktur |
| Email | **nodemailer** | latest | Verifikasi email (SMTP) |
| Scheduler | **node-cron** | latest | Badge award, purge, backup harian |
| Real-time | **SSE native** (`res.write`) | — | Notifikasi ringan |
| API contract | **express-openapi-validator** | latest | Validasi request/response vs OpenAPI |
| Test | **Vitest + supertest** | latest | Unit + integration |

## 2.3 Shared & Tooling

| Komponen | Pilihan |
|---|---|
| Monorepo | **pnpm workspaces** |
| Shared types/schema | `packages/shared` (zod + TS types + OpenAPI-generated types) |
| Lint/format | **ESLint + Prettier** (config di `packages/config`) |
| Git hooks | **Husky + lint-staged + commitlint** (Conventional Commits) |
| Container | **Docker (multi-stage) + docker-compose (profiles)** |
| Reverse proxy | **Nginx** (di container web) |
| Publikasi | **Cloudflare Tunnel** (`cloudflared`) |
| CI | **GitHub Actions** |
| Load test | **k6** atau **autocannon** |
| Contract test | **Dredd** / **Newman** |

---

# 3. ARSITEKTUR SOLUSI

## 3.1 Diagram Konteks (C4 Level 1)

```
            ┌───────────────────────────────────────────────────────┐
   Guest ──▶│                                                       │
  Pengguna ─▶│              COCONEXUS KMS (Web App)                  │──▶ SMTP (verifikasi email)
 Moderator ─▶│   Vue 3 SPA  ──/api──▶  Express API ──▶ MySQL 8       │──▶ Object Storage (scale-up)
    Admin ──▶│                                                       │──▶ Sentry (opsional)
            └───────────────────────────────────────────────────────┘
                         ▲ HTTPS via Cloudflare Tunnel (trin-polman.id)
```

## 3.2 Diagram Container (C4 Level 2) — sesuai batas lab

```
┌──────────────────────── docker-host (4 GB / 2 vCPU) ─────────────────────────┐
│                                                                              │
│  ┌──────────────┐    /api     ┌───────────────────────┐    Prisma   ┌──────┐ │
│  │  web (nginx) │ ──────────▶ │   api (Express + TS)  │ ──────────▶ │MySQL │ │
│  │ Vue static   │  proxy      │  - REST /api/v1       │             │  8   │ │
│  │ :PORT (8090) │             │  - SSE /notifications │             │127.0.0.1│
│  └──────────────┘             │  - cron jobs          │             │:33062│ │
│        ▲                      │  - node-cache (mem)   │             └──────┘ │
│        │                      └───────────────────────┘                ▲     │
│        │                                │  volume: /uploads, /backups   │     │
│        │                                └───────────────────────────────┘     │
│  ┌─────┴───────┐                                                              │
│  │ cloudflared │ ◀── Public Hostname: kms.trin-polman.id → localhost:8090     │
│  └─────────────┘                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

> **Catatan ringan:** web static disajikan Nginx (RAM ~beberapa MB) dan mem-proxy `/api` ke api container same-origin → tanpa CORS di produksi. DB tidak diekspos publik.

## 3.3 Peta Modul/Service (di dalam container `api`)

| Service (domain) | Tanggung jawab | FR terkait |
|---|---|---|
| **AuthService** | register, login, refresh, logout, verifikasi email | FR-001..003 |
| **UserService / ProfileService** | profil, avatar, follow, role (admin) | FR-004..007, U-09 |
| **ArticleService** | CRUD, slug, submission, state machine status, search | FR-101..108 |
| **ReviewService** | review queue, approve/revision/reject + review notes | FR-104, FR-105 |
| **CategoryService / TagService / TemplateService** | taksonomi & template | FR-201..204 |
| **CommentService** | nested comments + moderasi | FR-301, FR-302 |
| **VoteService** | like/dislike, satu suara/artikel (`voteLimiter`) | FR-303 |
| **BookmarkService** | simpan/lihat/hapus | FR-304 |
| **ReportService** | laporan konten → antrean moderasi | FR-305 |
| **ForumService** | topik/balasan, pin/lock, subscribe | FR-401..404 |
| **NotificationService** | buat notifikasi (observer) + stream SSE | FR-501..505 |
| **GamificationService** | evaluasi & award badge | FR-603 |
| **StatsService** | view counter, dashboard, populer | FR-601..604 |
| **AdminService** | recycle bin, settings (+cache), menu manager, backup, audit | FR-701..705 |
| **AuditLogger** (cross-cutting) | mencatat aksi penting | FR-705 |

## 3.4 Cross-cutting Concerns

Auth/JWT · RBAC · validasi (zod/OpenAPI) · rate-limit · audit logging · notification emitter · caching settings · error handling terpusat · structured logging · file storage abstraction. (Detail Section 5 & 10.)

---

# 4. STRUKTUR MONOREPO

```
kms_kelapa/
├─ apps/
│  ├─ api/                      # Backend Express + TS
│  └─ web/                      # Frontend Vue 3 + TS
├─ packages/
│  ├─ shared/                   # zod schemas + TS types + OpenAPI-generated types
│  └─ config/                   # eslint, prettier, tsconfig base
├─ infra/
│  ├─ docker/                   # Dockerfile.api, Dockerfile.web, nginx.conf, docker-entrypoint.sh
│  ├─ docker-compose.yml        # profiles: dev | prod
│  └─ cloudflared/              # catatan Public Hostname (tidak menyimpan kredensial)
├─ docs/                        # symlink/salinan referensi 4 dokumen perancangan
│  ├─ prd.md, perancangan_sistem.md, api_dokumen.md, ui_design.md
├─ .github/workflows/ci.yml
├─ .gitattributes               # *.sh text eol=lf
├─ .editorconfig
├─ pnpm-workspace.yaml
├─ package.json                 # root scripts (turbo-like via pnpm -r)
├─ run.sh                       # one-click runner (LF)
├─ run.bat                      # mirror Windows
└─ README.md
```

Detail pohon `apps/api` dan `apps/web` ada di **Lampiran B**.

## 4.1 Konvensi Workspace

- Skrip root: `pnpm dev` (api+web concurrently), `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm db:migrate`, `pnpm db:seed`.
- `packages/shared` di-*import* oleh api & web → satu definisi tipe (mis. `ArticleStatus`, `VoteType`, response envelope, zod schemas request).
- Tidak ada duplikasi enum/konstanta antar app.

---

# 5. BACKEND — ARSITEKTUR LAYERED & MODUL

## 5.1 Pola Layered

```
HTTP Request
   │
   ▼
[ route ]  ──▶ [ middleware: auth → rbac → rateLimit → validate(zod/openapi) ]
   │
   ▼
[ controller ]   (parse req, panggil service, format response envelope)
   │
   ▼
[ service ]      (LOGIKA BISNIS: state machine, aturan vote, observer notifikasi)
   │
   ▼
[ repository ]   (Prisma client — satu-satunya yang menyentuh DB)
   │
   ▼
  MySQL
```

**Aturan:** controller tipis (tanpa logika bisnis); service tanpa objek `req`/`res`; repository tanpa logika domain. Semua respons melalui helper `sendSuccess`/`sendError` (envelope konsisten, Section 7.2).

## 5.2 Struktur per Modul (contoh: Articles)

```
apps/api/src/modules/articles/
├─ article.routes.ts
├─ article.controller.ts
├─ article.service.ts
├─ article.repository.ts
├─ article.schema.ts        # zod request/response
├─ article.state.ts         # state machine status
└─ article.test.ts
```

## 5.3 Daftar Middleware (urutan & fungsi)

| Middleware | Fungsi |
|---|---|
| `requestId` | korelasi log (UUID per request) |
| `helmet` | HTTP security headers + CSP |
| `cors` | whitelist origin (produksi: same-origin) |
| `rateLimiter` | 100 req/menit/IP umum; `authLimiter` 5/menit untuk login/register/reset |
| `cookieParser` | baca refresh token cookie |
| `authenticate` | verifikasi JWT access → `req.user` |
| `requireRole(...roles)` | RBAC sesuai matriks `perancangan_sistem.md` §5.4 |
| `validate(schema)` | zod body/query/params; + `express-openapi-validator` global |
| `voteLimiter` | jamin satu suara/artikel/pengguna |
| `notificationEmitter` | event hook setelah aksi (komentar, review, follow) |
| `auditLogger` | catat aksi penting (entity, action, ip) |
| `errorHandler` | satu titik penanganan error → envelope error standar |
| `maintenanceGuard` | blok non-admin saat `maintenance_mode` ON |

## 5.4 State Machine Status Artikel (eksplisit)

```
draft ──submit──▶ submitted ──pickup──▶ review
  ▲                                   │
  │                          ┌────────┼─────────┐
  │                       approve   revision   reject
  │                          │        │          │
  │                          ▼        ▼          ▼
  └──(edit)── revision ◀─────┘   published   rejected
                                    │
                                 archive
                                    ▼
                                 archived
```

- Transisi divalidasi di `article.state.ts` (fungsi `canTransition(from, to, role)`).
- `revision`/`reject` **wajib** `review_notes` (validasi service + endpoint `/moderator/articles/:id/review`).
- Setiap transisi memicu `NotificationService` ke penulis + `AuditLogger`.

## 5.5 Pemetaan FR → Endpoint (ringkas; lengkap di Lampiran H)

| Modul | Endpoint utama (OpenAPI) |
|---|---|
| Auth | `POST /auth/register|login|logout|refresh` |
| Articles | `GET /articles/published`, `GET/PUT/DELETE /articles/:id`, `POST /articles/submit` |
| Social | `POST /articles/:id/vote|bookmark|report` |
| Comments | `GET/POST /articles/:id/comments`, `PUT/DELETE /comments/:id` |
| Forum | `GET/POST /forum/topics`, `PUT /forum/topics/:id/pin|lock`, `POST /.../replies` |
| Notifications | `GET /notifications`, `PUT /notifications/:id/read`, `GET /notifications/stream` (SSE) |
| Moderator | `GET /moderator/review-queue`, `PUT /moderator/articles/:id/review`, `/moderator/reports|comments` |
| Admin | `/admin/recycle-bin`, `/admin/settings`, `/admin/menu`, `/admin/backup`, `/admin/users`, `/admin/audit-logs` |

---

# 6. DATA LAYER (PRISMA + MySQL)

## 6.1 Prinsip Skema

- **Penamaan**: tabel `snake_case` jamak (`articles`), kolom `snake_case`; model Prisma `PascalCase` dengan `@@map`.
- **Soft delete**: kolom `deleted_at DATETIME NULL` pada `articles`, `comments`, `users`, `forum_topics` → mendukung Recycle Bin.
- **Audit timestamps**: `created_at`, `updated_at` di semua tabel transaksional.
- **Index**: FK, `slug` (unik), `status`/`submission_status`, `created_at`, `published_at`; unik komposit `votes(user_id, article_id)` & `bookmarks(user_id, article_id)`.
- **JSON**: `article_details.sections`, `notifications.data`, `badges.criteria` (MySQL 8 JSON).
- **Enum**: `vote_type`, `article submission_status`, `comment status`, `report reason/status`.

## 6.2 Daftar Entitas (25 model — superset 19 tabel dokumen + pendukung)

`Role, User, RefreshToken, UserProfile, Follow, Article, ArticleDetail, Category, Tag, ArticleCategory, ArticleTag, ArticleMedia, ContentTemplate, Comment, Vote, Bookmark, Report, ForumTopic, ForumReply, ForumSubscription, Notification, Badge, UserBadge, AuditLog, SystemSetting, MenuItem, ArticleView, BackupRecord`

Tambahan di luar 19 tabel dokumen (justifikasi):
- `RefreshToken` — rotasi/revoke refresh token saat logout (NFR keamanan).
- `Report`, `ForumSubscription`, `ArticleView`, `BackupRecord` — disebut implisit di FR/OpenAPI (report queue, subscribe, view counter, riwayat backup) namun belum jadi tabel eksplisit; ditambahkan agar FR tidak yatim.

Draft `schema.prisma` lengkap ada di **Lampiran A**.

## 6.3 Migrasi

- `prisma migrate dev` (lokal) → `prisma migrate deploy` (produksi, dijalankan entrypoint).
- Setiap migrasi di-review; tidak ada `db push` di produksi.
- Migrasi destruktif memerlukan persetujuan + backup pra-migrasi.

## 6.4 Seeding Idempoten (`prisma/seed.ts`)

Aman dijalankan berulang (`upsert`):
1. `roles`: guest, user, moderator, admin.
2. **Akun demo Quick Login** (selaras Lampiran F): admin, moderator, user — password ter-hash bcrypt, status `active`/verified.
3. `categories` awal (Sabut, Tempurung, Ampas, Ekonomi Sirkular, ...).
4. `system_settings` default (site_name, posts_per_page=20, maintenance_mode=false, ...).
5. `menu_items` navigasi default.
6. `badges` (Kontributor Pemula, Penulis Aktif, Komentator Handal, Pemberi Suara, Pembelajar Rajin) + `criteria` JSON.
7. `content_templates` contoh ("Cara Membuat Briket").

## 6.5 Recycle Bin & Purge

- Penghapusan = set `deleted_at` + catat `deleted_by` (audit).
- `GET /admin/recycle-bin?type=...` query `deleted_at IS NOT NULL`.
- `PUT /admin/recycle-bin/:type/:id/restore` set `deleted_at = NULL`.
- **Cron harian** purge permanen item `deleted_at < now()-30d` (Section 10.3).

---

# 7. STANDAR API & KONTRAK

## 7.1 Konvensi

- Base URL: `/api/v1`. Versioning di path.
- REST: kata benda jamak, HTTP verbs sesuai semantik, status code akurat (200/201/204/400/401/403/404/409/422/429/500).
- Auth: `Authorization: Bearer <access>`; refresh via cookie HttpOnly.
- Pagination: `?page=&limit=` (default 20, maks 100).

## 7.2 Response Envelope (konsisten)

```jsonc
// sukses (list)
{ "data": [ ... ], "meta": { "current_page": 1, "per_page": 20, "total_items": 134, "total_pages": 7 } }
// sukses (single)
{ "data": { ... } }
// error
{ "error": { "code": "VALIDATION_ERROR", "message": "Input tidak valid", "details": ["title wajib diisi"] } }
```

## 7.3 Kontrak = OpenAPI

- `api_dokumen.md` (OpenAPI 3.0.3) adalah **single source of truth**.
- BE memvalidasi request/response terhadap spec via `express-openapi-validator` (mode dev → strict).
- `packages/shared` meng-*generate* tipe TS dari OpenAPI (mis. `openapi-typescript`) → FE & BE memakai tipe yang sama.
- **Contract test** (Dredd/Newman) di CI memastikan implementasi ≡ spec.
- Swagger UI di-serve di `/api/docs` (non-produksi atau di belakang admin).

## 7.4 Error Codes (kanonik)

`VALIDATION_ERROR (422)`, `UNAUTHORIZED (401)`, `FORBIDDEN (403)`, `NOT_FOUND (404)`, `CONFLICT (409)`, `RATE_LIMITED (429)`, `INTERNAL (500)`. Pesan ramah Bahasa Indonesia, tanpa membocorkan detail sensitif/stacktrace ke klien.

---

# 8. FRONTEND — ARSITEKTUR & DESIGN SYSTEM

## 8.1 Struktur `apps/web/src` (ringkas; penuh di Lampiran B)

```
src/
├─ assets/            # gambar, font (Inter, Poppins)
├─ components/        # ui/ (atoms), common/ (Card, Modal, Toast, Bell), layout/
├─ composables/       # useAuth, useNotifications(SSE), useToast, usePagination
├─ stores/            # auth, articles, notifications, ui, settings (Pinia)
├─ router/            # index.ts + guards.ts (RBAC)
├─ api/               # client.ts (axios+interceptor), endpoints per domain
├─ views/             # public/, user/, moderator/, admin/, forum/
├─ locales/           # id.json (i18n, siap en.json)
└─ styles/            # tailwind.css + tokens
```

## 8.2 Implementasi Design System (dari `ui_design.md` → `tailwind.config`)

- **Warna**: `primary #2D6A4F`, `primary-dark #1B4332`, `primary-light #40916C`, `secondary #B07D3C`, `success #198754`, `warning #FFC107`, `danger #DC3545`, `info #0D6EFD`, netral `#212529/#6C757D/#F8F9FA`.
- **Tipografi**: heading **Poppins**, body **Inter**; skala H1–caption per tabel `ui_design.md` §3.2.
- **Spacing**: 8-pt grid; container maks 1200px.
- **Elevasi/shadow & radius**: token sesuai §3.5–3.6 (card 8px, modal 12px, pill 16px).
- Komponen global: Header (Guest/Login variant), Sidebar (per role), Card, Modal (focus trap), Toast (`role="alert"`), **Notification Bell** (badge unread + dropdown 360px), Search (debounce 300ms), Skeleton/Empty/Error states.

## 8.3 State, Auth & Routing

- **Pinia stores** per domain; `authStore` menyimpan user + access token (memori, bukan localStorage untuk akses) — refresh via cookie.
- **Route guards** (`router/guards.ts`): cek auth + role; redirect Guest ke login pada area terproteksi; preview 50% untuk Guest pada detail artikel.
- **axios interceptor**: lampirkan Bearer; pada 401 → coba `/auth/refresh` sekali → retry; bedakan **error jaringan** ("Tidak dapat menghubungi server") vs **error HTTP** (401/403/500) untuk pesan yang tidak menyesatkan.

## 8.4 Aturan Siap-Deploy (WAJIB)

- **Base URL relatif**: `const BASE = import.meta.env.VITE_API_URL ?? "/api"` — **tidak ada** `http://localhost:PORT`.
- **Proxy `/api`** di `vite.config.ts` untuk `server` **dan** `preview` → backend (same-origin di dev & prod).
- **Env build-time**: `VITE_*` ditanam saat `build` → setiap ubah env/kode **wajib rebuild** lalu restart penyaji (didokumentasikan di README & ringkasan `run.sh`).
- `server.allowedHosts`/`preview.allowedHosts` + `host: true` untuk di belakang Cloudflare (domain + `.trin-polman.id`).

## 8.5 Aksesibilitas (WCAG 2.1 AA)

Alt text semua gambar; kontras AA (token sudah diuji); navigasi keyboard + fokus terlihat; `aria-label` ikon; `<label>` terasosiasi; skip-to-content; modal trap fokus + Escape; toast `role="status"/"alert"`. (Checklist QA di Section 13 & `ui_design.md` §9.)

---

# 9. KEAMANAN (BASELINE GLOBAL + OWASP)

## 9.1 Checklist Baseline (mengikat — diturunkan dari instruksi global + NFR)

**Validasi input**
- [ ] Validasi **di server** (zod), bukan hanya FE.
- [ ] **Batasi panjang**: nama ≤100, email ≤255, **password ≤72 byte** (bcrypt memotong di 72), konten artikel dibatasi & disanitasi.
- [ ] Query **parameterized** via Prisma (tanpa raw SQL string).
- [ ] Anti-XSS: andalkan auto-escape Vue; output WYSIWYG **disanitasi** (sanitize-html) sebelum simpan/render; tanpa `v-html` mentah.

**Auth & password**
- [ ] **bcrypt cost 12**.
- [ ] Kebijakan password ≥8 char + kombinasi huruf besar/kecil/angka.
- [ ] **Tolak field `role`/privilege dari client** saat register → role default `user` di server.
- [ ] **Rate limit** auth ketat (5/menit/IP) + **lockout** setelah N gagal; API umum 100/menit.
- [ ] Anti-bot (**Cloudflare Turnstile**) pada register/reset.
- [ ] **Verifikasi email** sebelum akun aktif (SMTP via nodemailer).

**Sesi & cookie**
- [ ] Access JWT **15 menit**; refresh **7 hari** via cookie **HttpOnly + Secure + SameSite=Lax**.
- [ ] Refresh token disimpan/di-rotasi (`RefreshToken` table) & **revoke saat logout**.

**Lain-lain**
- [ ] **Tidak pernah log kredensial** (logger meng-*redact* body sensitif).
- [ ] **HTTPS** in-transit (Cloudflare Tunnel meng-handle TLS).
- [ ] Upload: whitelist ekstensi (jpg/png/webp/pdf/mp4) + **MIME sniffing**, batas ukuran, simpan **non-public**, nama file di-*randomize*.
- [ ] Pesan reset **netral** ("jika email terdaftar, ...") untuk kurangi enumerasi.
- [ ] Helmet + **CSP**; CORS whitelist; secret via env (peringatan jika masih placeholder saat `deploy`).

## 9.2 Mitigasi OWASP Top 10 (ringkas)

| Risiko | Mitigasi |
|---|---|
| A01 Broken Access Control | `requireRole` + cek kepemilikan resource di service; default-deny |
| A02 Cryptographic Failures | bcrypt 12, TLS, secret env, cookie Secure |
| A03 Injection | Prisma parameterized, zod validasi, sanitize-html |
| A04 Insecure Design | state machine artikel, RBAC matrix, review wajib notes |
| A05 Security Misconfig | helmet/CSP, CORS ketat, `.env.example` placeholder check |
| A06 Vulnerable Components | `pnpm audit` di CI, Dependabot |
| A07 Auth Failures | rate-limit+lockout, verifikasi email, refresh rotation |
| A08 Data Integrity | audit log, contract test, signed cookie |
| A09 Logging Failures | Winston JSON + audit_logs + redaction |
| A10 SSRF | tidak ada fetch URL user-supplied di server (whitelist bila perlu) |

## 9.3 Abuse-specific

- **Vote abuse**: unik `(user_id, article_id)` + verifikasi email + rate limit.
- **Spam submission/report**: review ketat, antrean moderasi, soft-delete otomatis jika banyak laporan, throttle submit.

---

# 10. CROSS-CUTTING & OPERASI RINGAN (SADAR 4 GB)

## 10.1 Notifikasi (SSE + fallback)

- Endpoint `GET /api/v1/notifications/stream` (SSE) — koneksi persisten ringan; `NotificationService` mem-*push* event ke koneksi pemilik.
- **Fallback polling** `GET /notifications?unread_only=true` tiap N detik bila SSE gagal (reconnect otomatis di `useNotifications`).
- Notifikasi dibuat via **observer pattern**: aksi (komentar dibalas, artikel approve/revision, follow terbit) → emit event → simpan row `notifications` → push SSE.

## 10.2 Caching (in-memory default)

- `node-cache` untuk `system_settings` (sering dibaca, jarang berubah) & daftar artikel published (TTL 5 menit, invalidasi saat publish/edit).
- **Adapter cache** (`CachePort`) → implementasi `MemoryCache` default; `RedisCache` = drop-in scale-up tanpa ubah service.

## 10.3 Background Jobs (`node-cron`)

| Job | Jadwal | Fungsi |
|---|---|---|
| `awardBadges` | tiap jam | evaluasi kriteria → award badge baru + notifikasi |
| `purgeRecycleBin` | harian 02:00 | hapus permanen `deleted_at < now()-30d` |
| `dailyBackup` | harian 01:00 | `mysqldump` → `/backups`, retensi N hari |
| `cleanupTokens` | harian | hapus refresh token kadaluarsa |

## 10.4 File Storage (abstraksi)

- `StoragePort` → `LocalDiskStorage` (volume `/uploads`, non-public, disajikan via endpoint terproteksi/Nginx internal). Swap ke `S3Storage` = scale-up tanpa ubah service.

## 10.5 Logging & Config

- **Winston JSON** ke stdout (ditangkap `docker logs`) + file rotatif opsional; korelasi `requestId`.
- Config via `.env` (+ `.env.example`); validasi env saat boot (zod) → gagal cepat bila config kurang.

## 10.6 Budget RAM Lab (4 GB, berbagi dengan koperasi-app)

| Container | Target RAM | Catatan |
|---|---|---|
| MySQL 8 | ~512 MB–1 GB | `innodb_buffer_pool_size` di-tune (mis. 256–384 MB) |
| api (Node) | ~256–512 MB | single instance, `--max-old-space-size` dibatasi |
| web (Nginx) | ~16–32 MB | hanya serve static + proxy |
| **Total COCONEXUS** | **~0.8–1.5 GB** | menyisakan headroom untuk OS + koperasi-app |

> Bila RAM mepet: matikan Swagger UI di produksi, nonaktifkan source map, dan pertimbangkan `mysqld` tuning agresif. Redis **tidak** diaktifkan di lab.

---

# 11. DEVOPS, ENVIRONMENT & DEPLOYMENT

## 11.1 Environments

| Env | Tujuan | DB | Cara jalan |
|---|---|---|---|
| **Local dev** | pengembangan | MySQL via Docker (profile `dev`) | `pnpm dev` (api+web di host) |
| **Staging** (opsional) | uji pra-rilis | container | `./run.sh deploy` di host staging |
| **Production (lab)** | go-live | container `restart: unless-stopped` | `./run.sh deploy` di `docker-host` |

## 11.2 Docker (multi-stage, ramping)

- `Dockerfile.api`: stage build (install+`prisma generate`+`tsc`) → stage runner (node slim, hanya artefak + `node_modules` prod).
- `Dockerfile.web`: stage build (`vite build`) → stage runner **Nginx** menyajikan `dist/` + proxy `/api`.
- `.dockerignore` (node_modules, .git, dist lokal, .env).
- `docker-entrypoint.sh` (api): **normalisasi CRLF** (`sed -i 's/\r$//'`), `prisma migrate deploy`, `prisma db seed` (idempoten), lalu start. Sketsa di **Lampiran C**.

## 11.3 docker-compose (profiles)

- `profiles: ["dev"]` → hanya `mysql` (+ adminer opsional) untuk dev lokal.
- `profiles: ["prod"]` → `mysql` + `api` + `web` (+ jaringan internal). `cloudflared` dikelola terpisah (sudah ada di host).
- Bind app `0.0.0.0` **di dalam** container; **map host hanya** `127.0.0.1:8090` (web). **DB tidak di-publish** ke publik (host bind `127.0.0.1:33062` untuk debugging lokal saja).

## 11.4 Port & Publikasi

- **Port host bebas**: web `8090` (hindari `8088` koperasi), MySQL `33062` (hindari `33061`).
- **Cloudflare Tunnel**: tambah Public Hostname `kms.trin-polman.id` → `localhost:8090` (HTTPS di-handle tunnel; app cukup HTTP di localhost).
- UFW: pastikan 22/80/443 sesuai kebijakan host.

## 11.5 Health & Performa

- `GET /api/health` → ping DB ringan (`SELECT 1`) + status uptime.
- Ukur TTFB:
  `curl -s -o /dev/null -w "TLS:%{time_appconnect} TTFB:%{time_starttransfer} Total:%{time_total}\n" https://kms.trin-polman.id/api/health`
  Target TTFB ≤ ~150 ms (app sehat). Hit pertama lambat lalu cepat = gejala dev-mode/cold start (harus dihindari → kita pakai build produksi, bukan `vite`/`tsx watch`).

## 11.6 `run.sh` + `run.bat` (WAJIB, one-click)

Subcommand minimal: `up`, `down`, `restart`, `status`, `logs`, `reset/hard-reset`, `doctor`, `help`, **`deploy`/`prod`**, `prod-logs`, `prod-down`, `prod-restart`. Perilaku:
- default tanpa argumen = setup penuh + start **dev lokal** (cek prasyarat, auto-copy `.env`, cek **port bentrok** sebelum start → jangan crash `EADDRINUSE`, beri pesan jelas + saran).
- `deploy` = mode **produksi persisten** (detached, auto-restart, build → migrate → seed → start; peringatkan bila secret masih placeholder).
- Bahasa Indonesia, idempotent, ringkasan akhir = URL semua service + **akun demo Quick Login** + cara stop/reset.
- `run.sh` **LF**; `run.bat` mirror + diakhiri `pause`. Kerangka di **Lampiran E**.

---

# 12. CI/CD & QUALITY GATES

## 12.1 Pipeline GitHub Actions (`.github/workflows/ci.yml`)

```
push/PR ──▶ install (pnpm) ──▶ lint ──▶ typecheck ──▶ unit+integration test (MySQL service)
        ──▶ contract test (OpenAPI) ──▶ build (api+web) ──▶ docker build (validasi)
        ──▶ pnpm audit (security)
```
Sketsa YAML di **Lampiran D**. Merge ke `main`/`dev` hanya bila semua gate hijau.

## 12.2 Branching & Commit

- Branch: `main` (produksi), `dev` (integrasi), `feature/<nama>`, `fix/<nama>`.
- **Conventional Commits**, judul Bahasa Indonesia ≤72 char (`feat: ...`, `fix: ...`, dst).
- PR wajib: deskripsi, checklist DoD, ≥1 reviewer, CI hijau.

## 12.3 Tooling Kualitas

- ESLint + Prettier (config `packages/config`), TypeScript `strict`.
- **Husky**: `pre-commit` → lint-staged (lint+format file staged) + typecheck cepat; `commit-msg` → commitlint.

## 12.4 Definition of Done (DoD)

Fitur "selesai" jika: kode + tipe lulus lint/typecheck; unit/integration test ditulis & hijau (coverage inti ≥80%); endpoint sesuai OpenAPI (contract test); UI sesuai design system + a11y; checklist keamanan relevan dicentang; dokumentasi/README diperbarui; di-review & di-*merge* via PR; **commit dibuat** (Conventional Commits).

---

# 13. STRATEGI PENGUJIAN

## 13.1 Piramida Uji

| Level | Tool | Cakupan |
|---|---|---|
| **Unit** | Vitest (FE & BE) | service (state machine, vote rules, badge), composables, util |
| **Integration** | supertest + MySQL uji | endpoint ↔ DB (auth, submission/review, vote, recycle bin) |
| **API Contract** | Dredd/Newman vs OpenAPI | implementasi ≡ `api_dokumen.md` |
| **E2E** | Playwright | alur kunci end-to-end |
| **Security** | `pnpm audit`, ZAP baseline (opsional) | dependensi + scan dasar |
| **Performance** | k6/autocannon | beban & latensi |

## 13.2 Alur E2E Kunci (Playwright)

1. Registrasi → verifikasi → login → **submit artikel** → moderator **review (approve/revision)** → notifikasi penulis → artikel publish.
2. Guest melihat **preview 50%** + overlay daftar.
3. Vote (satu suara/artikel), bookmark, report.
4. Komentar nested → moderasi approve/reject.
5. Admin: recycle bin restore, ubah settings → efek di frontend, menu manager.
6. Notifikasi real-time (SSE) muncul.

## 13.3 Performance Targets (dari NFR)

- API p95 < 300 ms; halaman p95 < 2 s; **500 concurrent user** dengan response < 500 ms (uji k6 di staging/lokal, sadar batas lab).
- Skenario: daftar artikel, detail artikel, login, submit.

## 13.4 UAT

- Skrip UAT per FR (acuan Lampiran H + `prd.md` §5 kriteria penerimaan).
- Lingkungan staging; peserta: PO + perwakilan UMKM/moderator.

---

# 14. OBSERVABILITY & RELIABILITY

- **Health checks**: `/api/health` (DB ping) + liveness/readiness untuk container.
- **Logging**: Winston JSON (stdout) + `audit_logs` untuk aksi penting; korelasi `requestId`.
- **Error tracking**: Sentry **opsional** (scale-up) — DSN via env, dimatikan default di lab.
- **Uptime**: target 99.5% (di luar pemeliharaan terjadwal); `restart: unless-stopped` + entrypoint self-heal.
- **Backup & Restore runbook**:
  - Otomatis harian (`dailyBackup` cron) + manual via `POST /admin/backup`.
  - **Uji restore berkala** (kuartalan) ke DB sandbox.
  - Backup VM via **Proxmox GUI** (bukan dari dalam VM).
- **DR**: RTO < 4 jam, RPO < 1 jam (backup harian + retensi + dump manual sebelum perubahan besar).

---

# 15. MANAJEMEN PROYEK & WBS

## 15.1 Metodologi

Scrum, sprint 2 minggu, 12 sprint / **24 minggu** (selaras `perancangan_sistem.md` §8.2). **Semua fitur direncanakan** (tanpa gating MVP), namun dependensi antar-epic menentukan urutan.

## 15.2 Epic → Story → Task (WBS ringkas)

| Epic | Story inti | Sprint |
|---|---|---|
| **E0 Foundation** | monorepo, CI, Docker, Prisma+migrasi, auth dasar, design system, run.sh/bat | S1–S2 |
| **E1 Artikel & Kategori** | CRUD, slug, kategori/tag/template, search, preview 50% | S3–S4 |
| **E2 Upload & Profil** | media upload, avatar, profil, follow | S5 |
| **E3 Submission & Review** | submit, state machine, review queue, review notes, notifikasi | S5–S6 |
| **E4 Komentar & Sosial** | nested comments + moderasi, vote, bookmark, report | S7 |
| **E5 Forum CoP** | topik/balasan, pin/lock, subscribe | S8 |
| **E6 Notifikasi** | SSE + observer + pusat notifikasi | S8–S9 |
| **E7 Stats & Gamifikasi** | dashboard per role, view counter, badge | S9 |
| **E8 Admin Lanjut** | recycle bin, settings+cache, menu manager, backup, audit log | S10 |
| **E9 Frontend Integrasi** | semua halaman per role, a11y, i18n | S3–S11 (paralel) |
| **E10 Hardening & QA** | security, performance, E2E, contract, UAT | S11 |
| **E11 Deployment** | Docker prod, Cloudflare, runbook, go-live, pelatihan | S12 |

## 15.3 Timeline (12 sprint)

| Sprint | Fokus | Deliverable utama |
|---|---|---|
| S1–S2 | Foundation | repo, CI, auth, DB, design tokens, runner |
| S3–S4 | Artikel & kategori | CRUD, search, taksonomi, preview 50% |
| S5 | Upload, profil & submission | media, profil, submit |
| S6 | Review workflow | review queue, notes, notifikasi |
| S7 | Komentar & interaksi sosial | nested, vote, bookmark, report |
| S8 | Forum & notifikasi | pin/lock, subscribe, SSE |
| S9 | Dashboard & gamifikasi | statistik, badge |
| S10 | Admin lanjut | recycle bin, settings, menu, backup, audit |
| S11 | Frontend final & testing | integrasi UI, E2E, security, performance |
| S12 | UAT & deployment | finalisasi, go-live, pelatihan |

## 15.4 Struktur Tim (acuan dokumen §13.2) & RACI

PM, Scrum Master, 2 Frontend, 2 Backend, 1 UI/UX, 1 QA, 1 DevOps. RACI: PO **A** atas scope; Tech Lead **R** atas keputusan teknis; QA **R** atas gate kualitas; DevOps **R** atas deploy. (Matriks penuh dilampirkan saat kickoff.)

## 15.5 Milestone

M1 Foundation siap (akhir S2) · M2 Submission/Review jalan (S6) · M3 Sosial+Forum+Notif (S8) · M4 Admin+Gamifikasi (S10) · M5 Feature-complete & UAT (S11) · M6 Go-live (S12).

---

# 16. MANAJEMEN RISIKO

| ID | Risiko | Dampak | Prob. | Mitigasi |
|---|---|---|---|---|
| R-1 | Abuse voting/report (bot) | Turun kepercayaan | Sedang | unik 1 suara, rate-limit, verifikasi email, Turnstile |
| R-2 | Spam/konten tak pantas (submission) | Turun kualitas | Tinggi | review wajib, report, soft-delete otomatis bila banyak laporan |
| R-3 | **Batas RAM lab 4 GB** | Lambat/OOM | Tinggi | budget RAM (10.6), no-Redis, tuning MySQL, build produksi |
| R-4 | Kehilangan data | Kerugian besar | Rendah | backup harian + manual + uji restore + Proxmox backup |
| R-5 | **CRLF skrip `.sh` di server** | Deploy gagal | Sedang | `.gitattributes` LF + `sed` di entrypoint |
| R-6 | **Hardcode URL API** | Login gagal di server | Sedang | base relatif `/api` + proxy vite (server+preview) |
| R-7 | Menjalankan **dev mode di server** | Lambat & mati saat SSH tutup | Sedang | `deploy` = build produksi detached + auto-restart |
| R-8 | Secret placeholder ter-deploy | Celah keamanan | Sedang | cek placeholder di `deploy` + peringatan |
| R-9 | Port bentrok (8088/33061) | Service bentrok | Rendah | pakai 8090/33062 + cek port di runner |

---

# 17. PERFORMA, SKALABILITAS & AKSESIBILITAS

- **Performa**: indeks DB tepat, pagination ≤20, lazy-load gambar/komentar, cache settings & artikel published, kompresi gzip/br di Nginx, HTTP caching aset statis.
- **Skalabilitas (jalur scale-up bila lepas lab)**: aktifkan `RedisCache` adapter, pindah storage ke S3-compatible, queue (BullMQ) untuk job berat, replika baca MySQL, multi-instance api di belakang load balancer. **Tanpa mengubah kode domain** (port/adapter pattern).
- **Aksesibilitas**: WCAG 2.1 AA (Section 8.5).
- **i18n**: `vue-i18n` siap; default `id`, struktur `en` disiapkan.

---

# 18. LAMPIRAN

## Lampiran A — Draft `schema.prisma` (acuan, akan disempurnakan saat implementasi)

```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "mysql"; url = env("DATABASE_URL") }

model Role {
  id    Int    @id @default(autoincrement())
  name  String @unique          // guest|user|moderator|admin
  users User[]
  @@map("roles")
}

model User {
  id            Int       @id @default(autoincrement())
  email         String    @unique
  password      String                              // bcrypt
  roleId        Int       @map("role_id")
  role          Role      @relation(fields: [roleId], references: [id])
  status        String    @default("active")        // active|suspended|deleted
  emailVerified Boolean   @default(false) @map("email_verified")
  lastLogin     DateTime? @map("last_login")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  deletedAt     DateTime? @map("deleted_at")
  profile       UserProfile?
  articles      Article[]
  comments      Comment[]
  votes         Vote[]
  bookmarks     Bookmark[]
  notifications Notification[]
  refreshTokens RefreshToken[]
  badges        UserBadge[]
  reports       Report[]
  following     Follow[]  @relation("follower")
  followers     Follow[]  @relation("following")
  @@index([roleId]); @@index([status]); @@index([deletedAt])
  @@map("users")
}

model RefreshToken {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("user_id")
  user      User     @relation(fields: [userId], references: [id])
  tokenHash String   @map("token_hash")
  expiresAt DateTime @map("expires_at")
  revokedAt DateTime? @map("revoked_at")
  createdAt DateTime @default(now()) @map("created_at")
  @@index([userId]); @@map("refresh_tokens")
}

model UserProfile {
  id          Int    @id @default(autoincrement())
  userId      Int    @unique @map("user_id")
  user        User   @relation(fields: [userId], references: [id])
  displayName String @map("display_name")
  bio         String? @db.Text
  avatarPath  String? @map("avatar_path")
  jobTitle    String? @map("job_title")
  department  String?
  division    String?
  @@map("user_profiles")
}

model Follow {
  id          Int  @id @default(autoincrement())
  followerId  Int  @map("follower_id")
  followingId Int  @map("following_id")
  follower    User @relation("follower", fields: [followerId], references: [id])
  following   User @relation("following", fields: [followingId], references: [id])
  createdAt   DateTime @default(now()) @map("created_at")
  @@unique([followerId, followingId]); @@map("follows")
}

model Article {
  id               Int       @id @default(autoincrement())
  title            String
  slug             String    @unique
  authorId         Int       @map("author_id")
  author           User      @relation(fields: [authorId], references: [id])
  submissionStatus String    @default("draft") @map("submission_status") // draft|submitted|review|revision|published|rejected|archived
  reviewNotes      String?   @db.Text @map("review_notes")
  viewCount        Int       @default(0) @map("view_count")
  publishedAt      DateTime? @map("published_at")
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")
  deletedAt        DateTime? @map("deleted_at")
  detail           ArticleDetail?
  media            ArticleMedia[]
  comments         Comment[]
  votes            Vote[]
  bookmarks        Bookmark[]
  categories       ArticleCategory[]
  tags             ArticleTag[]
  views            ArticleView[]
  @@index([submissionStatus]); @@index([authorId]); @@index([publishedAt]); @@index([deletedAt])
  @@map("articles")
}

model ArticleDetail {
  id        Int     @id @default(autoincrement())
  articleId Int     @unique @map("article_id")
  article   Article @relation(fields: [articleId], references: [id])
  content   String  @db.LongText
  sections  Json?
  sources   Json?
  @@map("article_details")
}

model Category {
  id          Int     @id @default(autoincrement())
  name        String
  slug        String  @unique
  description String?
  createdAt   DateTime @default(now()) @map("created_at")
  articles    ArticleCategory[]
  @@map("category_tags")
}

model Tag {
  id       Int    @id @default(autoincrement())
  name     String @unique
  slug     String @unique
  articles ArticleTag[]
  @@map("tags")
}

model ArticleCategory {
  articleId  Int @map("article_id")
  categoryId Int @map("category_id")
  article    Article  @relation(fields: [articleId], references: [id])
  category   Category @relation(fields: [categoryId], references: [id])
  @@id([articleId, categoryId]); @@map("article_category")
}

model ArticleTag {
  articleId Int @map("article_id")
  tagId     Int @map("tag_id")
  article   Article @relation(fields: [articleId], references: [id])
  tag       Tag     @relation(fields: [tagId], references: [id])
  @@id([articleId, tagId]); @@map("article_tag")
}

model ArticleMedia {
  id        Int     @id @default(autoincrement())
  articleId Int     @map("article_id")
  article   Article @relation(fields: [articleId], references: [id])
  filePath  String  @map("file_path")
  fileType  String  @map("file_type")
  caption   String?
  @@map("article_media")
}

model ContentTemplate {
  id        Int      @id @default(autoincrement())
  name      String
  content   String   @db.Text
  createdAt DateTime @default(now()) @map("created_at")
  @@map("content_templates")
}

model Comment {
  id        Int       @id @default(autoincrement())
  articleId Int       @map("article_id")
  article   Article   @relation(fields: [articleId], references: [id])
  userId    Int       @map("user_id")
  user      User      @relation(fields: [userId], references: [id])
  parentId  Int?      @map("parent_id")
  parent    Comment?  @relation("thread", fields: [parentId], references: [id])
  replies   Comment[] @relation("thread")
  content   String    @db.Text
  status    String    @default("pending")  // pending|approved|rejected
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")
  @@index([articleId]); @@index([status]); @@index([parentId])
  @@map("comments")
}

model Vote {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("user_id")
  articleId Int      @map("article_id")
  user      User     @relation(fields: [userId], references: [id])
  article   Article  @relation(fields: [articleId], references: [id])
  voteType  String   @map("vote_type")    // like|dislike
  createdAt DateTime @default(now()) @map("created_at")
  @@unique([userId, articleId]); @@map("votes")
}

model Bookmark {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("user_id")
  articleId Int      @map("article_id")
  user      User     @relation(fields: [userId], references: [id])
  article   Article  @relation(fields: [articleId], references: [id])
  createdAt DateTime @default(now()) @map("created_at")
  @@unique([userId, articleId]); @@map("bookmarks")
}

model Report {
  id          Int      @id @default(autoincrement())
  reporterId  Int      @map("reporter_id")
  reporter    User     @relation(fields: [reporterId], references: [id])
  entityType  String   @map("entity_type")  // article|comment
  entityId    Int      @map("entity_id")
  reason      String                          // spam|inappropriate|misinformation|other
  description String?
  status      String   @default("open")       // open|ignored|resolved
  createdAt   DateTime @default(now()) @map("created_at")
  @@index([status]); @@index([entityType, entityId]); @@map("reports")
}

model ForumTopic {
  id        Int      @id @default(autoincrement())
  title     String
  content   String   @db.Text
  userId    Int      @map("user_id")
  categoryId Int?    @map("category_id")
  isPinned  Boolean  @default(false) @map("is_pinned")
  isLocked  Boolean  @default(false) @map("is_locked")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  replies   ForumReply[]
  subs      ForumSubscription[]
  @@map("forum_topics")
}

model ForumReply {
  id        Int      @id @default(autoincrement())
  topicId   Int      @map("topic_id")
  topic     ForumTopic @relation(fields: [topicId], references: [id])
  userId    Int      @map("user_id")
  content   String   @db.Text
  createdAt DateTime @default(now()) @map("created_at")
  @@index([topicId]); @@map("forum_replies")
}

model ForumSubscription {
  id      Int @id @default(autoincrement())
  topicId Int @map("topic_id")
  userId  Int @map("user_id")
  topic   ForumTopic @relation(fields: [topicId], references: [id])
  @@unique([topicId, userId]); @@map("forum_subscriptions")
}

model Notification {
  id        Int       @id @default(autoincrement())
  userId    Int       @map("user_id")
  user      User      @relation(fields: [userId], references: [id])
  type      String                              // reply|article_approved|article_revision|follow_publish
  data      Json
  readAt    DateTime? @map("read_at")
  createdAt DateTime  @default(now()) @map("created_at")
  @@index([userId, readAt]); @@map("notifications")
}

model Badge {
  id          Int    @id @default(autoincrement())
  name        String
  description String?
  icon        String?
  criteria    Json
  users       UserBadge[]
  @@map("badges")
}

model UserBadge {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("user_id")
  badgeId   Int      @map("badge_id")
  user      User     @relation(fields: [userId], references: [id])
  badge     Badge    @relation(fields: [badgeId], references: [id])
  awardedAt DateTime @default(now()) @map("awarded_at")
  @@unique([userId, badgeId]); @@map("user_badges")
}

model AuditLog {
  id         Int      @id @default(autoincrement())
  userId     Int?     @map("user_id")
  action     String
  entityType String?  @map("entity_type")
  entityId   Int?     @map("entity_id")
  description String?
  ipAddress  String?  @map("ip_address")
  createdAt  DateTime @default(now()) @map("created_at")
  @@index([userId]); @@index([action]); @@index([createdAt]); @@map("audit_logs")
}

model SystemSetting {
  key   String @id
  value String @db.Text
  @@map("system_settings")
}

model MenuItem {
  id        Int     @id @default(autoincrement())
  label     String
  url       String
  icon      String?
  parentId  Int?    @map("parent_id")
  sortOrder Int     @default(0) @map("sort_order")
  isVisible Boolean @default(true) @map("is_visible")
  target    String  @default("_self")
  @@map("menu_items")
}

model ArticleView {
  id        Int      @id @default(autoincrement())
  articleId Int      @map("article_id")
  article   Article  @relation(fields: [articleId], references: [id])
  userId    Int?     @map("user_id")
  ipHash    String?  @map("ip_hash")
  createdAt DateTime @default(now()) @map("created_at")
  @@index([articleId, createdAt]); @@map("article_views")
}

model BackupRecord {
  id        Int      @id @default(autoincrement())
  filename  String
  size      String?
  createdAt DateTime @default(now()) @map("created_at")
  @@map("backup_records")
}
```

## Lampiran B — Pohon Folder `apps/api` & `apps/web`

```
apps/api/
├─ prisma/{schema.prisma, seed.ts, migrations/}
├─ src/
│  ├─ config/{env.ts, logger.ts, cache.ts}
│  ├─ middleware/{auth.ts, rbac.ts, rateLimit.ts, validate.ts, audit.ts, error.ts, maintenance.ts}
│  ├─ lib/{jwt.ts, password.ts, storage/, mailer.ts, sse.ts}
│  ├─ modules/{auth, users, articles, reviews, categories, tags, templates,
│  │           comments, votes, bookmarks, reports, forum, notifications,
│  │           gamification, stats, admin}/  (routes|controller|service|repository|schema|test)
│  ├─ jobs/{awardBadges.ts, purgeRecycleBin.ts, dailyBackup.ts, cleanupTokens.ts}
│  ├─ app.ts            # bootstrap express + middleware
│  └─ server.ts         # listen + graceful shutdown
└─ package.json, tsconfig.json, Dockerfile→infra/docker/Dockerfile.api

apps/web/
├─ src/ (lihat §8.1)
├─ index.html, vite.config.ts, tailwind.config.ts, tsconfig.json
└─ package.json
```

## Lampiran C — Sketsa `docker-compose` + Dockerfile + entrypoint

```yaml
# infra/docker-compose.yml (ringkas)
services:
  mysql:
    image: mysql:8
    command: --innodb-buffer-pool-size=320M
    environment: { MYSQL_DATABASE: coconexus, MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD} }
    ports: ["127.0.0.1:33062:3306"]
    volumes: ["mysql_data:/var/lib/mysql"]
    restart: unless-stopped
    profiles: ["dev","prod"]
  api:
    build: { context: .., dockerfile: infra/docker/Dockerfile.api }
    env_file: ../.env
    depends_on: [mysql]
    volumes: ["uploads:/app/uploads","backups:/app/backups"]
    restart: unless-stopped
    profiles: ["prod"]
  web:
    build: { context: .., dockerfile: infra/docker/Dockerfile.web }
    ports: ["127.0.0.1:8090:80"]   # Cloudflare Tunnel → localhost:8090
    depends_on: [api]
    restart: unless-stopped
    profiles: ["prod"]
volumes: { mysql_data: {}, uploads: {}, backups: {} }
```

```sh
# infra/docker/docker-entrypoint.sh (api)
#!/usr/bin/env sh
set -e
sed -i 's/\r$//' "$0" 2>/dev/null || true
npx prisma migrate deploy
npx prisma db seed
exec node dist/server.js
```

Dockerfile.api & Dockerfile.web = multi-stage (build → runner ramping). Dockerfile.web stage runner = Nginx menyajikan `dist/` + `proxy_pass /api → api:PORT`.

## Lampiran D — Sketsa GitHub Actions (`.github/workflows/ci.yml`)

```yaml
name: ci
on: { push: { branches: [main, dev] }, pull_request: {} }
jobs:
  build-test:
    runs-on: ubuntu-latest
    services:
      mysql: { image: mysql:8, env: { MYSQL_DATABASE: coconexus_test, MYSQL_ROOT_PASSWORD: root }, ports: ["3306:3306"] }
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm db:migrate:deploy   # ke MySQL service
      - run: pnpm test                # unit + integration
      - run: pnpm test:contract       # Dredd/Newman vs OpenAPI
      - run: pnpm build
      - run: pnpm audit --prod || true
```

## Lampiran E — Kerangka `run.sh` / `run.bat`

```bash
#!/usr/bin/env bash
# run.sh — one-click runner COCONEXUS (Bahasa Indonesia, idempotent)
set -euo pipefail
APP_PORT="${PORT:-8090}"
cmd="${1:-default}"
doctor()      { : "cek docker/node/pnpm; pesan fix bila tidak ada"; }
ensure_env()  { [ -f .env ] || cp .env.example .env; }   # auto-config
check_port()  { : "cek EADDRINUSE; jika container prod jalan → pesan jelas, sarankan PORT="; }
case "$cmd" in
  up|default) doctor; ensure_env; check_port; docker compose --profile dev up -d
              pnpm install; pnpm db:migrate; pnpm db:seed; pnpm dev ;;   # DEV LOKAL
  deploy|prod) doctor; ensure_env; : "WARN bila secret placeholder"
              docker compose --profile prod up -d --build ;;            # PRODUKSI persisten
  down)       docker compose --profile dev down ;;
  prod-down)  docker compose --profile prod down ;;
  prod-logs)  docker compose --profile prod logs -f ;;
  prod-restart) docker compose --profile prod restart ;;
  restart)    "$0" down; "$0" up ;;
  status)     docker compose ps ;;
  logs)       docker compose logs -f ;;
  reset|hard-reset) : "down + hapus volume (konfirmasi)"; ;;
  doctor)     doctor ;;
  help|*)     echo "Perintah: up|deploy|down|prod-down|prod-logs|prod-restart|restart|status|logs|reset|doctor|help" ;;
esac
# Ringkasan akhir: URL (https://kms.trin-polman.id) + akun demo Quick Login + cara stop/reset
```

`run.bat` = mirror subcommand yang sama (cmd Windows), diakhiri `pause`. `.gitattributes`: `*.sh text eol=lf`.

## Lampiran F — Akun Demo Quick Login (selaras seed)

| Role | Email | Password | Catatan |
|---|---|---|---|
| Admin | `admin@coconexus.test` | `Admin#1234` | akses penuh |
| Moderator | `moderator@coconexus.test` | `Mod#1234` | review & moderasi |
| Pengguna | `user@coconexus.test` | `User#1234` | UMKM kontributor |

> Tombol **Quick Login** di halaman login mengisi/masuk per-role. **Wajib diganti/dinonaktifkan di produksi nyata.** Konsisten dengan `seed.ts` & ringkasan `run.sh`/`README`.

## Lampiran G — Glosarium & Referensi

Glosarium mengikuti `perancangan_sistem.md` §1.4 (KMS, CoP, UMKM, Tacit/Explicit, User Submission, Review Queue/Notes, Notification Center, Recycle Bin, RBAC, JWT). Referensi: 4 dokumen perancangan + OWASP Top 10 + WCAG 2.1 + Conventional Commits + 12-Factor App.

## Lampiran H — Traceability Matrix (FR → Modul → Endpoint → Test)

| FR | Deskripsi | Modul/Service | Endpoint | Rencana Test |
|---|---|---|---|---|
| FR-001/002/003 | Register/Login/JWT | AuthService | `/auth/register|login|refresh|logout` | unit+integration+E2E |
| FR-004/007 | Profil & avatar | ProfileService | `/user/profile`, upload | integration |
| FR-005/006 | Soft delete & role user | AdminService | `/admin/users/:id/*` | integration |
| FR-101/102 | CRUD + workflow | ArticleService + state | `/articles/:id`, state machine | unit(state)+integration |
| FR-103 | User submission | ArticleService | `POST /articles/submit` | integration+E2E |
| FR-104/105 | Review queue + notes | ReviewService | `/moderator/review-queue`, `/moderator/articles/:id/review` | integration+E2E |
| FR-106 | Preview 50% guest | ArticleService + FE guard | `GET /articles/:id` | E2E |
| FR-107/108 | Search + slug | ArticleService | `/articles/published?search=` | integration |
| FR-201..204 | Kategori/tag/template | Category/Tag/Template | `/categories`, `/templates` | integration |
| FR-301/302 | Komentar nested + moderasi | CommentService | `/articles/:id/comments`, `/moderator/comments/:id/moderate` | integration+E2E |
| FR-303 | Voting | VoteService + voteLimiter | `POST /articles/:id/vote` | unit+integration |
| FR-304 | Bookmark | BookmarkService | `/articles/:id/bookmark`, `/user/bookmarks` | integration |
| FR-305 | Report | ReportService | `/articles/:id/report`, `/moderator/reports` | integration |
| FR-401..404 | Forum | ForumService | `/forum/topics*`, pin/lock/replies | integration+E2E |
| FR-501..505 | Notifikasi | NotificationService (SSE) | `/notifications*`, `/notifications/stream` | integration+E2E |
| FR-601..604 | Stats & gamifikasi | Stats/Gamification | dashboards, `awardBadges` | unit+integration |
| FR-701 | Recycle bin | AdminService | `/admin/recycle-bin*` | integration+E2E |
| FR-702 | System settings | AdminService + cache | `/admin/settings` | integration+E2E |
| FR-703 | Menu manager | AdminService | `/admin/menu*` | integration |
| FR-704 | Backup DB | AdminService + cron | `/admin/backup*` | integration |
| FR-705 | Audit log | AuditLogger | `/admin/audit-logs` | integration |

---

**Dokumen SDP v1.0 ini menjadi acuan tunggal eksekusi pengembangan COCONEXUS KMS v2.0.**
*Setiap penyimpangan dari rencana harus melalui change request yang disetujui Product Owner & Tech Lead. Pembaruan dokumen mengikuti versioning di header.*
