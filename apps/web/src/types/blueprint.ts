// Tipe "Cetak Biru Teknis" — objek pengetahuan UTAMA COCONEXUS (pembeda inti).
// Terstruktur agar bisa dicari faceted, dihitung ekonominya, & divalidasi lapangan.
import type { UserProfile } from './index'

export type Maturity = 'raw' | 'curated' | 'validated' | 'standard'
export type BlueprintStatus = 'draft' | 'submitted' | 'published' | 'rejected'
export type Difficulty = 'mudah' | 'sedang' | 'sulit'
export type CapitalTier = 'rendah' | 'menengah' | 'tinggi'
export type WasteKind = 'sabut' | 'tempurung' | 'air' | 'ampas'
export type MaterialTier = 'wajib' | 'murah' | 'mahal'

export interface ValueNode {
  id: number
  parentId: number | null
  type: 'root' | 'waste' | 'product'
  name: string
  slug: string
  icon: string
  blueprintCount: number
}

export interface BlueprintMaterial {
  name: string
  qty: string
  tier: MaterialTier
  price: number // estimasi Rp (0 jika tak relevan)
  note?: string
}

export interface BlueprintStep {
  order: number
  title: string
  detail: string
  duration?: string
  temperature?: string
  dose?: string
}

export interface QualityParam {
  name: string
  target: string
  method: string
}

export interface SafetyNote {
  risk: string
  mitigation: string
}

export interface EconomicModel {
  capital: number // modal alat sekali (Rp)
  costPerBatch: number // biaya bahan habis pakai per batch (Rp)
  batchInputKg: number // limbah per batch (kg)
  batchOutputKg: number // produk per batch (kg)
  sellPricePerKg: number // harga jual produk (Rp/kg)
}

export interface ReplicationBreakdown {
  success: number
  partial: number
  fail: number
}

export interface BlueprintStats {
  views: number
  saves: number
  replications: number
  successRate: number // 0..100
}

export interface BlueprintVariant {
  id: number
  region: string
  title: string
}

export interface BlueprintVersion {
  version: number
  changelog: string
  author: UserProfile
  createdAt: string
}

export interface ReplicationReport {
  id: number
  user: UserProfile
  outcome: 'success' | 'partial' | 'fail'
  note: string
  costReal: number | null
  photoSeed: string | null
  createdAt: string
}

export interface ReplicationInput {
  outcome: 'success' | 'partial' | 'fail'
  note: string
  costReal: number | null
  photoSeed: string | null
}

// ---- Tanya Pakar (Q&A) ----
export interface QnaAnswer {
  id: number
  user: UserProfile
  content: string
  votes: number
  isBest: boolean
  isExpert: boolean
  myVote: boolean
  createdAt: string
}

export interface QnaQuestion {
  id: number
  blueprintId: number | null
  blueprintTitle: string | null
  user: UserProfile
  title: string
  content: string
  solved: boolean
  createdAt: string
  answers: QnaAnswer[]
}

export interface BlueprintSummary {
  id: number
  title: string
  slug: string
  author: UserProfile
  wasteKind: WasteKind
  wasteLabel: string
  product: string
  excerpt: string
  status: BlueprintStatus
  maturity: Maturity
  difficulty: Difficulty
  capitalTier: CapitalTier
  minCapital: number
  estTime: string
  tags: string[]
  stats: BlueprintStats
}

export interface BlueprintCreateInput {
  title: string
  excerpt: string
  summary: string
  wasteKind: WasteKind
  wasteLabel: string
  product: string
  difficulty: Difficulty
  capitalTier: CapitalTier
  estTime: string
  tags: string[]
  materials: BlueprintMaterial[]
  steps: BlueprintStep[]
  quality: QualityParam[]
  safety: SafetyNote[]
  economic: EconomicModel
  sources: string[]
}

export interface BlueprintFull extends BlueprintSummary {
  summary: string
  materials: BlueprintMaterial[]
  steps: BlueprintStep[]
  quality: QualityParam[]
  safety: SafetyNote[]
  economic: EconomicModel
  sources: string[]
  isBookmarked: boolean
  replications: ReplicationBreakdown
  variants: BlueprintVariant[]
  versions: BlueprintVersion[]
}

export interface BlueprintFacets {
  search?: string
  wasteKind?: WasteKind | ''
  product?: string
  difficulty?: Difficulty | ''
  capitalTier?: CapitalTier | ''
  maturity?: Maturity | ''
  sort?: 'popular' | 'newest' | 'maturity' | 'capital'
}
