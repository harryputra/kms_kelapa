#!/usr/bin/env bash
# =====================================================================
#  COCONEXUS KMS v2.0 — one-click runner (Linux/macOS/Git Bash)
#  Tahap saat ini: FRONTEND (Vue 3 + TS) dengan mock API in-memory.
#  Backend (Express + Prisma + MySQL) & deploy Docker menyusul —
#  lihat rencana_pengembangan.md §11.
# =====================================================================
set -euo pipefail
cd "$(dirname "$0")"

# ---- Warna (jika TTY) ----
if [ -t 1 ]; then
  C_G='\033[0;32m'; C_Y='\033[1;33m'; C_R='\033[0;31m'; C_B='\033[0;36m'; C_D='\033[2m'; C_N='\033[0m'
else
  C_G=''; C_Y=''; C_R=''; C_B=''; C_D=''; C_N=''
fi
info()  { printf "${C_B}➜${C_N} %s\n" "$1"; }
ok()    { printf "${C_G}✓${C_N} %s\n" "$1"; }
warn()  { printf "${C_Y}⚠${C_N} %s\n" "$1"; }
err()   { printf "${C_R}✗${C_N} %s\n" "$1"; }

WEB_PORT="${PORT:-5173}"
PREVIEW_PORT="${PREVIEW_PORT:-4173}"

# ---- Prasyarat ----
check_prereq() {
  command -v node >/dev/null 2>&1 || { err "Node.js tidak ditemukan. Instal Node 20+: https://nodejs.org"; exit 1; }
  local major; major="$(node -v | sed 's/v\([0-9]*\).*/\1/')"
  [ "$major" -ge 20 ] || warn "Node $(node -v) terdeteksi — disarankan Node 20+."
  if ! command -v pnpm >/dev/null 2>&1; then
    warn "pnpm tidak ditemukan, mengaktifkan via corepack…"
    corepack enable >/dev/null 2>&1 || { err "Gagal mengaktifkan pnpm. Jalankan: npm i -g pnpm"; exit 1; }
  fi
}

# ---- Auto-config .env ----
ensure_env() {
  if [ ! -f apps/web/.env ]; then
    cp apps/web/.env.example apps/web/.env
    ok "apps/web/.env dibuat dari .env.example (mode mock aktif)."
  fi
}

# ---- Install deps (idempotent) ----
install_deps() {
  if [ ! -d node_modules ] || [ ! -d apps/web/node_modules ]; then
    info "Memasang dependensi (pnpm install)…"
    pnpm install
    ok "Dependensi terpasang."
  else
    ok "Dependensi sudah terpasang (lewati)."
  fi
}

# ---- Cek port bentrok ----
port_in_use() {
  local p="$1"
  if command -v ss >/dev/null 2>&1; then ss -ltn 2>/dev/null | grep -q ":$p ";
  elif command -v lsof >/dev/null 2>&1; then lsof -iTCP:"$p" -sTCP:LISTEN >/dev/null 2>&1;
  else netstat -an 2>/dev/null | grep -q "[:.]$p .*LISTEN"; fi
}

summary() {
  echo ""
  printf "${C_G}════════════════════════════════════════════════════════════${C_N}\n"
  printf "  ${C_G}COCONEXUS KMS — Frontend siap!${C_N}\n"
  printf "${C_G}════════════════════════════════════════════════════════════${C_N}\n"
  echo "  URL Dev      : http://localhost:${WEB_PORT}"
  echo ""
  printf "  ${C_B}Quick Login (demo):${C_N}\n"
  echo "    • Admin     : admin@coconexus.test     / Admin#1234"
  echo "    • Moderator : moderator@coconexus.test / Mod#1234"
  echo "    • Pengguna  : user@coconexus.test      / User#1234"
  echo "    (tersedia juga tombol Quick Login di halaman /login)"
  echo ""
  printf "  ${C_D}Stop: Ctrl+C  ·  Bantuan: ./run.sh help${C_N}\n"
  printf "${C_G}════════════════════════════════════════════════════════════${C_N}\n\n"
}

cmd_up() {
  check_prereq; ensure_env; install_deps
  if port_in_use "$WEB_PORT"; then
    warn "Port ${WEB_PORT} sudah dipakai. Mungkin app ini sudah jalan."
    warn "Ganti port: PORT=5174 ./run.sh  (atau hentikan proses yang memakai port)."
    exit 1
  fi
  summary
  info "Menjalankan dev server (mode DEV lokal)…"
  PORT="$WEB_PORT" pnpm --filter @coconexus/web dev -- --port "$WEB_PORT"
}

cmd_build()   { check_prereq; ensure_env; install_deps; info "Build produksi…"; pnpm --filter @coconexus/web build; ok "Hasil build di apps/web/dist"; }
cmd_preview() { cmd_build; info "Menyajikan hasil build di http://localhost:${PREVIEW_PORT}"; pnpm --filter @coconexus/web preview -- --port "$PREVIEW_PORT"; }
cmd_typecheck(){ check_prereq; install_deps; pnpm --filter @coconexus/web typecheck && ok "Typecheck lolos."; }

cmd_deploy() {
  warn "Deploy produksi PENUH (Docker + backend + Cloudflare Tunnel) tersedia setelah"
  warn "backend dibangun — lihat rencana_pengembangan.md §11."
  info "Sementara ini, build statis frontend (apps/web/dist) bisa disajikan web server apa pun."
  cmd_build
}

cmd_clean() {
  warn "Menghapus node_modules & dist…"
  rm -rf node_modules apps/web/node_modules apps/web/dist
  ok "Bersih. Jalankan ./run.sh untuk setup ulang."
}

cmd_doctor() {
  echo "Node    : $(node -v 2>/dev/null || echo 'TIDAK ADA')"
  echo "pnpm    : $(pnpm -v 2>/dev/null || echo 'TIDAK ADA')"
  echo ".env    : $([ -f apps/web/.env ] && echo 'ada' || echo 'belum (akan dibuat otomatis)')"
  echo "deps    : $([ -d apps/web/node_modules ] && echo 'terpasang' || echo 'belum')"
}

cmd_help() {
  cat <<EOF
COCONEXUS KMS — runner (frontend)

Penggunaan: ./run.sh [perintah]

  (kosong) | up   Setup penuh + jalankan DEV lokal (default)
  build           Build produksi (apps/web/dist)
  preview         Build lalu sajikan hasil build (port ${PREVIEW_PORT})
  typecheck       Cek tipe TypeScript (vue-tsc)
  deploy | prod   Info deploy produksi + build statis (Docker menyusul)
  clean           Hapus node_modules & dist
  doctor          Diagnosa lingkungan
  help            Tampilkan bantuan ini

Variabel: PORT=5174 ./run.sh   (ganti port dev)
EOF
}

case "${1:-up}" in
  up|"")       cmd_up ;;
  build)       cmd_build ;;
  preview)     cmd_preview ;;
  typecheck)   cmd_typecheck ;;
  deploy|prod) cmd_deploy ;;
  clean)       cmd_clean ;;
  doctor)      cmd_doctor ;;
  help|-h|--help) cmd_help ;;
  *) err "Perintah tidak dikenal: $1"; cmd_help; exit 1 ;;
esac
