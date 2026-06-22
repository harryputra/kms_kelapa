import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Target API backend untuk proxy /api (same-origin di dev & preview).
// JANGAN hardcode di kode aplikasi — pakai VITE_API_URL ?? '/api'.
const API_TARGET = process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:3000'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Dev server lokal (tidak untuk publik): izinkan semua host agar mudah diakses
    // via IP LAN / container. Pembatasan host yang ketat ada di `preview` (deploy).
    host: true, // bind 0.0.0.0
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': { target: API_TARGET, changeOrigin: true },
    },
  },
  preview: {
    // Penyaji produksi (di belakang reverse proxy/Cloudflare) — host eksplisit.
    host: true,
    port: 4173,
    allowedHosts: ['.trin-polman.id', 'localhost'],
    proxy: {
      '/api': { target: API_TARGET, changeOrigin: true },
    },
  },
})
