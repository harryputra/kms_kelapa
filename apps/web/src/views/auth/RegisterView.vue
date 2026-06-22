<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { Check } from 'lucide-vue-next'
import { ApiError } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()

const form = reactive({ display_name: '', email: '', password: '' })
const errors = reactive<Record<string, string>>({})
const submitting = ref(false)

// Aturan kekuatan sandi (selaras baseline keamanan: ≥8, huruf besar/kecil/angka)
const rules = computed(() => ({
  length: form.password.length >= 8 && form.password.length <= 72,
  upper: /[A-Z]/.test(form.password),
  lower: /[a-z]/.test(form.password),
  number: /[0-9]/.test(form.password),
}))
const passwordValid = computed(() => Object.values(rules.value).every(Boolean))

function validate(): boolean {
  errors.display_name = form.display_name.trim().length < 3 ? 'Nama minimal 3 karakter.' : ''
  errors.email = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) ? '' : 'Format email tidak valid.'
  errors.password = passwordValid.value ? '' : 'Sandi belum memenuhi syarat.'
  return !errors.display_name && !errors.email && !errors.password
}

async function submit() {
  if (!validate()) return
  submitting.value = true
  try {
    const res = await auth.register(form.email.trim(), form.password, form.display_name.trim())
    ui.success(res.message)
    router.push('/login')
  } catch (e) {
    errors.email = e instanceof ApiError ? e.message : 'Gagal mendaftar.'
  } finally {
    submitting.value = false
  }
}

const checks = [
  { key: 'length', label: '8–72 karakter' },
  { key: 'upper', label: 'Huruf besar' },
  { key: 'lower', label: 'Huruf kecil' },
  { key: 'number', label: 'Angka' },
] as const
</script>

<template>
  <div class="animate-fade-in">
    <h1 class="font-display text-2xl font-bold text-ink">Buat akun gratis</h1>
    <p class="mt-1.5 text-sm text-muted">Bergabung & mulai berbagi pengetahuan olah limbah kelapa.</p>

    <form class="mt-7 space-y-4" @submit.prevent="submit">
      <AppInput id="name" v-model="form.display_name" label="Nama Tampilan" placeholder="mis. Budi Santoso" :error="errors.display_name" required />
      <AppInput id="email" v-model="form.email" label="Email" type="email" placeholder="nama@email.com" autocomplete="email" :error="errors.email" required />
      <AppInput id="password" v-model="form.password" label="Kata Sandi" type="password" placeholder="Buat sandi yang kuat" autocomplete="new-password" :error="errors.password" required />

      <div class="grid grid-cols-2 gap-2">
        <div v-for="c in checks" :key="c.key" class="flex items-center gap-1.5 text-xs" :class="rules[c.key] ? 'text-success' : 'text-muted'">
          <span class="flex h-4 w-4 items-center justify-center rounded-full" :class="rules[c.key] ? 'bg-success text-white' : 'bg-line'">
            <Check v-if="rules[c.key]" class="h-2.5 w-2.5" />
          </span>
          {{ c.label }}
        </div>
      </div>

      <p class="text-xs leading-relaxed text-muted">
        Dengan mendaftar, Anda menyetujui Kebijakan Privasi & Ketentuan Layanan COCONEXUS.
      </p>
      <AppButton type="submit" :loading="submitting" block size="lg">Daftar Sekarang</AppButton>
    </form>

    <p class="mt-7 text-center text-sm text-muted">
      Sudah punya akun?
      <RouterLink to="/login" class="font-semibold text-primary-600 hover:underline">Masuk di sini</RouterLink>
    </p>
  </div>
</template>
