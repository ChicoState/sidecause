import { describe, expect, it } from 'vitest'

import {
  getPublicPostCards,
  type PostListingSource,
} from '../../app/posts/post-data'
import { filterPosts, sortPosts } from '../../app/posts/post-filters'
import { defaultPostFilters } from '../../app/posts/post-filters'

describe('getPublicPostCards', () => {
  it('omits full posts and returns only card-safe fields', async () => {
    const source: PostListingSource = {
      async listPublicPosts() {
        return [
          {
            id: 'open-task',
            title: 'Park cleanup',
            description: 'Help neighbors restore a community park.',
            location: 'Bidwell Park',
            imageUrl: '/posts/park-cleanup.svg',
            createdAt: new Date('2026-01-02T00:00:00.000Z'),
            scheduledAt: new Date('2026-02-02T10:00:00.000Z'),
            maximumVolunteers: 5,
            currentVolunteers: 3,
            difficulty: 'EASY',
          },
          {
            id: 'full-task',
            title: 'Food drive',
            description: 'Sort donated food for local families.',
            location: 'Downtown Chico',
            imageUrl: null,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            scheduledAt: new Date('2026-02-01T10:00:00.000Z'),
            maximumVolunteers: 4,
            currentVolunteers: 4,
            difficulty: 'HARD',
          },
        ]
      },
    }

    await expect(getPublicPostCards(source)).resolves.toEqual([
      {
        id: 'open-task',
        title: 'Park cleanup',
        description: 'Help neighbors restore a community park.',
        location: 'Bidwell Park',
        imageUrl: '/posts/park-cleanup.svg',
        createdAt: '2026-01-02T00:00:00.000Z',
        scheduledAt: '2026-02-02T10:00:00.000Z',
        maximumVolunteers: 5,
        currentVolunteers: 3,
        difficulty: 'EASY',
      },
    ])
  })

  it('does not pass insecure image URLs through to the page', async () => {
    const source: PostListingSource = {
      async listPublicPosts() {
        return [
          {
            id: 'task',
            title: 'Park cleanup',
            description: 'Help neighbors restore a community park.',
            location: 'Bidwell Park',
            imageUrl: 'http://images.example.test/park.jpg',
            createdAt: new Date('2026-01-02T00:00:00.000Z'),
            scheduledAt: new Date('2026-02-02T10:00:00.000Z'),
            maximumVolunteers: 5,
            currentVolunteers: 0,
            difficulty: 'MEDIUM',
          },
        ]
      },
    }

    await expect(getPublicPostCards(source)).resolves.toMatchObject([
      { imageUrl: null },
    ])
  })

  it('sorts cards from newest or oldest creation time', async () => {
    const source: PostListingSource = {
      async listPublicPosts() {
        return [
          {
            id: 'older-task',
            title: 'Older task',
            description: 'An older community task.',
            location: 'Chico',
            imageUrl: null,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            scheduledAt: new Date('2026-02-01T10:00:00.000Z'),
            maximumVolunteers: 5,
            currentVolunteers: 0,
            difficulty: 'HARD',
          },
          {
            id: 'newer-task',
            title: 'Newer task',
            description: 'A newer community task.',
            location: 'Chico',
            imageUrl: null,
            createdAt: new Date('2026-01-02T00:00:00.000Z'),
            scheduledAt: new Date('2026-02-03T10:00:00.000Z'),
            maximumVolunteers: 5,
            currentVolunteers: 0,
            difficulty: 'EASY',
          },
        ]
      },
    }

    const posts = await getPublicPostCards(source)

    expect(sortPosts(posts, 'newest').map((post) => post.id)).toEqual([
      'newer-task',
      'older-task',
    ])
    expect(sortPosts(posts, 'oldest').map((post) => post.id)).toEqual([
      'older-task',
      'newer-task',
    ])
    expect(sortPosts(posts, 'earliest-event').map((post) => post.id)).toEqual([
      'older-task',
      'newer-task',
    ])
    expect(sortPosts(posts, 'latest-event').map((post) => post.id)).toEqual([
      'newer-task',
      'older-task',
    ])
  })

  it('filters by location, available spots, and difficulty', () => {
    const posts = [
      {
        id: 'park',
        title: 'Park cleanup',
        description: 'Help neighbors restore a community park.',
        location: 'Bidwell Park',
        imageUrl: null,
        createdAt: '2026-01-02T00:00:00.000Z',
        scheduledAt: '2026-02-02T10:00:00.000Z',
        maximumVolunteers: 5,
        currentVolunteers: 3,
        difficulty: 'EASY' as const,
      },
      {
        id: 'pantry',
        title: 'Food pantry',
        description: 'Sort donations for local families.',
        location: 'Downtown Chico',
        imageUrl: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        scheduledAt: '2026-02-01T10:00:00.000Z',
        maximumVolunteers: 5,
        currentVolunteers: 1,
        difficulty: 'HARD' as const,
      },
    ]

    expect(
      filterPosts(posts, {
        ...defaultPostFilters,
        location: 'park',
      }).map((post) => post.id),
    ).toEqual(['park'])
    expect(
      filterPosts(posts, {
        ...defaultPostFilters,
        availability: 3,
      }).map((post) => post.id),
    ).toEqual(['pantry'])
    expect(
      filterPosts(posts, {
        ...defaultPostFilters,
        search: 'LOCAL FAMILIES',
      }).map((post) => post.id),
    ).toEqual(['pantry'])
    expect(
      filterPosts(posts, {
        ...defaultPostFilters,
        difficulty: ['HARD'],
      }).map((post) => post.id),
    ).toEqual(['pantry'])
  })
})
