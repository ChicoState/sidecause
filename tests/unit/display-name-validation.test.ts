import { describe, expect, it } from 'vitest'

import { validateDisplayName } from '../../lib/auth/validation'

describe('validateDisplayName', () => {
  it('trims and accepts display names up to 30 characters', () => {
    const displayName = validateDisplayName('  Community Garden Team Leaders!  ')

    expect(displayName).toBe('Community Garden Team Leaders!')
    expect(displayName).toHaveLength(30)
  })

  it('rejects display names longer than 30 characters', () => {
    expect(() => validateDisplayName('a'.repeat(31))).toThrow()
  })
})
