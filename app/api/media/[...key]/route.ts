import { auth } from '../../../../auth'
import { canViewBounty } from '../../../../lib/bounty-visibility'
import { prisma } from '../../../../lib/prisma'
import { readObject } from '../../../../lib/object-storage'

type MediaRouteProps = {
  params: Promise<{ key: string[] }>
}

export async function GET(_request: Request, { params }: MediaRouteProps) {
  const { key: parts } = await params
  const key = parts.join('/')
  if (!isBountyImageKey(key)) return new Response(null, { status: 404 })

  const imageUrl = `/api/media/${key}`
  const session = await auth()
  const viewerId = session?.user?.id ?? null
  const bounty = await prisma.bounty.findFirst({
    where: { imageUrl },
    select: {
      id: true,
      status: true,
      deadline: true,
      posterId: true,
      maxVolunteers: true,
      volunteerAttendances: {
        where: { volunteerId: viewerId ?? '' },
        select: { status: true },
        take: 1,
      },
      _count: {
        select: {
          volunteerAttendances: {
            where: { status: 'JOINED' },
          },
        },
      },
    },
  })

  if (
    !bounty ||
    !canViewBounty({
      status: bounty.status,
      deadline: bounty.deadline,
      posterId: bounty.posterId,
      viewerId,
      viewerAttendance: bounty.volunteerAttendances[0]?.status ?? null,
      currentVolunteers: bounty._count.volunteerAttendances,
      maximumVolunteers: bounty.maxVolunteers,
    })
  ) {
    return new Response(null, { status: 404 })
  }

  try {
    const image = await readObject(key)
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(image.contentType)
    ) {
      return new Response(null, { status: 404 })
    }

    const responseBody = new ArrayBuffer(image.body.byteLength)
    new Uint8Array(responseBody).set(image.body)

    return new Response(responseBody, {
      headers: {
        'Cache-Control': 'private, no-store',
        'Content-Length': String(image.body.byteLength),
        'Content-Type': image.contentType,
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return new Response(null, { status: 404 })
  }
}

function isBountyImageKey(key: string): boolean {
  return /^bounties\/[0-9a-f-]{36}\.(?:jpg|png|webp)$/.test(key)
}
