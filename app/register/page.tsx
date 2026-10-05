import Link from 'next/link'

import { registerAction } from './actions'

export default function RegisterPage() {
  return (
    <main className="account-page">
      <section className="account-panel" aria-labelledby="register-title">
        <p className="eyebrow">Join the cause</p>
        <h2 id="register-title">Create an Account</h2>

        <form action={registerAction} className="account-form">
          <div className="form-field">
            <label htmlFor="display-name">Display name</label>
            <input
              id="display-name"
              name="displayName"
              type="text"
              autoComplete="nickname"
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
          <button type="submit">Create account</button>
        </form>

        <p className="account-panel__switch">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </section>
    </main>
  )
}
