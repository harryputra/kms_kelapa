#!/usr/bin/env sh
# Entrypoint produksi API COCONEXUS — sinkron skema + seed esensial, lalu start.
set -e
cd /app/apps/api

echo "▶ Menyiapkan skema database (prisma db push)…"
pnpm exec prisma db push --skip-generate
# Catatan: db push aman & idempoten untuk tahap ini. Pengerasan berikutnya:
# ganti ke 'prisma migrate deploy' dengan migrasi resmi.

echo "▶ Seeding (esensial idempoten; demo bila SEED_DEMO=true)…"
pnpm exec prisma db seed || echo "⚠ Seed dilewati/gagal sebagian (lanjut)."

echo "✅ Memulai API…"
exec node dist/server.js
