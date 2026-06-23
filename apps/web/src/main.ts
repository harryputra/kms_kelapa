import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { registerSW } from 'virtual:pwa-register'
import App from './App.vue'
import { router } from './router'
import { useUiStore } from './stores/ui'
import './styles/index.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

// Service worker (PWA offline). Aktif pada build/preview & produksi.
const updateSW = registerSW({
  onOfflineReady() {
    useUiStore().success('Aplikasi siap dipakai offline — cetak biru bisa dibuka tanpa sinyal.')
  },
  onNeedRefresh() {
    const ui = useUiStore()
    ui.info('Versi baru tersedia. Memuat ulang…')
    setTimeout(() => updateSW(true), 1500)
  },
})
