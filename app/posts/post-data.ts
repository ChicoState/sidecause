export type PostListingRecord = {
  id: string
  title: string
  location: string
  imageUrl: string | null
  maximumVolunteers: number
  currentVolunteers: number
}

export type PostCardData = Pick<
  PostListingRecord,
  'id' | 'title' | 'location' | 'imageUrl'
>

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
        locationLabel: true,
        imageUrl: true,
        maxVolunteers: true,
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
      location: bounty.locationLabel,
      imageUrl: bounty.imageUrl,
      maximumVolunteers: bounty.maxVolunteers,
      currentVolunteers: bounty._count.volunteerAttendances,
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
    .map(({ id, title, location, imageUrl }) => ({
      id,
      title,
      location,
      imageUrl: getSafeImageUrl(imageUrl),
    }))
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
