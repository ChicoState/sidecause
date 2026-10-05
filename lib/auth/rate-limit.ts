const attempts = new Map<string, { count: number; resetAt: number }>()
const windowMs = 15 * 60 * 1000
const maximumAttempts = 10

export function assertWithinAuthRateLimit(key: string) {
  const now = Date.now()
  const current = attempts.get(key)

  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs })
    return
  }

  if (current.count >= maximumAttempts) {
    throw new Error('Too many attempts. Please try again later.')
  }

  current.count += 1
}

export function clearAuthRateLimit(key: string) {
  attempts.delete(key)
}
