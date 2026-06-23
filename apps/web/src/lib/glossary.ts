// Glosarium istilah teknis — mendukung "bahasa sederhana" untuk UMKM.
// Kunci ditulis huruf kecil; pencocokan tidak peka huruf besar/kecil.
export const GLOSSARY: Record<string, string> = {
  karbonisasi: 'Proses memanaskan bahan (mis. tempurung) tanpa cukup oksigen hingga menjadi arang.',
  decorticator: 'Mesin pengurai sabut kelapa untuk memisahkan serat (cocofiber) dan gabus (cocopeat).',
  cocopeat: 'Serbuk/gabus halus dari sabut kelapa, dipakai sebagai media tanam.',
  cocofiber: 'Serat panjang dari sabut kelapa untuk matras, jok, hingga geotekstil.',
  'arang aktif': 'Arang yang diaktivasi sehingga sangat berpori dan berdaya serap tinggi (filtrasi).',
  briket: 'Bahan bakar padat dari serbuk arang yang dipadatkan dengan perekat.',
  'nata de coco': 'Pangan kenyal hasil fermentasi air kelapa oleh bakteri Acetobacter xylinum.',
  fermentasi: 'Proses penguraian zat oleh mikroorganisme (mis. mengubah air kelapa jadi nata/cuka).',
  ec: 'Electrical Conductivity — ukuran kadar garam terlarut; penting untuk mutu cocopeat.',
  mesh: 'Satuan kehalusan ayakan; makin besar angka mesh, makin halus partikelnya.',
  bep: 'Break Even Point — titik impas, saat total pendapatan menutup seluruh modal & biaya.',
  'ekonomi sirkular': 'Model ekonomi yang memanfaatkan kembali limbah menjadi produk bernilai.',
  geotekstil: 'Material berbasis serat untuk penguatan/penahan tanah pada konstruksi.',
  retort: 'Tungku/wadah tertutup untuk karbonisasi & aktivasi pada suhu tinggi.',
  iodin: 'Bilangan iodin — indikator daya serap arang aktif (makin tinggi makin baik).',
  tapioka: 'Pati singkong yang umum dipakai sebagai perekat alami pada briket.',
}

const KEYS = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length)
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const PATTERN = new RegExp(`\\b(${KEYS.map(escape).join('|')})\\b`, 'gi')

export interface GlossarySegment {
  text: string
  def?: string
}

/** Pecah teks menjadi segmen; segmen yang cocok glosarium membawa definisinya. */
export function glossarize(text: string): GlossarySegment[] {
  if (!text) return [{ text: '' }]
  const parts = text.split(PATTERN)
  return parts.map((p, i) => {
    if (i % 2 === 1) {
      const def = GLOSSARY[p.toLowerCase()]
      return def ? { text: p, def } : { text: p }
    }
    return { text: p }
  })
}
