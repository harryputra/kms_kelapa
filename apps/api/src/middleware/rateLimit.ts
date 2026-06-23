import rateLimit from 'express-rate-limit'

// API umum: 100 req/menit/IP
export const apiLimiter = rateLimit({
  windowMs: 60_000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Terlalu banyak permintaan. Coba lagi sebentar.' } },
})

// Auth ketat: 5 percobaan/menit/IP (anti brute force)
export const authLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.' } },
})
