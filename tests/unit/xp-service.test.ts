import { beforeEach, describe, expect, it, vi } from 'vitest'

const { update } = vi.hoisted(() => ({
  update: vi.fn(),
}))

vi.mock('../../lib/prisma', () => ({
  prisma: { user: { update } },
}))

import { addXpToUser } from '../../lib/xp-service'

describe('addXpToUser', () => {
  beforeEach(() => update.mockReset())

  it('atomically increments the selected user XP', async () => {
    update.mockResolvedValue({ id: 'user-1', xp: 125 })

    await expect(addXpToUser('user-1', 25)).resolves.toEqual({
      id: 'user-1',
      xp: 125,
    })
    expect(update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { xp: { increment: 25 } },
      select: { id: true, xp: true },
    })
  })

  it('does not write invalid awards', async () => {
    await expect(addXpToUser('user-1', 0)).rejects.toThrow()
    expect(update).not.toHaveBeenCalled()
  })
})
