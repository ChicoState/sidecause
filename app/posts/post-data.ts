export type PostListingRecord = {
  id: string
  title: string
  location: string
  imageUrl: string | null
  minimumVolunteers: number
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

const sampleRecords: PostListingRecord[] = [
  {
    id: 'cedar-grove-cleanup',
    title: 'Clean up Cedar Grove',
    location: 'Cedar Grove, Chico, CA',
    imageUrl: '/posts/cedar-grove-cleanup.svg',
    minimumVolunteers: 3,
    maximumVolunteers: 8,
    currentVolunteers: 2,
  },
  {
    id: 'food-pantry-sorting',
    title: 'Sort food pantry donations',
    location: 'Downtown Chico, CA',
    imageUrl: '/posts/food-pantry-sorting.svg',
    minimumVolunteers: 2,
    maximumVolunteers: 6,
    currentVolunteers: 3,
  },
  {
    id: 'community-garden',
    title: 'Water the community garden',
    location: 'South Chico, CA',
    imageUrl: '/posts/community-garden.svg',
    minimumVolunteers: 2,
    maximumVolunteers: 5,
    currentVolunteers: 1,
  },
  {
    id: 'trailhead-tidy',
    title: 'Tidy the trailhead',
    location: 'Upper Park, Chico, CA',
    imageUrl: '/posts/trailhead-tidy.svg',
    minimumVolunteers: 2,
    maximumVolunteers: 4,
    currentVolunteers: 2,
  },
]

const sampleSource: PostListingSource = {
  async listPublicPosts() {
    return sampleRecords
  },
}

/**
 * The page depends on this small server-side contract, not on the database
 * schema. Replace the sample source with the collaborator's adapter when it
 * is available. Only card-safe fields leave this function.
 */
export async function getPublicPostCards(
  source: PostListingSource = sampleSource,
): Promise<PostCardData[]> {
  const records = await source.listPublicPosts()

  return records
    .filter(
      (record) =>
        Number.isInteger(record.minimumVolunteers) &&
        record.minimumVolunteers > 0 &&
        Number.isInteger(record.maximumVolunteers) &&
        record.maximumVolunteers >= record.minimumVolunteers &&
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
