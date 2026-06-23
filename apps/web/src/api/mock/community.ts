// Mock data Pilar 2 — Validasi & Penyempurnaan Kolektif: laporan replikasi & Tanya Pakar.
import type { QnaQuestion, ReplicationReport } from '@/types'
import { pub } from './data'

const hAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString()
const dAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString()

// Laporan replikasi per cetak biru (bukti lapangan)
export const reportsByBlueprint: Record<number, ReplicationReport[]> = {
  1: [
    { id: 1, user: pub(3), outcome: 'success', note: 'Berhasil! Briket nyala stabil & tidak banyak asap. Saya pakai drum bekas.', costReal: 230000, photoSeed: 'briket-budi', createdAt: dAgo(6) },
    { id: 2, user: pub(4), outcome: 'partial', note: 'Briket agak rapuh, sepertinya perekat tapioka kurang. Akan coba 6%.', costReal: 210000, photoSeed: 'briket-siti', createdAt: dAgo(3) },
    { id: 3, user: pub(5), outcome: 'success', note: 'Cocok untuk skala rumahan, modal terjangkau.', costReal: null, photoSeed: null, createdAt: hAgo(20) },
  ],
  5: [
    { id: 4, user: pub(4), outcome: 'success', note: 'Nata tebal 1,5 cm setelah 7 hari. Kuncinya ruang bersih & tenang.', costReal: 480000, photoSeed: 'nata-siti', createdAt: dAgo(4) },
  ],
  7: [
    { id: 5, user: pub(4), outcome: 'success', note: 'Tepung halus lolos 80 mesh, aroma kelapa kuat.', costReal: 750000, photoSeed: 'tepung-siti', createdAt: dAgo(8) },
  ],
}

// Tanya Pakar (Q&A)
export const questions: QnaQuestion[] = [
  {
    id: 1, blueprintId: 1, blueprintTitle: 'Briket Arang dari Tempurung Kelapa', user: pub(3),
    title: 'Bisakah karbonisasi pakai tungku tanah liat?',
    content: 'Saya belum punya drum, apakah tungku tanah liat tradisional bisa dipakai untuk karbonisasi tempurung?',
    solved: true, createdAt: dAgo(5),
    answers: [
      { id: 1, user: pub(2), content: 'Bisa, namun kontrol suhunya lebih sulit sehingga rendemen arang bisa turun. Pastikan lubang udara diatur agar pembakaran tidak menjadi abu. Untuk konsistensi mutu, drum tertutup tetap lebih disarankan.', votes: 9, isBest: true, isExpert: true, myVote: false, createdAt: dAgo(4) },
      { id: 2, user: pub(4), content: 'Saya pernah coba tungku, hasilnya lumayan tapi memang lebih boros bahan.', votes: 3, isBest: false, isExpert: false, myVote: false, createdAt: dAgo(4) },
    ],
  },
  {
    id: 2, blueprintId: 5, blueprintTitle: 'Nata de Coco dari Air Kelapa', user: pub(4),
    title: 'Kenapa nata saya tipis dan berair?',
    content: 'Sudah fermentasi 7 hari tapi nata hanya tipis ~0,3 cm. Ada saran?',
    solved: false, createdAt: dAgo(2),
    answers: [
      { id: 3, user: pub(2), content: 'Umumnya karena pH belum tepat (idealnya 4–4,5) atau starter kurang aktif. Pastikan juga nampan tidak sering digoyang selama fermentasi.', votes: 6, isBest: false, isExpert: true, myVote: false, createdAt: dAgo(1) },
    ],
  },
  {
    id: 3, blueprintId: null, blueprintTitle: null, user: pub(5),
    title: 'Sabut basah perlu dijemur berapa lama sebelum diolah?',
    content: 'Di daerah saya sering hujan, sabut selalu lembap. Idealnya kadar air berapa sebelum diurai?',
    solved: false, createdAt: hAgo(10),
    answers: [
      { id: 4, user: pub(2), content: 'Targetkan kadar air di bawah 15%. Dengan penjemuran matahari penuh biasanya 1–2 hari; jika mendung, gunakan pengering/oven sederhana.', votes: 4, isBest: false, isExpert: true, myVote: false, createdAt: hAgo(6) },
    ],
  },
]
