import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '../../auth'

import { LoginForm } from './LoginForm'

export default async function LoginPage() {
    const session = await auth()
    if (session?.user?.email) {
    redirect('/')
    }
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
