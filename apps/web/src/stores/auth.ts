import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { api, setAccessToken } from '@/api'
import type { Role, UserProfileDetail } from '@/types'

const UID_KEY = 'coco_uid'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfileDetail | null>(null)
  const ready = ref(false)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const role = computed<Role>(() => user.value?.role ?? 'guest')
  const isModerator = computed(() => role.value === 'moderator' || role.value === 'admin')
  const isAdmin = computed(() => role.value === 'admin')
  const initials = computed(() =>
    (user.value?.display_name ?? '')
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase(),
  )

  /** Pulihkan sesi (mock: dari localStorage). Dipanggil sekali saat app boot. */
  async function bootstrap() {
    const uid = Number(localStorage.getItem(UID_KEY))
    if (uid) {
      api.setSession(uid)
      try {
        user.value = await api.me()
      } catch {
        clearSession()
      }
    }
    ready.value = true
  }

  async function login(email: string, password: string) {
    loading.value = true
    try {
      const res = await api.login(email, password)
      setAccessToken(res.access_token)
      user.value = res.user
      localStorage.setItem(UID_KEY, String(res.user.id))
      return res.user
    } finally {
      loading.value = false
    }
  }

  async function register(email: string, password: string, displayName: string) {
    loading.value = true
    try {
      return await api.register(email, password, displayName)
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await api.logout()
    clearSession()
  }

  function clearSession() {
    user.value = null
    setAccessToken(null)
    api.setSession(null)
    localStorage.removeItem(UID_KEY)
  }

  return {
    user, ready, loading,
    isAuthenticated, role, isModerator, isAdmin, initials,
    bootstrap, login, register, logout, clearSession,
  }
})
