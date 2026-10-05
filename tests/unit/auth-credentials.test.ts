import { describe, expect, it } from 'vitest'

import { hashPassword, verifyPassword } from '../../lib/auth/password'
import { validateRegistration } from '../../lib/auth/validation'

describe('registration validation', () => {
  it('normalizes a valid registration input', () => {
    expect(
      validateRegistration({
        displayName: '  Maya Chen  ',
        email: ' MAYA@example.com ',
        password: 'correct-horse-battery-staple',
      }),
    ).toEqual({
      displayName: 'Maya Chen',
      email: 'maya@example.com',
      password: 'correct-horse-battery-staple',
    })
  })

  it('rejects malformed credentials before they reach persistence', () => {
    expect(() =>
      validateRegistration({
        displayName: '',
        email: 'not-an-email',
        password: 'short',
      }),
    ).toThrow(
      'Please enter a display name, valid email address, and password of at least 8 characters.',
    )
  })
})

describe('password hashing', () => {
  it('verifies the original password without storing it as plaintext', async () => {
    const hash = await hashPassword('correct-horse-battery-staple')

    expect(hash).not.toContain('correct-horse-battery-staple')
    await expect(
      verifyPassword('correct-horse-battery-staple', hash),
    ).resolves.toBe(true)
  })

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword('correct-horse-battery-staple')

    await expect(verifyPassword('wrong-password', hash)).resolves.toBe(false)
  })
})
