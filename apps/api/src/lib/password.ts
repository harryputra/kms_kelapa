import bcrypt from 'bcryptjs'

// bcrypt memotong di 72 byte — batasi input untuk konsistensi & cegah error.
function cap(password: string): string {
  return Buffer.byteLength(password, 'utf8') > 72 ? Buffer.from(password, 'utf8').subarray(0, 72).toString('utf8') : password
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(cap(password), 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(cap(password), hash)
}
