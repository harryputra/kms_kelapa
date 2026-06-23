# COCONEXUS KMS v2.0 — Frontend

Platform manajemen pengetahuan pengelolaan **limbah buah kelapa** untuk UMKM agroindustri Indonesia. Repositori dua arah (pakar + UMKM) dengan alur submission→review, interaksi sosial, forum, notifikasi, gamifikasi, dan panel admin.

> **Status:** Frontend (Vue 3 + TS) **dan** backend (Express + Prisma + MySQL) lengkap. Frontend bisa jalan dua mode: **mock** (default, semua data, tanpa backend) atau **nyata** (ke API + MySQL).

---

## 🚀 Cara menjalankan (3 mode)

| Mode | Perintah | Kebutuhan | Untuk |
|---|---|---|---|
| **Mock** (default) | `./run.sh` / `run.bat` | hanya Node | **Eksplorasi alur** — semua menu & data jalan, tanpa Docker/DB |
| **Dev nyata** | `./run.sh full` / `run.bat full` | + Docker | Develop ke backend asli (MySQL+API+Web, hot-reload) |
| **Produksi** | `./run.sh deploy` / `run.bat deploy` | + Docker | Deploy container persisten (`localhost:8090`) |

> Mode **mock** paling andal untuk memahami sistem: buka `http://localhost:5173`, klik **Quick Login**, semua fitur & data tersedia. **Tidak perlu backend.**
>
> ⚠️ Jangan jalankan `pnpm dev` dalam mode nyata (`VITE_USE_MOCK=false`) tanpa API hidup → akan muncul `ECONNREFUSED /api/v1`. Pakai `./run.sh full` (otomatis menghidupkan API).

Manual (mock): `pnpm install && pnpm dev` → http://localhost:5173

### 🔑 Quick Login (akun demo)

Tersedia tombol **Quick Login** di halaman `/login`, atau masuk manual:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@coconexus.test` | `Admin#1234` |
| Moderator | `moderator@coconexus.test` | `Mod#1234` |
| Pengguna | `user@coconexus.test` | `User#1234` |

---

## 🧱 Tech Stack

Vue 3 · TypeScript · Vite · Pinia · Vue Router · Tailwind CSS · axios · lucide-vue-next · @vueuse/core

## 📁 Struktur

```
kms_kelapa/
├─ apps/web/                 # Frontend Vue 3 + TS
│  ├─ src/
│  │  ├─ api/                # facade + mock API + http (axios siap backend)
│  │  ├─ components/         # ui/ · common/ · layout/
│  │  ├─ stores/             # Pinia (auth, ui, notifications, settings)
│  │  ├─ router/             # rute + RBAC guards
│  │  ├─ views/              # public · auth · user · moderator · admin · forum
│  │  ├─ lib/                # util format
│  │  └─ styles/             # tailwind + design tokens
├─ rencana_pengembangan.md   # SDP enterprise (acuan tunggal)
├─ prd.md · perancangan_sistem.md · api_dokumen.md · ui_design.md
├─ run.sh · run.bat          # one-click runner
└─ pnpm-workspace.yaml
```

## ✨ Fitur yang sudah berjalan (mock)

- **Publik:** landing, daftar artikel (cari/filter/sort/paginasi), detail artikel + **pratinjau 50% untuk guest**, forum.
- **Auth:** login (+ Quick Login), registrasi dengan validasi kekuatan sandi.
- **Pengguna:** dashboard, tulis artikel (editor + template + tag), artikel saya, bookmark, notifikasi, profil & badge.
- **Moderator:** dashboard, antrean review, halaman review (approve/revisi/tolak + catatan wajib), template, moderasi komentar, laporan.
- **Admin:** dashboard + grafik, manajemen pengguna (ubah role/suspend), pengaturan sistem, menu manager, recycle bin, audit log.
- **Lintas peran:** RBAC route guard, notifikasi (lonceng + halaman), toast, dark-ready tokens, state loading/empty/error, aksesibilitas dasar (WCAG AA).

## 🖥️ Backend (API) — fondasi

`apps/api` = Express + TypeScript + Prisma + MySQL (lihat `rencana_pengembangan.md`). Slice fondasi yang sudah jalan & teruji: **Auth** (register/login/refresh/logout/me, JWT + bcrypt + rate-limit) dan **Cetak Biru** (list faceted, detail, value-tree).

```bash
pnpm db:up                 # MySQL via Docker (127.0.0.1:33062)
cp apps/api/.env.example apps/api/.env
pnpm --filter @coconexus/api db:generate
pnpm db:push               # buat tabel
pnpm db:seed               # roles + akun demo + 4 cetak biru
pnpm dev:api               # http://localhost:3000/api/v1
# cek:
curl http://localhost:3000/api/v1/health
curl -X POST http://localhost:3000/api/v1/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"admin@coconexus.test","password":"Admin#1234"}'
```

Endpoint: `GET /health`, `POST /auth/{register,login,refresh,logout}`, `GET /auth/me`, `GET /blueprints`, `GET /blueprints/:id`, `GET /value-tree`. Envelope `{data, meta}` / error `{error:{code,message,details}}`.

## 🚢 Deploy (Produksi, Docker)

Stack penuh (MySQL + API + Web Nginx) sebagai container persisten — **bukan dev mode**.

```bash
# (opsional, WAJIB di server publik) ganti secret:
export JWT_ACCESS_SECRET="$(openssl rand -hex 32)"
export JWT_REFRESH_SECRET="$(openssl rand -hex 32)"
export ADMIN_PASSWORD="kata-sandi-admin-asli"

./run.sh deploy          # build + up -d (detached, restart: unless-stopped)
./run.sh prod-logs       # lihat log (Ctrl+C keluar, app tetap jalan)
./run.sh prod-down       # hentikan
```

- Web disajikan Nginx di **`127.0.0.1:8090`** dan mem‑proxy `/api` → container `api` (same‑origin, tanpa CORS). DB **tidak** diekspos publik.
- Entrypoint API otomatis **sinkron skema + seed esensial** sebelum start (idempoten).
- **Publikasi**: tambah Public Hostname di Cloudflare Tunnel → `subdomain.trin-polman.id` ke `localhost:8090` (tunnel meng‑handle HTTPS).
- **Update/redeploy**: `git pull && ./run.sh deploy`.
- Ukur TTFB: `curl -s -o /dev/null -w "TTFB:%{time_starttransfer} Total:%{time_total}\n" http://localhost:8090/api/v1/health`.

> Image web di‑build dengan `VITE_USE_MOCK=false` → memakai backend nyata. Catatan: cookie refresh ber‑`Secure` (butuh HTTPS); di balik Cloudflare otomatis aman.

## 🔌 Mock ↔ Backend nyata

Frontend memanggil satu **facade** (`src/api/index.ts`). Default memakai mock (`VITE_USE_MOCK=true`). Saat seluruh endpoint backend siap, set `VITE_USE_MOCK=false` + `VITE_API_URL=/api` di `apps/web/.env` dan pakai `src/api/http.ts` (axios: base URL relatif `/api`, interceptor, normalisasi error).

> Base URL **selalu relatif** (`import.meta.env.VITE_API_URL ?? '/api'`) — tidak ada hardcode `localhost`, siap di belakang reverse proxy/Cloudflare.

## 📜 Skrip

| Perintah | Aksi |
|---|---|
| `pnpm dev` | Dev server (5173) |
| `pnpm build` | Build produksi → `apps/web/dist` |
| `pnpm preview` | Sajikan hasil build |
| `pnpm typecheck` | Cek tipe (vue-tsc) |
