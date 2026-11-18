export const XP_PER_LEVEL = 100

export function validateXpAmount(amount: number): number {
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error('XP awards must be positive safe integers.')
  }

  return amount
}

export function getLevelForXp(xp: number): number {
  if (!Number.isSafeInteger(xp) || xp < 0) {
    throw new Error('XP must be a non-negative safe integer.')
  }

  return Math.floor(xp / XP_PER_LEVEL) + 1
}

export function getXpProgressPercent(xp: number): number {
  if (!Number.isSafeInteger(xp) || xp < 0) {
    throw new Error('XP must be a non-negative safe integer.')
  }

  return xp % XP_PER_LEVEL
}
