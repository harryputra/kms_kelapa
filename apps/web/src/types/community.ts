// Tipe Pilar 3 — Simbiosis Industri: Bursa Limbah, Direktori UMKM, Peta Sebaran.
import type { UserProfile } from './index'
import type { BlueprintSummary, WasteKind } from './blueprint'

export interface AssistantReply {
  answer: string
  sources: BlueprintSummary[]
  suggestions: string[]
}

export type ListingKind = 'surplus' | 'need'
export type ListingCategory = WasteKind | 'produk'

export interface WasteListing {
  id: number
  kind: ListingKind
  material: string
  category: ListingCategory
  quantity: string
  price: string | null
  region: string
  umkmName: string
  contact: string
  note: string
  createdAt: string
  user: UserProfile
}

export interface WasteListingInput {
  kind: ListingKind
  material: string
  category: ListingCategory
  quantity: string
  price: string
  region: string
  note: string
}

export interface UmkmDirectoryEntry {
  id: number
  user: UserProfile
  businessName: string
  region: string
  materials: string[]
  products: string[]
  capacity: string
  contact: string
  bio: string
  blueprintsCount: number
  verified: boolean
}

export interface RegionStat {
  region: string
  listings: number
  umkm: number
  x: number // posisi normalisasi 0..100 untuk peta abstrak
  y: number
}
