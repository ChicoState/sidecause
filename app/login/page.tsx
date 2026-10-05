import Link from 'next/link'

import { loginAction } from './actions'

export default function LoginPage() {
  return (
    <main className="account-page">
      <section className="account-panel" aria-labelledby="login-title">
        <p className="eyebrow">Welcome back!</p>
        <h2 id="login-title">Log In</h2>

        <form action={loginAction} className="account-form">
          <div className="form-field">
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
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
          <button type="submit">Log in</button>
        </form>

        <p className="account-panel__switch">
          New to SideCause? <Link href="/register">Create an account</Link>
        </p>
      </section>
    </main>
  )
}
