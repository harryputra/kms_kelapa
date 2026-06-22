<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Search, Ban, CircleCheck } from 'lucide-vue-next'
import { api } from '@/api'
import { useUiStore } from '@/stores/ui'
import type { AdminUserItem, Role } from '@/types'
import PageHeader from '@/components/common/PageHeader.vue'
import AppAvatar from '@/components/ui/AppAvatar.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import { formatDate } from '@/lib/format'

const ui = useUiStore()
const users = ref<AdminUserItem[]>([])
const loading = ref(true)
const search = ref('')
const roleFilter = ref<Role | ''>('')

const roles: Role[] = ['user', 'moderator', 'admin']
const roleChip: Record<Role, string> = {
  guest: 'bg-line text-muted',
  user: 'bg-primary-50 text-primary-700',
  moderator: 'bg-info/10 text-info',
  admin: 'bg-danger/10 text-danger',
}

const filtered = computed(() =>
  users.value.filter(
    (u) =>
      (!search.value || u.display_name.toLowerCase().includes(search.value.toLowerCase()) || u.email.includes(search.value.toLowerCase())) &&
      (!roleFilter.value || u.role === roleFilter.value),
  ),
)

onMounted(async () => {
  users.value = await api.adminUsers()
  loading.value = false
})

async function changeRole(u: AdminUserItem, e: Event) {
  const role = (e.target as HTMLSelectElement).value as Role
  await api.changeRole(u.id, role)
  u.role = role
  ui.success(`Peran ${u.display_name} diubah menjadi ${role}.`)
}
async function toggleSuspend(u: AdminUserItem) {
  await api.toggleSuspend(u.id)
  u.status = u.status === 'suspended' ? 'active' : 'suspended'
  ui.success(u.status === 'suspended' ? `${u.display_name} dinonaktifkan.` : `${u.display_name} diaktifkan.`)
}
</script>

<template>
  <div>
    <PageHeader title="Manajemen Pengguna" subtitle="Kelola akun, peran, dan status pengguna." />

    <div class="mb-5 flex flex-col gap-3 sm:flex-row">
      <div class="relative flex-1">
        <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input v-model="search" type="search" placeholder="Cari nama atau email…" class="field pl-10" />
      </div>
      <select v-model="roleFilter" class="field sm:w-44">
        <option value="">Semua Peran</option>
        <option v-for="r in roles" :key="r" :value="r" class="capitalize">{{ r }}</option>
      </select>
    </div>

    <LoadingBlock v-if="loading" />
    <div v-else class="premium-card overflow-x-auto">
      <table class="w-full min-w-[640px] text-sm">
        <thead class="border-b border-line bg-canvas/60 text-left text-xs uppercase tracking-wide text-muted">
          <tr>
            <th class="px-5 py-3 font-semibold">Pengguna</th>
            <th class="px-5 py-3 font-semibold">Peran</th>
            <th class="px-5 py-3 font-semibold">Status</th>
            <th class="px-5 py-3 font-semibold">Bergabung</th>
            <th class="px-5 py-3 text-right font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-line">
          <tr v-for="u in filtered" :key="u.id" class="transition-colors hover:bg-canvas/50">
            <td class="px-5 py-3">
              <div class="flex items-center gap-3">
                <AppAvatar :name="u.display_name" size="sm" />
                <div>
                  <p class="font-medium text-ink">{{ u.display_name }}</p>
                  <p class="text-xs text-muted">{{ u.email }}</p>
                </div>
              </div>
            </td>
            <td class="px-5 py-3">
              <select :value="u.role" class="rounded-lg border border-line bg-white px-2 py-1 text-xs font-medium capitalize" :class="roleChip[u.role]" @change="changeRole(u, $event)">
                <option v-for="r in roles" :key="r" :value="r" class="capitalize">{{ r }}</option>
              </select>
            </td>
            <td class="px-5 py-3">
              <span class="chip" :class="u.status === 'active' ? 'bg-success/10 text-success' : u.status === 'suspended' ? 'bg-danger/10 text-danger' : 'bg-line text-muted'">
                {{ { active: 'Aktif', suspended: 'Nonaktif', deleted: 'Dihapus' }[u.status] }}
              </span>
            </td>
            <td class="px-5 py-3 text-muted">{{ formatDate(u.created_at) }}</td>
            <td class="px-5 py-3 text-right">
              <button
                class="btn-ghost btn-sm"
                :class="u.status === 'suspended' ? 'text-success' : 'text-danger'"
                @click="toggleSuspend(u)"
              >
                <component :is="u.status === 'suspended' ? CircleCheck : Ban" class="h-4 w-4" />
                {{ u.status === 'suspended' ? 'Aktifkan' : 'Nonaktifkan' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
