import { app } from './app.js'
import { env } from './env.js'
import { prisma } from './prisma.js'

const server = app.listen(env.PORT, () => {
  console.log(`✅ COCONEXUS API berjalan di http://localhost:${env.PORT}/api/v1`)
})

async function shutdown(signal: string) {
  console.log(`\n${signal} diterima — menutup koneksi…`)
  await prisma.$disconnect()
  server.close(() => process.exit(0))
}
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
