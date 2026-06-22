<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { ShieldCheck, Gavel, User as UserIcon, Zap } from 'lucide-vue-next'
import { api, ApiError } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const error = ref('')

const quick = [
  { role: 'Admin', email: 'admin@coconexus.test', password: 'Admin#1234', icon: ShieldCheck, tone: 'bg-danger/10 text-danger' },
  { role: 'Moderator', email: 'moderator@coconexus.test', password: 'Mod#1234', icon: Gavel, tone: 'bg-info/10 text-info' },
  { role: 'Pengguna', email: 'user@coconexus.test', password: 'User#1234', icon: UserIcon, tone: 'bg-primary-50 text-primary-600' },
]

async function doLogin() {
  error.value = ''
  try {
    const user = await auth.login(email.value.trim(), password.value)
    ui.success(`Selamat datang, ${user.display_name}!`)
    const redirect = (route.query.redirect as string) || defaultHome()
    router.push(redirect)
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Gagal masuk. Coba lagi.'
  }
}

function defaultHome() {
  if (auth.isAdmin) return '/admin'
  if (auth.isModerator) return '/moderator'
  return '/dashboard'
}

async function quickLogin(acc: (typeof quick)[number]) {
  email.value = acc.email
  password.value = acc.password
  await doLogin()
}

void api
</script>

<template>
  <div class="animate-fade-in">
    <h1 class="font-display text-2xl font-bold text-ink">Selamat datang kembali</h1>
    <p class="mt-1.5 text-sm text-muted">Masuk untuk melanjutkan ke COCONEXUS.</p>

    <form class="mt-7 space-y-4" @submit.prevent="doLogin">
      <AppInput id="email" v-model="email" label="Email" type="email" placeholder="nama@email.com" autocomplete="email" required />
      <AppInput id="password" v-model="password" label="Kata Sandi" type="password" placeholder="••••••••" autocomplete="current-password" required :error="error" />
      <div class="flex items-center justify-between">
        <label class="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" class="h-4 w-4 rounded accent-primary-600" /> Ingat saya
        </label>
        <a href="#" class="text-sm font-medium text-primary-600 hover:underline">Lupa sandi?</a>
      </div>
      <AppButton type="submit" :loading="auth.loading" block size="lg">Masuk</AppButton>
    </form>

    <div class="my-6 flex items-center gap-3 text-xs text-muted">
      <span class="h-px flex-1 bg-line" />
      <span class="inline-flex items-center gap-1"><Zap class="h-3.5 w-3.5 text-gold-500" /> Quick Login (demo)</span>
      <span class="h-px flex-1 bg-line" />
    </div>

    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="q in quick"
        :key="q.role"
        type="button"
        class="flex flex-col items-center gap-1.5 rounded-xl border border-line bg-surface p-3 text-xs font-medium text-ink transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card"
        @click="quickLogin(q)"
      >
        <span class="flex h-9 w-9 items-center justify-center rounded-lg" :class="q.tone"><component :is="q.icon" class="h-4.5 w-4.5" /></span>
        {{ q.role }}
      </button>
    </div>

    <p class="mt-7 text-center text-sm text-muted">
      Belum punya akun?
      <RouterLink to="/register" class="font-semibold text-primary-600 hover:underline">Daftar gratis</RouterLink>
    </p>
  </div>
</template>
