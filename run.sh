#!/usr/bin/env bash
# =====================================================================
#  COCONEXUS KMS v2.0 — one-click runner (Linux/macOS/Git Bash)
#  dev (default) : MySQL(Docker) + API(host) + Web(host) — backend nyata
#  deploy/prod   : MySQL + API + Web semua container (persisten, auto-restart)
# =====================================================================
set -euo pipefail
cd "$(dirname "$0")"

if [ -t 1 ]; then C_G='\033[0;32m'; C_Y='\033[1;33m'; C_R='\033[0;31m'; C_B='\033[0;36m'; C_D='\033[2m'; C_N='\033[0m';
else C_G=''; C_Y=''; C_R=''; C_B=''; C_D=''; C_N=''; fi
info(){ printf "${C_B}➜${C_N} %s\n" "$1"; }
ok(){ printf "${C_G}✓${C_N} %s\n" "$1"; }
warn(){ printf "${C_Y}⚠${C_N} %s\n" "$1"; }
err(){ printf "${C_R}✗${C_N} %s\n" "$1"; }

COMPOSE="docker compose -f infra/docker-compose.yml"
WEB_PORT="${PORT:-5173}"
PROD_PORT=8090

# Hanya butuh Docker — dipakai oleh deploy/prod (semua build & jalan di container).
# Server (mis. lab) TIDAK perlu Node/pnpm untuk mode produksi.
check_docker(){
  command -v docker >/dev/null 2>&1 || { err "Docker tidak ada. Instal Docker Engine + Compose v2."; exit 1; }
  docker info >/dev/null 2>&1 || { err "Docker daemon tidak merespons / tak ada akses. Pastikan daemon hidup & user di grup 'docker'."; exit 1; }
  docker compose version >/dev/null 2>&1 || { err "Docker Compose v2 tidak ada. Instal plugin 'docker compose'."; exit 1; }
}

# Butuh Node + pnpm + Docker — dipakai oleh mode DEV NYATA (full) di host.
check_prereq(){
  command -v node >/dev/null 2>&1 || { err "Node.js tidak ada. Instal Node 20+."; exit 1; }
  command -v docker >/dev/null 2>&1 || { err "Docker tidak ada / daemon mati. Nyalakan Docker Desktop."; exit 1; }
  docker info >/dev/null 2>&1 || { err "Docker daemon tidak merespons. Nyalakan Docker."; exit 1; }
  command -v pnpm >/dev/null 2>&1 || { warn "pnpm tidak ada, aktifkan via corepack…"; corepack enable >/dev/null 2>&1 || { err "Jalankan: npm i -g pnpm"; exit 1; }; }
}

ensure_env(){
  [ -f apps/api/.env ] || { cp apps/api/.env.example apps/api/.env; ok "apps/api/.env dibuat dari contoh."; }
  [ -f apps/web/.env ] || { cp apps/web/.env.example apps/web/.env; ok "apps/web/.env dibuat dari contoh."; }
}

wait_mysql(){
  info "Menunggu MySQL siap…"
  for _ in $(seq 1 40); do
    [ "$(docker inspect --format '{{.State.Health.Status}}' coconexus-mysql 2>/dev/null)" = "healthy" ] && { ok "MySQL siap."; return 0; }
    sleep 2
  done
  err "MySQL tidak kunjung siap."; exit 1
}

port_in_use(){ if command -v ss >/dev/null 2>&1; then ss -ltn 2>/dev/null | grep -q ":$1 "; else netstat -an 2>/dev/null | grep -q "[:.]$1 .*LISTEN"; fi; }

secret_check(){
  if [ -z "${JWT_ACCESS_SECRET:-}" ] || [ "${ADMIN_PASSWORD:-Admin#1234}" = "Admin#1234" ]; then
    warn "Secret produksi masih default (JWT_*/ADMIN_PASSWORD)."
    warn "Sebelum publik: export JWT_ACCESS_SECRET=… JWT_REFRESH_SECRET=… ADMIN_PASSWORD=… lalu deploy ulang."
  fi
}

api_db_setup(){
  info "Menyiapkan database (generate + push + seed)…"
  pnpm --filter @coconexus/api db:generate >/dev/null
  pnpm --filter @coconexus/api db:push
  pnpm --filter @coconexus/api db:seed
}

summary_dev(){
  echo ""; printf "${C_G}════════════════════════════════════════════════════════════${C_N}\n"
  printf "  ${C_G}COCONEXUS — DEV (backend nyata)${C_N}\n"
  printf "${C_G}════════════════════════════════════════════════════════════${C_N}\n"
  echo "  Web : http://localhost:${WEB_PORT}     API : http://localhost:3000/api/v1"
  echo ""
  printf "  ${C_B}Quick Login:${C_N} admin@coconexus.test / Admin#1234  ·  user@coconexus.test / User#1234"
  echo ""; printf "  ${C_D}Stop: Ctrl+C  ·  DB tetap jalan (./run.sh down untuk stop MySQL)${C_N}\n"
  printf "${C_G}════════════════════════════════════════════════════════════${C_N}\n\n"
}

summary_mock(){
  echo ""; printf "${C_G}════════════════════════════════════════════════════════════${C_N}\n"
  printf "  ${C_G}COCONEXUS — DEV MOCK (semua data, TANPA backend)${C_N}\n"
  printf "${C_G}════════════════════════════════════════════════════════════${C_N}\n"
  echo "  Web : http://localhost:${WEB_PORT}"
  echo ""
  printf "  ${C_B}Quick Login (tombol di /login):${C_N} Admin / Moderator / Pengguna"
  echo ""; printf "  ${C_D}Butuh database nyata? → ./run.sh full   |   Produksi → ./run.sh deploy${C_N}\n"
  printf "${C_G}════════════════════════════════════════════════════════════${C_N}\n\n"
}

