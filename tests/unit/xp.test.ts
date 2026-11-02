import { describe, expect, it } from 'vitest'

import { getLevelForXp, validateXpAmount } from '../../lib/xp'
import { getXpProgressPercent } from '../../lib/xp'

describe('getLevelForXp', () => {
  it('starts every member at level 1', () => {
    expect(getLevelForXp(0)).toBe(1)
  })

  it('advances one level for each 100 XP', () => {
    expect(getLevelForXp(99)).toBe(1)
    expect(getLevelForXp(100)).toBe(2)
    expect(getLevelForXp(250)).toBe(3)
  })

  it('rejects negative and non-integer XP totals', () => {
    expect(() => getLevelForXp(-1)).toThrow()
    expect(() => getLevelForXp(1.5)).toThrow()
  })
})

describe('validateXpAmount', () => {
  it('accepts positive integer awards', () => {
    expect(validateXpAmount(25)).toBe(25)
  })

  it('rejects zero, negative, fractional, and unsafe awards', () => {
    for (const amount of [0, -5, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
      expect(() => validateXpAmount(amount)).toThrow()
    }
  })
})

describe('getXpProgressPercent', () => {
  it('shows progress within the current level', () => {
    expect(getXpProgressPercent(0)).toBe(0)
    expect(getXpProgressPercent(50)).toBe(50)
    expect(getXpProgressPercent(99)).toBe(99)
  })

  it('resets progress when a member reaches the next level', () => {
    expect(getXpProgressPercent(100)).toBe(0)
  })
})
