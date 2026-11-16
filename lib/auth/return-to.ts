const postPathPattern = /^\/posts\/[A-Za-z0-9_-]{1,128}$/

export function getSafePostReturnTo(value: unknown): string {
  if (typeof value === 'string' && postPathPattern.test(value)) {
    return value
  }
  return '/'
}