# DEFAULT: mock (web saja, semua data, tanpa Docker/API) — paling andal.
cmd_up(){
  command -v node >/dev/null 2>&1 || { err "Node.js 20+ diperlukan."; exit 1; }
  command -v pnpm >/dev/null 2>&1 || corepack enable >/dev/null 2>&1 || { err "Jalankan: npm i -g pnpm"; exit 1; }
  [ -f apps/web/.env ] || cp apps/web/.env.example apps/web/.env
  rm -f apps/web/.env.local   # pastikan mode MOCK (cegah jebakan real tanpa API)
  if port_in_use "$WEB_PORT"; then warn "Port ${WEB_PORT} dipakai — mungkin app sudah jalan. Ganti: PORT=5174 ./run.sh"; exit 1; fi
  info "Memasang dependensi…"; pnpm install
  summary_mock
  info "Menjalankan Web (mode MOCK)…"
  PORT="$WEB_PORT" pnpm --filter @coconexus/web dev -- --port "$WEB_PORT"
}

# FULL: stack dev nyata (MySQL + API + Web). .env.local dibersihkan saat keluar.
cmd_full(){
  check_prereq; ensure_env
  trap 'rm -f apps/web/.env.local' EXIT INT TERM
  if port_in_use "$WEB_PORT"; then warn "Port ${WEB_PORT} dipakai. Ganti: PORT=5174 ./run.sh full"; exit 1; fi
  $COMPOSE up -d mysql; wait_mysql
  info "Memasang dependensi…"; pnpm install
  api_db_setup
  printf "VITE_USE_MOCK=false\nVITE_API_URL=/api/v1\n" > apps/web/.env.local
  summary_dev
  info "Menjalankan API + Web (dev, backend nyata)…"
  PORT="$WEB_PORT" pnpm -r --parallel run dev
}

cmd_deploy(){
  check_docker; secret_check
  if port_in_use "$PROD_PORT"; then warn "Port ${PROD_PORT} dipakai. Hentikan layanan lain atau ubah port di compose."; fi
  info "Build & start stack PRODUKSI (mysql + api + web)…"
  $COMPOSE --profile prod up -d --build
  info "Menunggu web siap…"
  for _ in $(seq 1 40); do curl -sf -o /dev/null "http://localhost:${PROD_PORT}/" && break; sleep 2; done
  echo ""; printf "${C_G}════════════════════════════════════════════════════════════${C_N}\n"
  printf "  ${C_G}COCONEXUS — PRODUKSI aktif (detached, auto-restart)${C_N}\n"
  printf "${C_G}════════════════════════════════════════════════════════════${C_N}\n"
  echo "  Lokal  : http://localhost:${PROD_PORT}"
  echo "  Publik : tambah Public Hostname Cloudflare → localhost:${PROD_PORT}"
  echo "           (mis. kms.trin-polman.id)"
  echo ""
  echo "  Cek TTFB:"
  echo "    curl -s -o /dev/null -w 'TTFB:%{time_starttransfer} Total:%{time_total}\\n' http://localhost:${PROD_PORT}/api/v1/health"
  echo ""
  printf "  ${C_D}Log: ./run.sh prod-logs  ·  Stop: ./run.sh prod-down  ·  Update: git pull && ./run.sh deploy${C_N}\n"
  printf "${C_G}════════════════════════════════════════════════════════════${C_N}\n\n"
}

case "${1:-up}" in
  up|"")        cmd_up ;;
  full|dev-full) cmd_full ;;
  deploy|prod)  cmd_deploy ;;
  prod-logs)    $COMPOSE --profile prod logs -f ;;
  prod-down)    $COMPOSE --profile prod down ;;
  prod-restart) $COMPOSE --profile prod restart ;;
  down)         $COMPOSE down ;;
  seed)         pnpm --filter @coconexus/api db:seed ;;
  build)        check_prereq; pnpm install; pnpm -r build; ok "Build selesai." ;;
  doctor)
    echo "Node   : $(node -v 2>/dev/null || echo TIDAK ADA)"
    echo "pnpm   : $(pnpm -v 2>/dev/null || echo TIDAK ADA)"
    echo "Docker : $(docker info --format '{{.ServerVersion}}' 2>/dev/null || echo 'mati/tidak ada')"
    echo "MySQL  : $(docker inspect --format '{{.State.Health.Status}}' coconexus-mysql 2>/dev/null || echo 'belum jalan')"
    ;;
  clean)
    warn "Menghapus node_modules, dist, dan .env.local web…"
    rm -rf node_modules apps/*/node_modules apps/web/dist apps/web/.env.local apps/api/dist
    ok "Bersih."
    ;;
  help|-h|--help)
    cat <<EOF
COCONEXUS — runner

Penggunaan: ./run.sh [perintah]

  (kosong)|up   DEV MOCK: Web saja, semua data, tanpa backend [default, paling andal]
  full          DEV NYATA: MySQL(Docker) + API + Web (backend asli)
  deploy|prod   PRODUKSI: semua container, detached + auto-restart
  prod-logs     Lihat log produksi (Ctrl+C keluar, app tetap jalan)
  prod-down     Hentikan stack produksi
  prod-restart  Restart stack produksi
  down          Stop MySQL (dev)
  seed          Jalankan ulang seed database
  build         Build api + web
  doctor        Diagnosa lingkungan
  clean         Hapus node_modules/dist/.env.local
  help          Bantuan ini

Secret produksi: export JWT_ACCESS_SECRET / JWT_REFRESH_SECRET / ADMIN_PASSWORD sebelum 'deploy'.
EOF
    ;;
  *) err "Perintah tidak dikenal: $1"; exit 1 ;;
esac
