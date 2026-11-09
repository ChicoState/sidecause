import type { PostCardData, PostListingRecord } from './post-data'

export type PostSortOrder =
  'newest' | 'oldest' | 'earliest-event' | 'latest-event'

export type PostAvailability = number | null

export type PostFilters = {
  search: string
  location: string
  availability: PostAvailability
  difficulty: PostListingRecord['difficulty'][]
  sortOrder: PostSortOrder
}

export const defaultPostFilters: PostFilters = {
  search: '',
  location: '',
  availability: null,
  difficulty: [],
  sortOrder: 'newest',
}

export function filterPosts(
  posts: PostCardData[],
  filters: PostFilters,
): PostCardData[] {
  const location = filters.location.trim().toLowerCase()
  const search = filters.search.trim().toLowerCase()

  return posts.filter((post) => {
    const availableSpots = post.maximumVolunteers - post.currentVolunteers
    const matchesLocation =
      !location || post.location.toLowerCase().includes(location)
    const searchableText =
      `${post.title} ${post.description ?? ''}`.toLowerCase()
    const matchesSearch = !search || searchableText.includes(search)
    const matchesAvailability =
      filters.availability === null || availableSpots >= filters.availability
    const matchesDifficulty =
      filters.difficulty.length === 0 ||
      filters.difficulty.includes(post.difficulty)

    return (
      matchesSearch &&
      matchesLocation &&
      matchesAvailability &&
      matchesDifficulty
    )
  })
}

export function sortPosts(
  posts: PostCardData[],
  order: PostSortOrder,
): PostCardData[] {
  return [...posts].sort((a, b) => {
    const field =
      order === 'earliest-event' || order === 'latest-event'
        ? 'scheduledAt'
        : 'createdAt'
    const difference = Date.parse(a[field]) - Date.parse(b[field])
    return order === 'newest' || order === 'latest-event'
      ? -difference
      : difference
  })
}
