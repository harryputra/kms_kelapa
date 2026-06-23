// Mock data Pilar 3 — Bursa Limbah, Direktori UMKM, Peta Sebaran.
import type { UmkmDirectoryEntry, WasteListing } from '@/types'
import { pub } from './data'

const dAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString()
const hAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString()

// Posisi normalisasi (0..100) untuk peta abstrak — menyebar Barat→Timur Indonesia.
export const regionGeo: Record<string, { x: number; y: number }> = {
  'Sumatera Utara': { x: 16, y: 26 },
  Riau: { x: 23, y: 40 },
  'Jawa Barat': { x: 38, y: 68 },
  'Jawa Timur': { x: 50, y: 72 },
  Bali: { x: 57, y: 76 },
  'Kalimantan Timur': { x: 56, y: 38 },
  'Sulawesi Selatan': { x: 67, y: 58 },
}

export const listings: WasteListing[] = [
  { id: 1, kind: 'surplus', material: 'Sabut kelapa', category: 'sabut', quantity: '500 kg/minggu', price: 'Rp300/kg', region: 'Jawa Barat', umkmName: 'Kelapa Jaya', contact: '0812-1100-2233', note: 'Sabut kering siap urai, stok rutin tiap minggu.', createdAt: hAgo(6), user: pub(3) },
  { id: 2, kind: 'need', material: 'Tempurung kelapa', category: 'tempurung', quantity: '200 kg/minggu', price: 'Nego', region: 'Jawa Timur', umkmName: 'Briket Makmur', contact: '0813-4455-6677', note: 'Butuh tempurung kering kontinu untuk produksi briket.', createdAt: hAgo(20), user: pub(4) },
  { id: 3, kind: 'surplus', material: 'Air kelapa', category: 'air', quantity: '1.000 L/minggu', price: 'Gratis (ambil sendiri)', region: 'Sulawesi Selatan', umkmName: 'Santan Sulawesi', contact: '0852-7788-9900', note: 'Limbah air kelapa dari produksi santan, cocok untuk nata/cuka.', createdAt: dAgo(1), user: pub(5) },
  { id: 4, kind: 'need', material: 'Sabut kelapa', category: 'sabut', quantity: '300 kg', price: 'Rp350/kg', region: 'Bali', umkmName: 'EcoPot Bali', contact: '0878-2211-3344', note: 'Untuk produksi pot sabut, butuh serat panjang grade A.', createdAt: dAgo(2), user: pub(3) },
  { id: 5, kind: 'surplus', material: 'Tempurung kelapa', category: 'tempurung', quantity: '800 kg/minggu', price: 'Rp500/kg', region: 'Sumatera Utara', umkmName: 'Arang Medan', contact: '0811-9090-1212', note: 'Tempurung pilihan, cocok untuk arang aktif & briket ekspor.', createdAt: dAgo(3), user: pub(4) },
  { id: 6, kind: 'surplus', material: 'Cocopeat (curah)', category: 'produk', quantity: '2 ton/bulan', price: 'Rp2.500/kg', region: 'Jawa Barat', umkmName: 'Cocopeat Nusantara', contact: '0856-3030-4040', note: 'Cocopeat EC rendah, siap kirim, ada uji lab.', createdAt: dAgo(4), user: pub(2) },
  { id: 7, kind: 'need', material: 'Ampas kelapa', category: 'ampas', quantity: '100 kg/minggu', price: 'Nego', region: 'Riau', umkmName: 'Tepung Riau', contact: '0813-5050-6060', note: 'Ampas segar untuk tepung pangan, butuh harian.', createdAt: dAgo(5), user: pub(3) },
  { id: 8, kind: 'surplus', material: 'Cocofiber (bal)', category: 'produk', quantity: '1 ton/bulan', price: 'Rp3.000/kg', region: 'Sulawesi Selatan', umkmName: 'Serat Celebes', contact: '0852-1313-1414', note: 'Serat grade A & B, sudah dipress bal.', createdAt: dAgo(7), user: pub(5) },
]

export const directory: UmkmDirectoryEntry[] = [
  { id: 1, user: pub(3), businessName: 'Kelapa Jaya', region: 'Jawa Barat', materials: ['Sabut'], products: ['Cocopeat', 'Pot Sabut'], capacity: '±200 kg/minggu', contact: '0812-1100-2233', bio: 'UMKM pengolahan sabut kelapa di Sukabumi, fokus media tanam.', blueprintsCount: 3, verified: true },
  { id: 2, user: pub(4), businessName: 'Briket Makmur', region: 'Jawa Timur', materials: ['Tempurung'], products: ['Briket', 'Arang Aktif'], capacity: '±500 kg/minggu', contact: '0813-4455-6677', bio: 'Produsen briket & arang aktif untuk pasar lokal dan ekspor.', blueprintsCount: 3, verified: true },
  { id: 3, user: pub(5), businessName: 'Santan Sulawesi', region: 'Sulawesi Selatan', materials: ['Air Kelapa', 'Ampas'], products: ['Nata de Coco', 'Tepung'], capacity: '±1.000 L/minggu', contact: '0852-7788-9900', bio: 'Industri santan dengan diversifikasi limbah air & ampas.', blueprintsCount: 0, verified: false },
  { id: 4, user: pub(2), businessName: 'Cocopeat Nusantara', region: 'Jawa Barat', materials: ['Sabut'], products: ['Cocopeat', 'Cocofiber'], capacity: '±2 ton/bulan', contact: '0856-3030-4040', bio: 'Pemasok cocopeat & cocofiber dengan standar mutu ekspor.', blueprintsCount: 4, verified: true },
  { id: 5, user: pub(4), businessName: 'Arang Medan', region: 'Sumatera Utara', materials: ['Tempurung'], products: ['Arang Aktif'], capacity: '±800 kg/minggu', contact: '0811-9090-1212', bio: 'Spesialis arang aktif tempurung untuk filtrasi.', blueprintsCount: 1, verified: false },
  { id: 6, user: pub(3), businessName: 'EcoPot Bali', region: 'Bali', materials: ['Sabut'], products: ['Pot Sabut'], capacity: '±150 kg/minggu', contact: '0878-2211-3344', bio: 'Kerajinan pot biodegradable dari sabut untuk pembibitan.', blueprintsCount: 1, verified: true },
]
