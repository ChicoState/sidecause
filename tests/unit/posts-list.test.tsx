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
          },
          { id: 'food-drive', title: 'Food drive', location: 'Downtown Chico' },
        ]}
      />,
    )

    expect(screen.getByText('Park cleanup')).toBeTruthy()
    expect(screen.getByText('Bidwell Park')).toBeTruthy()
    expect(screen.getByText('Food drive')).toBeTruthy()
    expect(
      screen.getAllByRole('button', { name: 'View details' }),
    ).toHaveLength(2)
  })

  it('shows the empty state when no posts are available', () => {
    render(<PostsList posts={[]} />)

    expect(screen.getByText('No posts')).toBeTruthy()
  })
})
