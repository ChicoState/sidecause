import { argon2, randomBytes, timingSafeEqual } from 'node:crypto'

const memory = 19 * 1024
const passes = 2
const parallelism = 1
const tagLength = 32

function derivePasswordKey(password: string, nonce: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    argon2(
      'argon2id',
      { message: password, nonce, parallelism, tagLength, memory, passes },
      (error, derivedKey) => (error ? reject(error) : resolve(derivedKey)),
    )
  })
}

export async function hashPassword(password: string): Promise<string> {
  const nonce = randomBytes(16)
  const derivedKey = await derivePasswordKey(password, nonce)

  return `argon2id$${memory}$${passes}$${parallelism}$${nonce.toString('base64url')}$${derivedKey.toString('base64url')}`
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [
    algorithm,
    storedMemory,
    storedPasses,
    storedParallelism,
    nonceValue,
    keyValue,
  ] = storedHash.split('$')

  if (
    algorithm !== 'argon2id' ||
    !storedMemory ||
    !storedPasses ||
    !storedParallelism ||
    !nonceValue ||
    !keyValue
  ) {
    return false
  }

  const nonce = Buffer.from(nonceValue, 'base64url')
  const expectedKey = Buffer.from(keyValue, 'base64url')
  const actualKey = await new Promise<Buffer>((resolve, reject) => {
    argon2(
      'argon2id',
      {
        message: password,
        nonce,
        parallelism: Number(storedParallelism),
        tagLength: expectedKey.length,
        memory: Number(storedMemory),
        passes: Number(storedPasses),
      },
      (error, derivedKey) => (error ? reject(error) : resolve(derivedKey)),
    )
  })

  return (
    actualKey.length === expectedKey.length &&
    timingSafeEqual(actualKey, expectedKey)
  )
}
