// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const { loginAction, registerAction } = vi.hoisted(() => ({
  loginAction: vi.fn(),
  registerAction: vi.fn(),
}))

vi.mock('../../app/login/actions', () => ({ loginAction }))
vi.mock('../../app/register/actions', () => ({ registerAction }))

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

  it('keeps the email address and explains a failed login', async () => {
    loginAction.mockResolvedValueOnce({
      error: 'The email address or password is incorrect.',
      values: { email: 'maya@example.com' },
    })
    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'maya@example.com' },
    })
    fireEvent.submit(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Log in' }).form!,
    )

    expect((await screen.findByRole('alert')).textContent).toBe(
      'The email address or password is incorrect.',
    )
    expect(screen.getByLabelText<HTMLInputElement>('Email address').value).toBe(
      'maya@example.com',
    )
  })

  it('keeps non-sensitive registration fields and explains a duplicate email', async () => {
    registerAction.mockResolvedValueOnce({
      error:
        'An account already exists with this email address. Log in instead.',
      values: { displayName: 'Maya Chen', email: 'maya@example.com' },
    })
    render(<RegisterPage />)

    fireEvent.change(screen.getByLabelText('Display name'), {
      target: { value: 'Maya Chen' },
    })
    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'maya@example.com' },
    })
    fireEvent.submit(
      screen.getByRole<HTMLButtonElement>('button', {
        name: 'Create account',
      }).form!,
    )

    expect((await screen.findByRole('alert')).textContent).toBe(
      'An account already exists with this email address. Log in instead.',
    )
    expect(screen.getByLabelText<HTMLInputElement>('Display name').value).toBe(
      'Maya Chen',
    )
    expect(screen.getByLabelText<HTMLInputElement>('Email address').value).toBe(
      'maya@example.com',
    )
  })
})
