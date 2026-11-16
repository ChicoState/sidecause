import Link from 'next/link'

import { getSafePostReturnTo } from '../../lib/auth/return-to'
import { LoginForm } from './LoginForm'

type LoginPageProps = {
  searchParams?: Promise<{ returnTo?: string }>
}

export default async function LoginPage({
  searchParams = Promise.resolve({}),
}: LoginPageProps) {
  const { returnTo: requestedReturnTo } = await searchParams
  const returnTo = getSafePostReturnTo(requestedReturnTo)

  return (
    <main className="account-page">
      <section className="account-panel" aria-labelledby="login-title">
        <p className="eyebrow">Welcome back!</p>
        <h2 id="login-title">Log In</h2>

        <LoginForm returnTo={returnTo} />

        <p className="account-panel__switch">
          New to SideCause?{' '}
          <Link
            href={
              returnTo === '/'
                ? '/register'
                : `/register?returnTo=${encodeURIComponent(returnTo)}`
            }
          >
            Create an account
          </Link>
        </p>
      </section>
    </main>
  )
}
