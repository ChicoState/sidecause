'use client'

import { useActionState, useState } from 'react'

import { initialRegisterFormState } from '../../lib/auth/form-state'
import { registerAction } from './actions'

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialRegisterFormState,
  )
  const [displayName, setDisplayName] = useState(
    initialRegisterFormState.values.displayName,
  )
  const [email, setEmail] = useState(initialRegisterFormState.values.email)

  return (
    <form action={formAction} className="account-form">
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      <div className="form-field">
        <label htmlFor="display-name">Display name</label>
        <input
          id="display-name"
          name="displayName"
          type="text"
          autoComplete="nickname"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="register-email">Email address</label>
        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="register-password">Password</label>
        <input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <p className="form-field__hint">Use at least 8 characters.</p>
      </div>
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  )
}
