export type PostRequirement = {
  name: string
  level: 'REQUIRED' | 'RECOMMENDED'
}

export type PostDetailData = {
  id: string
  title: string
  description: string
  location: string
  imageUrl: string | null
  status: 'OPEN' | 'FULL' | 'FINISHED'
  scheduledAt: Date
  payPerVolunteer: number
  maximumVolunteers: number
  currentVolunteers: number
  posterName: string
  posterEmail: string | null
  viewerAttendance: 'JOINED' | 'WITHDRAWN' | null
  skills: PostRequirement[]
  equipment: PostRequirement[]
}

export interface PostDetailSource {
  findAccessiblePost(
    id: string,
    viewerId: string | null,
  ): Promise<PostDetailData | null>
}

const databaseSource: PostDetailSource = {
  async findAccessiblePost(id, viewerId) {
    const { prisma } = await import('../../../lib/prisma')
    const bounty = await prisma.bounty.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        deadline: true,
        posterId: true,
        title: true,
        description: true,
        locationLabel: true,
        imageUrl: true,
        scheduledAt: true,
        payPerVolunteer: true,
        maxVolunteers: true,
        poster: { select: { displayName: true } },
        volunteerAttendances: {
          where: { volunteerId: viewerId ?? '' },
          select: { status: true },
          take: 1,
        },
        skillRequirements: { select: { name: true, level: true } },
        equipmentRequirements: { select: { name: true, level: true } },
        _count: {
          select: {
            volunteerAttendances: {
              where: { status: 'JOINED' },
            },
          },
        },
      },
    })

    if (!bounty) {
      return null
    }
    if (
      bounty.status !== 'OPEN' &&
      bounty.status !== 'FULL' &&
      bounty.status !== 'FINISHED'
    ) {
      return null
    }

    const now = new Date()
    const viewerIsPoster = viewerId !== null && bounty.posterId === viewerId
    const viewerAttendance = bounty.volunteerAttendances[0]?.status ?? null
    const viewerIsActiveAttendee = viewerAttendance === 'JOINED'
    const currentVolunteers = bounty._count.volunteerAttendances

    const openAndAvailable =
      bounty.status === 'OPEN' &&
      bounty.deadline > now &&
      currentVolunteers < bounty.maxVolunteers
    const fullAndUnexpired = bounty.status === 'FULL' && bounty.deadline > now
    const finished = bounty.status === 'FINISHED'
    const restrictedViewer = viewerIsPoster || viewerIsActiveAttendee

    if (
      !openAndAvailable &&
      !(fullAndUnexpired && restrictedViewer) &&
      !(finished && restrictedViewer)
    ) {
      return null
    }

    const posterEmail = restrictedViewer
      ? ((
          await prisma.user.findUnique({
            where: { id: bounty.posterId },
            select: { email: true },
          })
        )?.email ?? null)
      : null

    return {
      id: bounty.id,
      title: bounty.title,
      description: bounty.description,
      location: bounty.locationLabel,
      imageUrl: getSafeImageUrl(bounty.imageUrl),
      status: bounty.status,
      scheduledAt: bounty.scheduledAt,
      payPerVolunteer: Number(bounty.payPerVolunteer),
      maximumVolunteers: bounty.maxVolunteers,
      currentVolunteers,
      posterName: bounty.poster.displayName,
      posterEmail,
      viewerAttendance,
      skills: bounty.skillRequirements,
      equipment: bounty.equipmentRequirements,
    }
  },
}

export async function getAccessiblePostDetail(
  id: string,
  viewerId: string | null,
  source: PostDetailSource = databaseSource,
): Promise<PostDetailData | null> {
  return source.findAccessiblePost(id, viewerId)
}

function getSafeImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null
  if (imageUrl.startsWith('/') && !imageUrl.startsWith('//')) return imageUrl

  try {
    const parsedImageUrl = new URL(imageUrl)
    return parsedImageUrl.protocol === 'https:' ? imageUrl : null
  } catch {
    return null
  }
}
