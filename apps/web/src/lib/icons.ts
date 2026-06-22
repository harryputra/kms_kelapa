// Resolver ikon eksplisit — hanya impor ikon yang dipakai agar bundle ramping.
// (Hindari `import * as Icons` yang menarik ~1000 ikon ke bundle utama.)
import {
  MessageCircle, CheckCircle, Pencil, XCircle, Bell, Award,
  Sprout, PenTool, ThumbsUp, BookOpen,
} from 'lucide-vue-next'

const map: Record<string, unknown> = {
  'message-circle': MessageCircle,
  'check-circle': CheckCircle,
  pencil: Pencil,
  'x-circle': XCircle,
  bell: Bell,
  award: Award,
  sprout: Sprout,
  'pen-tool': PenTool,
  'thumbs-up': ThumbsUp,
  'book-open': BookOpen,
}

export function icon(name: string): unknown {
  return map[name] ?? Bell
}
