<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Award, Camera, Lock } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { icon } from '@/lib/icons'
import PageHeader from '@/components/common/PageHeader.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppAvatar from '@/components/ui/AppAvatar.vue'

const auth = useAuthStore()
const ui = useUiStore()
const saving = ref(false)

const form = reactive({
  display_name: auth.user?.display_name ?? '',
  bio: auth.user?.bio ?? '',
  job_title: auth.user?.job_title ?? '',
  department: auth.user?.department ?? '',
  division: auth.user?.division ?? '',
})

function badgeIcon(name: string) {
  return icon(name)
}

async function save() {
  saving.value = true
  await new Promise((r) => setTimeout(r, 500))
  if (auth.user) Object.assign(auth.user, form)
  saving.value = false
  ui.success('Profil berhasil diperbarui.')
}
</script>

<template>
  <div>
    <PageHeader title="Profil Saya" subtitle="Kelola identitas & lihat pencapaian Anda." />

    <div class="grid gap-6 lg:grid-cols-[320px_1fr]">
      <!-- Kartu profil + badge -->
      <div class="space-y-6">
        <div class="premium-card p-6 text-center">
          <div class="relative mx-auto w-fit">
            <AppAvatar :name="auth.user?.display_name ?? ''" :src="auth.user?.avatar_url" size="xl" />
            <button class="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white shadow-card transition-transform hover:scale-105" title="Ubah avatar">
              <Camera class="h-4 w-4" />
            </button>
          </div>
          <h2 class="mt-4 font-display text-lg font-bold text-ink">{{ auth.user?.display_name }}</h2>
          <p class="text-sm capitalize text-muted">{{ auth.user?.job_title || auth.user?.role }}</p>
          <div class="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4 text-center">
            <div><p class="font-display text-lg font-bold text-ink">{{ auth.user?.stats.articles_published }}</p><p class="text-[11px] text-muted">Artikel</p></div>
            <div><p class="font-display text-lg font-bold text-ink">{{ auth.user?.stats.followers ?? 0 }}</p><p class="text-[11px] text-muted">Pengikut</p></div>
            <div><p class="font-display text-lg font-bold text-ink">{{ auth.user?.badges.filter((b) => b.awarded_at).length }}</p><p class="text-[11px] text-muted">Lencana</p></div>
          </div>
        </div>

        <div class="premium-card p-5">
          <h3 class="mb-4 flex items-center gap-2 font-display font-semibold text-ink"><Award class="h-4.5 w-4.5 text-gold-500" /> Lencana</h3>
          <ul class="space-y-3">
            <li v-for="b in auth.user?.badges" :key="b.id" class="flex items-center gap-3" :class="!b.awarded_at && 'opacity-60'">
              <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" :class="b.awarded_at ? 'bg-gold-100 text-gold-600' : 'bg-line text-muted'">
                <component :is="b.awarded_at ? badgeIcon(b.icon) : Lock" class="h-5 w-5" />
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-ink">{{ b.name }}</p>
                <p class="truncate text-xs text-muted">{{ b.description }}</p>
                <div v-if="!b.awarded_at" class="mt-1 h-1.5 overflow-hidden rounded-full bg-line">
                  <div class="h-full rounded-full bg-gold-400" :style="{ width: `${b.progress}%` }" />
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Form edit -->
      <div class="premium-card p-6">
        <h3 class="text-h3">Edit Informasi</h3>
        <form class="mt-5 space-y-4" @submit.prevent="save">
          <AppInput id="dn" v-model="form.display_name" label="Nama Tampilan" required />
          <AppTextarea id="bio" v-model="form.bio" label="Bio" :rows="3" placeholder="Ceritakan tentang usaha & keahlian Anda…" />
          <div class="grid gap-4 sm:grid-cols-2">
            <AppInput id="jt" v-model="form.job_title" label="Jabatan / Peran" placeholder="mis. Pemilik UMKM" />
            <AppInput id="dep" v-model="form.department" label="Bidang" placeholder="mis. Sabut Kelapa" />
          </div>
          <AppInput id="div" v-model="form.division" label="Divisi (opsional)" />
          <div class="flex justify-end pt-2">
            <AppButton type="submit" :loading="saving">Simpan Perubahan</AppButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
