import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { registerSW } from 'virtual:pwa-register'
import App from './App.vue'
import { router } from './router'
import { useUiStore } from './stores/ui'
import './styles/index.css'

// --- Pemulihan diri dari shell/chunk basi (akar penyebab "halaman kosong") ---
let recovering = false
function recoverStale() {
  if (recovering) return
  recovering = true
  location.reload()
}
// Vite gagal memuat chunk lazy (mis. referensi hash lama dari service worker basi).
window.addEventListener('vite:preloadError', (e) => {
  e.preventDefault()
  recoverStale()
})

// Di DEV: bersihkan service worker & cache sisa build produksi pada origin yang sama
// (mis. setelah pernah `deploy`/`preview` di localhost) agar tak menyajikan shell basi.
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister())).catch(() => {})
  if ('caches' in window) caches.keys().then((ks) => ks.forEach((k) => caches.delete(k))).catch(() => {})
}

const app = createApp(App)

// Jangan pernah gagal diam-diam → tampilkan pesan, dan auto-pulih untuk chunk basi.
app.config.errorHandler = (err) => {
  const msg = String((err as Error)?.message ?? err)
  if (/dynamically imported module|Importing a module script failed|Failed to fetch dynamically|Loading chunk/i.test(msg)) {
    recoverStale()
    return
  }
  console.error('[app]', err)
  try {
    useUiStore().error('Terjadi kesalahan tak terduga. Coba muat ulang halaman.')
  } catch {
    /* ui store belum siap */
  }
}

app.use(createPinia())
app.use(router)
app.mount('#app')

// Service worker (PWA offline). Hanya aktif pada build/preview & produksi.
if (import.meta.env.PROD) {
  const updateSW = registerSW({
    onOfflineReady() {
      useUiStore().success('Aplikasi siap dipakai offline — cetak biru bisa dibuka tanpa sinyal.')
    },
    onNeedRefresh() {
      useUiStore().info('Versi baru tersedia. Memuat ulang…')
      setTimeout(() => updateSW(true), 1200)
    },
  })
}
