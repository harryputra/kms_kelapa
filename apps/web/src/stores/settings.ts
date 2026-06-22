import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api'
import type { Category, SystemSettings } from '@/types'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<SystemSettings | null>(null)
  const categories = ref<Category[]>([])

  async function load() {
    if (!settings.value) settings.value = await api.getSettings()
    if (!categories.value.length) categories.value = await api.categories()
  }

  async function refreshCategories() {
    categories.value = await api.categories()
  }

  async function update(patch: Partial<SystemSettings>) {
    settings.value = await api.updateSettings(patch)
    return settings.value
  }

  return { settings, categories, load, refreshCategories, update }
})
