// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../app/login/actions', () => ({ loginAction: vi.fn() }))
vi.mock('../../app/register/actions', () => ({ registerAction: vi.fn() }))

import LoginPage from '../../app/login/page'
import RegisterPage from '../../app/register/page'

afterEach(cleanup)

describe('account page templates', () => {
  it('links the login page to account creation', () => {
    render(<LoginPage />)

    expect(
      screen
        .getByRole('link', { name: 'Create an account' })
        .getAttribute('href'),
    ).toBe('/register')
  })

  it('links the account-creation page back to login', () => {
    render(<RegisterPage />)

    expect(
      screen.getByRole('link', { name: 'Log in' }).getAttribute('href'),
    ).toBe('/login')
  })
})
