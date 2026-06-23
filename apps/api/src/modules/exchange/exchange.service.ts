import type { Prisma } from '@prisma/client'
import { prisma } from '../../prisma.js'
import { ApiError } from '../../lib/http.js'
import { toAuthor, userInclude } from '../../lib/dto.js'

// x/y persen hasil proyeksi equirectangular (selaras peta siluet di frontend:
// x=(lng-94.5)/47*100, y=(6.5-lat)/18*100).
export const regionGeo: Record<string, { x: number; y: number }> = {
  'Sumatera Utara': { x: 9.6, y: 23.3 }, Riau: { x: 15.3, y: 33.3 }, 'Jawa Barat': { x: 27.9, y: 74.4 },
  'Jawa Timur': { x: 38.3, y: 79.4 }, Bali: { x: 43.8, y: 82.8 }, 'Kalimantan Timur': { x: 46.8, y: 33.3 }, 'Sulawesi Selatan': { x: 54.0, y: 57.2 },
}

const mapListing = (l: Prisma.WasteListingGetPayload<{ include: { user: typeof userInclude } }>) => ({
  id: l.id, kind: l.kind, material: l.material, category: l.category, quantity: l.quantity, price: l.price,
  region: l.region, umkmName: l.umkmName, contact: l.contact, note: l.note, createdAt: l.createdAt.toISOString(), user: toAuthor(l.user),
})

export async function listListings(f: { kind?: string; category?: string; region?: string; search?: string }) {
  const where: Prisma.WasteListingWhereInput = {}
  if (f.kind) where.kind = f.kind
  if (f.category) where.category = f.category
  if (f.region) where.region = f.region
  if (f.search) where.OR = [{ material: { contains: f.search } }, { umkmName: { contains: f.search } }, { note: { contains: f.search } }]
  const rows = await prisma.wasteListing.findMany({ where, include: { user: userInclude }, orderBy: { createdAt: 'desc' } })
  return rows.map(mapListing)
}

export async function createListing(userId: number, input: { kind: string; material: string; category: string; quantity: string; price?: string; region: string; note?: string }) {
  const u = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } })
  if (!u) throw ApiError.unauthorized()
  const l = await prisma.wasteListing.create({
    data: { userId, kind: input.kind, material: input.material, category: input.category, quantity: input.quantity, price: input.price || null, region: input.region, note: input.note ?? '', umkmName: u.profile?.displayName ?? u.email, contact: u.email },
    include: { user: userInclude },
  })
  return mapListing(l)
}

export async function listDirectory(f: { region?: string; search?: string }) {
  const where: Prisma.UmkmDirectoryWhereInput = {}
  if (f.region) where.region = f.region
  if (f.search) where.OR = [{ businessName: { contains: f.search } }]
  const rows = await prisma.umkmDirectory.findMany({ where, include: { user: userInclude }, orderBy: { id: 'asc' } })
  return rows.map((d) => ({ id: d.id, user: toAuthor(d.user), businessName: d.businessName, region: d.region, materials: d.materials as string[], products: d.products as string[], capacity: d.capacity, contact: d.contact, bio: d.bio, blueprintsCount: d.blueprintsCount, verified: d.verified }))
}

export async function regionStats() {
  const [listings, directory] = await Promise.all([
    prisma.wasteListing.groupBy({ by: ['region'], _count: true }),
    prisma.umkmDirectory.groupBy({ by: ['region'], _count: true }),
  ])
  const lMap = Object.fromEntries(listings.map((r) => [r.region, r._count]))
  const dMap = Object.fromEntries(directory.map((r) => [r.region, r._count]))
  return Object.entries(regionGeo).map(([region, geo]) => ({ region, listings: lMap[region] ?? 0, umkm: dMap[region] ?? 0, x: geo.x, y: geo.y }))
}
