# COCONEXUS KMS v2.0 — Frontend

Platform manajemen pengetahuan pengelolaan **limbah buah kelapa** untuk UMKM agroindustri Indonesia. Repositori dua arah (pakar + UMKM) dengan alur submission→review, interaksi sosial, forum, notifikasi, gamifikasi, dan panel admin.

> **Tahap saat ini:** Frontend (Vue 3 + TypeScript) lengkap dengan **mock API in-memory** — bisa dijalankan & didemokan **tanpa backend**. Backend (Express + Prisma + MySQL) menyusul; lihat [`rencana_pengembangan.md`](rencana_pengembangan.md).

---

## 🚀 Menjalankan (sekali klik)

```bash
# Linux / macOS / Git Bash
./run.sh

# Windows
run.bat
```

Atau manual:

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

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

## 🔌 Mock ↔ Backend nyata

Frontend memanggil satu **facade** (`src/api/index.ts`). Default memakai mock (`VITE_USE_MOCK=true`). Saat backend Express siap:

1. set `VITE_USE_MOCK=false` dan `VITE_API_URL=/api` di `apps/web/.env`,
2. implementasikan klien nyata memakai `src/api/http.ts` (axios sudah dikonfigurasi: base URL relatif `/api`, interceptor, normalisasi error).

> Base URL **selalu relatif** (`import.meta.env.VITE_API_URL ?? '/api'`) — tidak ada hardcode `localhost`, siap di belakang reverse proxy/Cloudflare.

## 📜 Skrip

| Perintah | Aksi |
|---|---|
| `pnpm dev` | Dev server (5173) |
| `pnpm build` | Build produksi → `apps/web/dist` |
| `pnpm preview` | Sajikan hasil build |
| `pnpm typecheck` | Cek tipe (vue-tsc) |
