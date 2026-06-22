import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastKind = 'success' | 'error' | 'info' | 'warning'
export interface Toast {
  id: number
  kind: ToastKind
  message: string
}

let seq = 0

export const useUiStore = defineStore('ui', () => {
  const toasts = ref<Toast[]>([])
  const sidebarCollapsed = ref(false)

  function toast(message: string, kind: ToastKind = 'success', timeout = 4500) {
    const id = ++seq
    toasts.value.push({ id, kind, message })
    if (timeout > 0) setTimeout(() => dismiss(id), timeout)
    return id
  }
  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }
  const success = (m: string) => toast(m, 'success')
  const error = (m: string) => toast(m, 'error', 6000)
  const info = (m: string) => toast(m, 'info')
  const warning = (m: string) => toast(m, 'warning')

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  return { toasts, sidebarCollapsed, toast, dismiss, success, error, info, warning, toggleSidebar }
})
