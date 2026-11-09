import type { Prisma } from '../../generated/prisma/client'
import { prisma } from '../prisma'

export type AttendanceResult =
  | { ok: true }
  | {
      ok: false
      code:
        | 'BOUNTY_NOT_FOUND'
        | 'BOUNTY_NOT_OPEN'
        | 'DEADLINE_PASSED'
        | 'CAPACITY_REACHED'
        | 'ALREADY_SIGNED_UP'
        | 'NOT_JOINED'
      message: string
    }

type TransactionClient = Prisma.TransactionClient

async function lockBounty(
  tx: TransactionClient,
  bountyId: string,
): Promise<boolean> {
  const rows = await tx.$queryRaw<Array<{ id: string }>>`
    SELECT "id" FROM "Bounty" WHERE "id" = ${bountyId} FOR UPDATE
  `
  return rows.length > 0
}

export async function joinBounty(
  bountyId: string,
  volunteerId: string,
): Promise<AttendanceResult> {
  return prisma.$transaction(async (tx) => {
    if (!(await lockBounty(tx, bountyId))) {
      return {
        ok: false,
        code: 'BOUNTY_NOT_FOUND',
        message: 'This opportunity could not be found.',
      }
    }

    const bounty = await tx.bounty.findUniqueOrThrow({
      where: { id: bountyId },
      select: { status: true, deadline: true, maxVolunteers: true },
    })
    const previousAttendance = await tx.bountyVolunteer.findUnique({
      where: { bountyId_volunteerId: { bountyId, volunteerId } },
      select: { status: true },
    })

    if (previousAttendance) {
      return {
        ok: false,
        code: 'ALREADY_SIGNED_UP',
        message: 'You cannot sign up for this opportunity again.',
      }
    }
    if (bounty.status !== 'OPEN') {
      return {
        ok: false,
        code: 'BOUNTY_NOT_OPEN',
        message: 'This opportunity is no longer open for sign-ups.',
      }
    }
    if (bounty.deadline <= new Date()) {
      return {
        ok: false,
        code: 'DEADLINE_PASSED',
        message: 'The sign-up deadline has passed.',
      }
    }

    const activeCount = await tx.bountyVolunteer.count({
      where: { bountyId, status: 'JOINED' },
    })
    if (activeCount >= bounty.maxVolunteers) {
      return {
        ok: false,
        code: 'CAPACITY_REACHED',
        message: 'All volunteer places have been filled.',
      }
    }

    await tx.bountyVolunteer.create({ data: { bountyId, volunteerId } })
    if (activeCount + 1 === bounty.maxVolunteers) {
      await tx.bounty.update({
        where: { id: bountyId },
        data: { status: 'FULL' },
      })
    }

    return { ok: true }
  })
}

export async function withdrawFromBounty(
  bountyId: string,
  volunteerId: string,
): Promise<AttendanceResult> {
  return prisma.$transaction(async (tx) => {
    if (!(await lockBounty(tx, bountyId))) {
      return {
        ok: false,
        code: 'BOUNTY_NOT_FOUND',
        message: 'This opportunity could not be found.',
      }
    }

    const bounty = await tx.bounty.findUniqueOrThrow({
      where: { id: bountyId },
      select: { status: true },
    })
    const attendance = await tx.bountyVolunteer.findUnique({
      where: { bountyId_volunteerId: { bountyId, volunteerId } },
      select: { status: true },
    })

    if (!attendance || attendance.status !== 'JOINED') {
      return {
        ok: false,
        code: 'NOT_JOINED',
        message: 'You are not currently signed up for this opportunity.',
      }
    }
    if (bounty.status !== 'OPEN' && bounty.status !== 'FULL') {
      return {
        ok: false,
        code: 'BOUNTY_NOT_OPEN',
        message: 'This opportunity can no longer be changed.',
      }
    }

    await tx.bountyVolunteer.update({
      where: { bountyId_volunteerId: { bountyId, volunteerId } },
      data: { status: 'WITHDRAWN', withdrawnAt: new Date() },
    })
    if (bounty.status === 'FULL') {
      await tx.bounty.update({
        where: { id: bountyId },
        data: { status: 'OPEN' },
      })
    }

    return { ok: true }
  })
}
