import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// Target API backend untuk proxy /api (same-origin di dev & preview).
// JANGAN hardcode di kode aplikasi — pakai VITE_API_URL ?? '/api'.
const API_TARGET = process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:3000'

// Service worker "bunuh diri" untuk DEV. Saat ada SW basi sisa build produksi
// di localhost, browser memeriksa /sw.js tiap navigasi → menerima skrip ini →
// menghapus semua cache, meng-unregister dirinya, lalu reload semua tab.
// Efeknya: lingkungan dev otomatis bersih dari shell basi (halaman kosong).
const KILL_SW = `self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',(e)=>{e.waitUntil((async()=>{
  try{const ks=await caches.keys();await Promise.all(ks.map(k=>caches.delete(k)))}catch(_){}
  await self.registration.unregister();
  const cs=await self.clients.matchAll({type:'window'});
  cs.forEach((c)=>c.navigate(c.url));
})())});`

function devKillStaleSW() {
  return {
    name: 'kill-stale-sw-dev',
    apply: 'serve' as const,
    configureServer(server: { middlewares: { use: (path: string, fn: (req: unknown, res: { setHeader: (k: string, v: string) => void; end: (b: string) => void }) => void) => void } }) {
      server.middlewares.use('/sw.js', (_req, res) => {
        res.setHeader('Content-Type', 'application/javascript')
        res.setHeader('Cache-Control', 'no-store')
        res.end(KILL_SW)
      })
    },
  }
}

export default defineConfig({
  plugins: [
    devKillStaleSW(),
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
        // Jangan layani shell SPA untuk permintaan API (hindari respons basi).
        navigateFallbackDenylist: [/^\/api/],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
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
