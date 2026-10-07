import Link from 'next/link'

import { LoginForm } from './LoginForm'

export default function LoginPage() {
  return (
    <main className="account-page">
      <section className="account-panel" aria-labelledby="login-title">
        <p className="eyebrow">Welcome back!</p>
        <h2 id="login-title">Log In</h2>

        <LoginForm />

        <p className="account-panel__switch">
          New to SideCause? <Link href="/register">Create an account</Link>
        </p>
      </section>
    </main>
  )
}
