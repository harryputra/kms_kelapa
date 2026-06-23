import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import type { Role } from '@/types'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

type Layout = 'public' | 'auth' | 'dashboard'

declare module 'vue-router' {
  interface RouteMeta {
    layout?: Layout
    requiresAuth?: boolean
    roles?: Role[]
    title?: string
  }
}

const routes: RouteRecordRaw[] = [
  // ---------- PUBLIK ----------
  { path: '/', name: 'home', component: () => import('@/views/public/LandingView.vue'), meta: { layout: 'public', title: 'Beranda' } },
  // Cetak Biru Teknis (objek pengetahuan utama / pembeda)
  { path: '/cetak-biru', name: 'blueprints', component: () => import('@/views/blueprint/BlueprintsView.vue'), meta: { layout: 'public', title: 'Cetak Biru Teknis' } },
  { path: '/cetak-biru/:id', name: 'blueprint-detail', component: () => import('@/views/blueprint/BlueprintDetailView.vue'), meta: { layout: 'public', title: 'Detail Cetak Biru' } },
  { path: '/pohon-nilai', name: 'value-tree', component: () => import('@/views/blueprint/ValueTreeView.vue'), meta: { layout: 'public', title: 'Pohon Nilai Kelapa' } },
  { path: '/tanya', name: 'tanya', component: () => import('@/views/blueprint/TanyaPakarView.vue'), meta: { layout: 'public', title: 'Tanya Pakar' } },
  // Simbiosis industri
  { path: '/bursa', name: 'bursa', component: () => import('@/views/community/BursaView.vue'), meta: { layout: 'public', title: 'Bursa Limbah' } },
  { path: '/direktori', name: 'direktori', component: () => import('@/views/community/DirektoriView.vue'), meta: { layout: 'public', title: 'Direktori UMKM' } },
  // Wawasan/Cerita (eks-Artikel — naratif pendukung)
  { path: '/articles', name: 'articles', component: () => import('@/views/public/ArticlesView.vue'), meta: { layout: 'public', title: 'Wawasan' } },
  { path: '/articles/:id', name: 'article-detail', component: () => import('@/views/public/ArticleDetailView.vue'), meta: { layout: 'public', title: 'Detail Wawasan' } },
  { path: '/forum', name: 'forum', component: () => import('@/views/forum/ForumListView.vue'), meta: { layout: 'public', title: 'Forum' } },
  { path: '/forum/baru', name: 'forum-new', component: () => import('@/views/forum/NewTopicView.vue'), meta: { layout: 'public', requiresAuth: true, title: 'Topik Baru' } },
  { path: '/forum/:id', name: 'forum-topic', component: () => import('@/views/forum/ForumTopicView.vue'), meta: { layout: 'public', title: 'Topik' } },
  { path: '/tentang', name: 'about', component: () => import('@/views/public/AboutView.vue'), meta: { layout: 'public', title: 'Tentang' } },

  // ---------- AUTH ----------
  { path: '/login', name: 'login', component: () => import('@/views/auth/LoginView.vue'), meta: { layout: 'auth', title: 'Masuk' } },
  { path: '/register', name: 'register', component: () => import('@/views/auth/RegisterView.vue'), meta: { layout: 'auth', title: 'Daftar' } },

  // ---------- PENGGUNA ----------
  { path: '/dashboard', name: 'dashboard', component: () => import('@/views/user/DashboardView.vue'), meta: { layout: 'dashboard', requiresAuth: true, title: 'Dashboard' } },
  { path: '/dashboard/cetak-biru', name: 'my-blueprints', component: () => import('@/views/blueprint/MyBlueprintsView.vue'), meta: { layout: 'dashboard', requiresAuth: true, title: 'Cetak Biru Saya' } },
  { path: '/dashboard/cetak-biru/baru', name: 'blueprint-new', component: () => import('@/views/blueprint/BlueprintFormView.vue'), meta: { layout: 'dashboard', requiresAuth: true, title: 'Tulis Cetak Biru' } },
  { path: '/dashboard/articles', name: 'my-articles', component: () => import('@/views/user/MyArticlesView.vue'), meta: { layout: 'dashboard', requiresAuth: true, title: 'Wawasan Saya' } },
  { path: '/dashboard/submit', name: 'submit', component: () => import('@/views/user/SubmitArticleView.vue'), meta: { layout: 'dashboard', requiresAuth: true, title: 'Tulis Wawasan' } },
  { path: '/dashboard/bookmarks', name: 'bookmarks', component: () => import('@/views/user/BookmarksView.vue'), meta: { layout: 'dashboard', requiresAuth: true, title: 'Bacaan Saya' } },
  { path: '/dashboard/notifications', name: 'notifications', component: () => import('@/views/user/NotificationsView.vue'), meta: { layout: 'dashboard', requiresAuth: true, title: 'Notifikasi' } },
  { path: '/dashboard/profile', name: 'profile', component: () => import('@/views/user/ProfileView.vue'), meta: { layout: 'dashboard', requiresAuth: true, title: 'Profil' } },

  // ---------- MODERATOR ----------
  { path: '/moderator', name: 'mod-dashboard', component: () => import('@/views/moderator/ModeratorDashboard.vue'), meta: { layout: 'dashboard', requiresAuth: true, roles: ['moderator', 'admin'], title: 'Dashboard Moderator' } },
  { path: '/moderator/cetak-biru', name: 'blueprint-curation', component: () => import('@/views/moderator/BlueprintCurationView.vue'), meta: { layout: 'dashboard', requiresAuth: true, roles: ['moderator', 'admin'], title: 'Kurasi Cetak Biru' } },
  { path: '/moderator/review', name: 'review-queue', component: () => import('@/views/moderator/ReviewQueueView.vue'), meta: { layout: 'dashboard', requiresAuth: true, roles: ['moderator', 'admin'], title: 'Antrean Review' } },
  { path: '/moderator/review/:id', name: 'review-detail', component: () => import('@/views/moderator/ReviewDetailView.vue'), meta: { layout: 'dashboard', requiresAuth: true, roles: ['moderator', 'admin'], title: 'Review Artikel' } },
  { path: '/moderator/templates', name: 'templates', component: () => import('@/views/moderator/TemplatesView.vue'), meta: { layout: 'dashboard', requiresAuth: true, roles: ['moderator', 'admin'], title: 'Template' } },
  { path: '/moderator/comments', name: 'mod-comments', component: () => import('@/views/moderator/CommentModerationView.vue'), meta: { layout: 'dashboard', requiresAuth: true, roles: ['moderator', 'admin'], title: 'Moderasi Komentar' } },
  { path: '/moderator/reports', name: 'mod-reports', component: () => import('@/views/moderator/ReportsView.vue'), meta: { layout: 'dashboard', requiresAuth: true, roles: ['moderator', 'admin'], title: 'Laporan' } },

  // ---------- ADMIN ----------
  { path: '/admin', name: 'admin-dashboard', component: () => import('@/views/admin/AdminDashboard.vue'), meta: { layout: 'dashboard', requiresAuth: true, roles: ['admin'], title: 'Dashboard Admin' } },
  { path: '/admin/users', name: 'admin-users', component: () => import('@/views/admin/UsersView.vue'), meta: { layout: 'dashboard', requiresAuth: true, roles: ['admin'], title: 'Manajemen Pengguna' } },
  { path: '/admin/settings', name: 'admin-settings', component: () => import('@/views/admin/SettingsView.vue'), meta: { layout: 'dashboard', requiresAuth: true, roles: ['admin'], title: 'Pengaturan Sistem' } },
  { path: '/admin/menu', name: 'admin-menu', component: () => import('@/views/admin/MenuManagerView.vue'), meta: { layout: 'dashboard', requiresAuth: true, roles: ['admin'], title: 'Menu Manager' } },
  { path: '/admin/recycle-bin', name: 'admin-recycle', component: () => import('@/views/admin/RecycleBinView.vue'), meta: { layout: 'dashboard', requiresAuth: true, roles: ['admin'], title: 'Recycle Bin' } },
  { path: '/admin/audit', name: 'admin-audit', component: () => import('@/views/admin/AuditLogView.vue'), meta: { layout: 'dashboard', requiresAuth: true, roles: ['admin'], title: 'Audit Log' } },

  // ---------- 404 ----------
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue'), meta: { layout: 'public', title: 'Tidak Ditemukan' } },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, saved) {
    return saved ?? { top: 0 }
  },
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!auth.ready) await auth.bootstrap()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    useUiStore().warning('Silakan login untuk mengakses halaman tersebut.')
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.roles && !to.meta.roles.includes(auth.role)) {
    useUiStore().error('Anda tidak memiliki akses ke halaman tersebut.')
    return auth.isAuthenticated ? { name: 'dashboard' } : { name: 'login' }
  }

  // Sudah login tapi membuka halaman auth → arahkan ke dashboard
  if ((to.name === 'login' || to.name === 'register') && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }
  return true
})

router.afterEach((to) => {
  const base = (import.meta.env.VITE_APP_NAME ?? 'COCONEXUS') as string
  document.title = to.meta.title ? `${to.meta.title} · ${base}` : `${base} — Pengetahuan Limbah Kelapa`
})
