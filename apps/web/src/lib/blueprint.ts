import type { BlueprintStatus, CapitalTier, Difficulty, EconomicModel, Maturity, WasteKind } from '@/types'

export const BLUEPRINT_STATUS: Record<BlueprintStatus, { label: string; chip: string }> = {
  draft: { label: 'Draft', chip: 'bg-line text-muted' },
  submitted: { label: 'Menunggu Kurasi', chip: 'bg-info/10 text-info' },
  published: { label: 'Terbit', chip: 'bg-success/10 text-success' },
  rejected: { label: 'Ditolak', chip: 'bg-danger/10 text-danger' },
}

export function formatRupiah(n: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n)
}

interface MaturityMeta {
  level: number
  label: string
  short: string
  icon: string // nama lucide kebab
  chip: string
  bar: string
  text: string
}

export const MATURITY: Record<Maturity, MaturityMeta> = {
  raw: { level: 1, label: 'Mentah', short: 'Pengalaman belum dikurasi', icon: 'sprout', chip: 'bg-line text-muted', bar: 'bg-muted', text: 'text-muted' },
  curated: { level: 2, label: 'Terkurasi', short: 'Diverifikasi moderator', icon: 'search-check', chip: 'bg-info/10 text-info', bar: 'bg-info', text: 'text-info' },
  validated: { level: 3, label: 'Tervalidasi Lapangan', short: 'Direplikasi banyak UMKM', icon: 'badge-check', chip: 'bg-success/10 text-success', bar: 'bg-success', text: 'text-success' },
  standard: { level: 4, label: 'Standar Rujukan', short: 'Acuan baku komunitas', icon: 'award', chip: 'bg-gold-100 text-gold-700', bar: 'bg-gold-500', text: 'text-gold-700' },
}
export const MATURITY_ORDER: Maturity[] = ['raw', 'curated', 'validated', 'standard']

export const DIFFICULTY: Record<Difficulty, { label: string; chip: string }> = {
  mudah: { label: 'Mudah', chip: 'bg-success/10 text-success' },
  sedang: { label: 'Sedang', chip: 'bg-warning/15 text-gold-700' },
  sulit: { label: 'Sulit', chip: 'bg-danger/10 text-danger' },
}

export const CAPITAL: Record<CapitalTier, { label: string; chip: string }> = {
  rendah: { label: 'Modal Rendah', chip: 'bg-primary-50 text-primary-700' },
  menengah: { label: 'Modal Menengah', chip: 'bg-info/10 text-info' },
  tinggi: { label: 'Modal Tinggi', chip: 'bg-gold-100 text-gold-700' },
}

export const WASTE: Record<WasteKind, { label: string; icon: string }> = {
  sabut: { label: 'Sabut', icon: 'layers' },
  tempurung: { label: 'Tempurung', icon: 'shell' },
  air: { label: 'Air Kelapa', icon: 'droplets' },
  ampas: { label: 'Ampas', icon: 'wheat' },
}

export interface EconomicsResult {
  inputKg: number
  batches: number
  outputKg: number
  revenue: number
  materialCost: number
  grossProfit: number
  profitPerBatch: number
  capital: number
  bepBatches: number
  netFirstPeriod: number
}

/** Hitung ekonomi terskala dari sebuah Cetak Biru untuk jumlah limbah tertentu (per periode). */
export function computeEconomics(eco: EconomicModel, inputKg: number): EconomicsResult {
  const batches = eco.batchInputKg > 0 ? Math.floor(inputKg / eco.batchInputKg) : 0
  const outputKg = batches * eco.batchOutputKg
  const revenue = outputKg * eco.sellPricePerKg
  const materialCost = batches * eco.costPerBatch
  const grossProfit = revenue - materialCost
  const profitPerBatch = eco.batchOutputKg * eco.sellPricePerKg - eco.costPerBatch
  const bepBatches = profitPerBatch > 0 ? Math.ceil(eco.capital / profitPerBatch) : 0
  const netFirstPeriod = grossProfit - eco.capital
  return { inputKg, batches, outputKg, revenue, materialCost, grossProfit, profitPerBatch, capital: eco.capital, bepBatches, netFirstPeriod }
}
