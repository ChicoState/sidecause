// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PostsList } from '../../app/posts/PostsList'

describe('PostsList', () => {
  it('renders each post with its title, location, and future detail action', () => {
    render(
      <PostsList
        posts={[
          {
            id: 'park-cleanup',
            title: 'Park cleanup',
            location: 'Bidwell Park',
            imageUrl: null,
            createdAt: '2026-01-02T00:00:00.000Z',
            scheduledAt: '2026-02-02T10:00:00.000Z',
            maximumVolunteers: 5,
            currentVolunteers: 2,
            difficulty: 'EASY',
          },
          {
            id: 'food-drive',
            title: 'Food drive',
            location: 'Downtown Chico',
            imageUrl: null,
            createdAt: '2026-01-01T00:00:00.000Z',
            scheduledAt: '2026-02-01T10:00:00.000Z',
            maximumVolunteers: 5,
            currentVolunteers: 2,
            difficulty: 'HARD',
          },
        ]}
      />,
    )

    expect(screen.getByText('Park cleanup')).toBeTruthy()
    expect(screen.getByText('Bidwell Park')).toBeTruthy()
    expect(screen.getByText('Food drive')).toBeTruthy()
    expect(screen.getAllByRole('link', { name: /More details/ })).toHaveLength(
      2,
    )
    expect(
      screen
        .getByRole('link', { name: 'More details about Park cleanup' })
        .getAttribute('href'),
    ).toBe('/posts/park-cleanup')
  })

  it('shows the empty state when no posts are available', () => {
    render(<PostsList posts={[]} />)

    expect(screen.getByText('No tasks are available right now.')).toBeTruthy()
  })
})
