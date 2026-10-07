'use client'

import { useActionState, useState } from 'react'

import { initialLoginFormState } from '../../lib/auth/form-state'
import { loginAction } from './actions'

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialLoginFormState,
  )
  const [email, setEmail] = useState(initialLoginFormState.values.email)

  return (
    <form action={formAction} className="account-form">
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      <div className="form-field">
        <label htmlFor="login-email">Email address</label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <button type="submit" disabled={isPending}>
        {isPending ? 'Logging in…' : 'Log in'}
      </button>
    </form>
  )
}
