import { describe, expect, it } from 'vitest'

import {
  validateDisplayName,
  validateProfileDescription,
  validateProfileLocation,
} from '../../lib/auth/validation'

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

describe('validateProfileLocation', () => {
  it('trims optional locations', () => {
    expect(validateProfileLocation('  Portland, OR  ')).toBe('Portland, OR')
  })

  it('rejects locations longer than 100 characters', () => {
    expect(() => validateProfileLocation('a'.repeat(101))).toThrow()
  })
})

describe('validateProfileDescription', () => {
  it('trims optional descriptions', () => {
    expect(validateProfileDescription('  Helping neighbors.  ')).toBe(
      'Helping neighbors.',
    )
  })

  it('rejects descriptions longer than 120 characters', () => {
    expect(() => validateProfileDescription('a'.repeat(121))).toThrow()
  })
})
