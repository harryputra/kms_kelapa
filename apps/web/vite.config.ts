import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// Target API backend untuk proxy /api (same-origin di dev & preview).
// JANGAN hardcode di kode aplikasi — pakai VITE_API_URL ?? '/api'.
const API_TARGET = process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:3000'

export default defineConfig({
  plugins: [
    vue(),
    // PWA offline-first — UMKM bisa membaca cetak biru tanpa sinyal di lapangan.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'COCONEXUS — Pengetahuan Limbah Kelapa',
        short_name: 'COCONEXUS',
        description: 'Repositori teknis & kolaborasi pengelolaan limbah kelapa untuk UMKM.',
        lang: 'id',
        theme_color: '#2D6A4F',
        background_color: '#F6FAF7',
        display: 'standalone',
        start_url: '/',
        icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        navigateFallback: '/',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
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
