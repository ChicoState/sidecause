// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../auth', () => ({ signOut: vi.fn() }))

import Navbar from '../../app/Navbar'

afterEach(cleanup)

describe('Navbar', () => {
  it('shows Login to signed-out visitors', () => {
    render(<Navbar session={null} />)

    expect(
      screen.getByRole('link', { name: 'Login' }).getAttribute('href'),
    ).toBe('/login')
    expect(screen.queryByRole('button', { name: 'Log out' })).toBeNull()
  })

  it('replaces Login with the member name and Log out for signed-in members', () => {
    render(<Navbar session={{ user: { name: 'Ada Lovelace' } }} />)

    expect(screen.getByText('Ada Lovelace')).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Log out' })).not.toBeNull()
    expect(screen.queryByRole('link', { name: 'Login' })).toBeNull()
  })
})
