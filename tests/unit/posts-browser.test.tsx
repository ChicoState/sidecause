// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { PostsBrowser } from '../../app/posts/PostsBrowser'

afterEach(cleanup)

describe('PostsBrowser', () => {
  it('reorders visible posts when oldest is applied', () => {
    render(
      <PostsBrowser
        posts={[
          {
            id: 'newer',
            title: 'Newer task',
            location: 'Chico',
            imageUrl: null,
            createdAt: '2026-01-02T00:00:00.000Z',
            scheduledAt: '2026-02-02T10:00:00.000Z',
            maximumVolunteers: 5,
            currentVolunteers: 2,
            difficulty: 'EASY',
          },
          {
            id: 'older',
            title: 'Older task',
            location: 'Chico',
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

    fireEvent.click(screen.getByRole('button', { name: 'Filters' }))
    fireEvent.change(screen.getByLabelText('Sort posts by'), {
      target: { value: 'oldest' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }))

    const titles = screen.getAllByRole('heading', { level: 2 })
    expect(titles.map((title) => title.textContent)).toEqual([
      'Older task',
      'Newer task',
    ])
  })

  it('reorders visible posts by latest event when selected', () => {
    render(
      <PostsBrowser
        posts={[
          {
            id: 'early-event',
            title: 'Early event',
            location: 'Chico',
            imageUrl: null,
            createdAt: '2026-01-03T00:00:00.000Z',
            scheduledAt: '2026-02-01T10:00:00.000Z',
            maximumVolunteers: 5,
            currentVolunteers: 2,
            difficulty: 'EASY',
          },
          {
            id: 'late-event',
            title: 'Late event',
            location: 'Chico',
            imageUrl: null,
            createdAt: '2026-01-01T00:00:00.000Z',
            scheduledAt: '2026-02-03T10:00:00.000Z',
            maximumVolunteers: 5,
            currentVolunteers: 2,
            difficulty: 'HARD',
          },
        ]}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Filters' }))
    fireEvent.change(screen.getByLabelText('Sort posts by'), {
      target: { value: 'latest-event' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }))

    const titles = screen.getAllByRole('heading', { level: 2 })
    expect(titles.map((title) => title.textContent)).toEqual([
      'Late event',
      'Early event',
    ])
  })

  it('shows active filters and clears them together', () => {
    render(
      <PostsBrowser
        posts={[
          {
            id: 'task',
            title: 'Park cleanup',
            description: 'Help neighbors restore a community park.',
            location: 'Bidwell Park',
            imageUrl: null,
            createdAt: '2026-01-02T00:00:00.000Z',
            scheduledAt: '2026-02-02T10:00:00.000Z',
            maximumVolunteers: 5,
            currentVolunteers: 1,
            difficulty: 'EASY',
          },
        ]}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Filters' }))
    fireEvent.change(screen.getByLabelText('Location'), {
      target: { value: 'park' },
    })
    fireEvent.change(screen.getByLabelText('Availability'), {
      target: { value: '4' },
    })
    fireEvent.change(screen.getByLabelText('Search posts'), {
      target: { value: 'park' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }))

    expect(screen.getByRole('button', { name: 'Location: park' })).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'At least 4 spots' }),
    ).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Search: park' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))

    expect(screen.queryByRole('button', { name: 'Location: park' })).toBeNull()
    expect(
      screen.queryByRole('button', { name: 'At least 4 spots' }),
    ).toBeNull()
    expect(screen.queryByRole('button', { name: 'Search: park' })).toBeNull()
    expect(screen.getByRole('heading', { name: 'Park cleanup' })).toBeTruthy()
  })
})
