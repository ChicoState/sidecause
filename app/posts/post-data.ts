export type PostListingRecord = {
  id: string
  title: string
  description: string
  location: string
  imageUrl: string | null
  createdAt: Date
  scheduledAt: Date
  maximumVolunteers: number
  currentVolunteers: number
  difficulty: 'EASY' | 'MEDIUM' | 'NORMAL' | 'HARD' | 'EXTRA_HARD'
}

export type PostCardData = Pick<
  PostListingRecord,
  'id' | 'title' | 'location' | 'imageUrl'
> & {
  description?: string
  createdAt: string
  scheduledAt: string
  maximumVolunteers: number
  currentVolunteers: number
  difficulty: PostListingRecord['difficulty']
}

export interface PostListingSource {
  listPublicPosts(): Promise<PostListingRecord[]>
}

const databaseSource: PostListingSource = {
  async listPublicPosts() {
    const { prisma } = await import('../../lib/prisma')
    const bounties = await prisma.bounty.findMany({
      where: {
        status: 'OPEN',
        deadline: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        locationLabel: true,
        imageUrl: true,
        createdAt: true,
        scheduledAt: true,
        maxVolunteers: true,
        difficulty: true,
        _count: {
          select: {
            volunteerAttendances: {
              where: { status: 'JOINED' },
            },
          },
        },
      },
    })

    return bounties.map((bounty) => ({
      id: bounty.id,
      title: bounty.title,
      description: bounty.description,
      location: bounty.locationLabel,
      imageUrl: bounty.imageUrl,
      createdAt: bounty.createdAt,
      scheduledAt: bounty.scheduledAt,
      maximumVolunteers: bounty.maxVolunteers,
      currentVolunteers: bounty._count.volunteerAttendances,
      difficulty: bounty.difficulty,
    }))
  },
}

/**
 * Keep the database query on the server and return only fields needed by a
 * public post card.
 */
export async function getPublicPostCards(
  source: PostListingSource = databaseSource,
): Promise<PostCardData[]> {
  const records = await source.listPublicPosts()

  return records
    .filter(
      (record) =>
        Number.isInteger(record.maximumVolunteers) &&
        record.maximumVolunteers > 0 &&
        Number.isInteger(record.currentVolunteers) &&
        record.currentVolunteers >= 0 &&
        record.currentVolunteers < record.maximumVolunteers,
    )
    .map(
      ({
        id,
        title,
        description,
        location,
        imageUrl,
        createdAt,
        scheduledAt,
        maximumVolunteers,
        currentVolunteers,
        difficulty,
      }) => ({
        id,
        title,
        description,
        location,
        imageUrl: getSafeImageUrl(imageUrl),
        createdAt: createdAt.toISOString(),
        scheduledAt: scheduledAt.toISOString(),
        maximumVolunteers,
        currentVolunteers,
        difficulty,
      }),
    )
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
