import { describe, expect, it } from 'vitest'

import {
  getPublicPostCards,
  type PostListingSource,
} from '../../app/posts/post-data'

describe('getPublicPostCards', () => {
  it('omits full posts and returns only card-safe fields', async () => {
    const source: PostListingSource = {
      async listPublicPosts() {
        return [
          {
            id: 'open-task',
            title: 'Park cleanup',
            location: 'Bidwell Park',
            imageUrl: '/posts/park-cleanup.svg',
            maximumVolunteers: 5,
            currentVolunteers: 3,
          },
          {
            id: 'full-task',
            title: 'Food drive',
            location: 'Downtown Chico',
            imageUrl: null,
            maximumVolunteers: 4,
            currentVolunteers: 4,
          },
        ]
      },
    }

    await expect(getPublicPostCards(source)).resolves.toEqual([
      {
        id: 'open-task',
        title: 'Park cleanup',
        location: 'Bidwell Park',
        imageUrl: '/posts/park-cleanup.svg',
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
            location: 'Bidwell Park',
            imageUrl: 'http://images.example.test/park.jpg',
            maximumVolunteers: 5,
            currentVolunteers: 0,
          },
        ]
      },
    }

    await expect(getPublicPostCards(source)).resolves.toMatchObject([
      { imageUrl: null },
    ])
  })
})
