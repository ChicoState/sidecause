import { prisma } from './prisma'
import { validateXpAmount } from './xp'

/**
 * Adds XP for a server-authorized event. Callers must decide why the member
 * earned XP; the client never supplies the user ID or award reason here.
 */
export async function addXpToUser(userId: string, amount: number) {
  const xp = validateXpAmount(amount)

  return prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: xp } },
    select: { id: true, xp: true },
  })
}
