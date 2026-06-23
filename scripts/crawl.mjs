// QA crawler — kunjungi semua rute per role, tangkap error runtime & cek konten render.
import puppeteer from 'puppeteer-core'

const BASE = process.env.BASE || 'http://localhost:5173'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

const PUBLIC = [
  '/', '/cetak-biru', '/cetak-biru/1', '/cetak-biru/1/praktik', '/pohon-nilai',
  '/produk/briket', '/produk/cocopeat', '/produk/arang-aktif', '/tanya', '/bursa',
  '/direktori', '/articles', '/articles/1', '/forum', '/forum/1', '/asisten',
  '/glosarium', '/tentang', '/login', '/register',
]
const USER = ['/dashboard', '/dashboard/cetak-biru', '/dashboard/cetak-biru/baru', '/dashboard/articles', '/dashboard/submit', '/dashboard/bookmarks', '/dashboard/notifications', '/dashboard/profile', '/forum/baru']
const MOD = ['/moderator', '/moderator/cetak-biru', '/moderator/review', '/moderator/review/1', '/moderator/templates', '/moderator/comments', '/moderator/reports']
const ADMIN = ['/admin', '/admin/users', '/admin/settings', '/admin/menu', '/admin/recycle-bin', '/admin/audit']

const ROLES = [
  { name: 'guest', uid: null, routes: PUBLIC },
  { name: 'user(3)', uid: 3, routes: [...PUBLIC, ...USER] },
  { name: 'moderator(2)', uid: 2, routes: [...USER, ...MOD] },
  { name: 'admin(1)', uid: 1, routes: [...USER, ...MOD, ...ADMIN] },
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function waitServer() {
  for (let i = 0; i < 30; i++) {
    try { const r = await fetch(BASE + '/'); if (r.ok) return } catch {}
    await sleep(1000)
  }
  throw new Error('server tidak siap')
}

const fails = []

const run = async () => {
  await waitServer()
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] })
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 900 })

  for (const role of ROLES) {
    // set sesi mock via localStorage di origin
    await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' }).catch(() => {})
    await page.evaluate((uid) => {
      if (uid) localStorage.setItem('coco_uid', String(uid))
      else localStorage.removeItem('coco_uid')
    }, role.uid)

    for (const path of role.routes) {
      const consoleErrors = []
      const pageErrors = []
      const onConsole = (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) }
      const onPageErr = (e) => pageErrors.push(e.message)
      page.on('console', onConsole)
      page.on('pageerror', onPageErr)
      let contentLen = 0, finalUrl = ''
      try {
        await page.goto(BASE + path, { waitUntil: 'networkidle0', timeout: 15000 })
        await sleep(1100)
        contentLen = await page.evaluate(() => {
          const m = document.querySelector('main') || document.body
          return (m?.innerText || '').trim().length
        })
        finalUrl = page.url().replace(BASE, '')
      } catch (e) {
        pageErrors.push('NAV: ' + e.message)
      }
      page.off('console', onConsole)
      page.off('pageerror', onPageErr)

      const blank = contentLen < 25
      const bad = pageErrors.length > 0 || blank
      const tag = bad ? 'FAIL' : 'ok  '
      const note = [
        blank ? `BLANK(len=${contentLen})` : `len=${contentLen}`,
        pageErrors.length ? `pageErr=${pageErrors.length}` : '',
        consoleErrors.length ? `consoleErr=${consoleErrors.length}` : '',
        finalUrl && finalUrl !== path ? `→${finalUrl}` : '',
      ].filter(Boolean).join(' ')
      console.log(`[${tag}] ${role.name.padEnd(13)} ${path.padEnd(28)} ${note}`)
      if (bad) {
        const msg = (pageErrors[0] || consoleErrors[0] || 'blank').slice(0, 240)
        fails.push({ role: role.name, path, contentLen, msg })
        console.log('        ↳ ' + msg)
      }
    }
  }

  await browser.close()
  console.log('\n===== RINGKASAN =====')
  console.log(`Total gagal: ${fails.length}`)
  const byMsg = {}
  for (const f of fails) { const k = f.msg.split('\n')[0]; (byMsg[k] ||= []).push(`${f.role} ${f.path}`) }
  for (const [k, v] of Object.entries(byMsg)) console.log(`\n• ${k}\n   ${v.join('\n   ')}`)
}

run().catch((e) => { console.error(e); process.exit(1) })
