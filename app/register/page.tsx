import Link from 'next/link'

import { getSafePostReturnTo } from '../../lib/auth/return-to'
import { RegisterForm } from './RegisterForm'

type RegisterPageProps = {
  searchParams?: Promise<{ returnTo?: string }>
}

export default async function RegisterPage({
  searchParams = Promise.resolve({}),
}: RegisterPageProps) {
  const { returnTo: requestedReturnTo } = await searchParams
  const returnTo = getSafePostReturnTo(requestedReturnTo)

  return (
    <main className="account-page">
      <section className="account-panel" aria-labelledby="register-title">
        <p className="eyebrow">Join the cause</p>
        <h2 id="register-title">Create an Account</h2>

        <RegisterForm returnTo={returnTo} />

        <p className="account-panel__switch">
          Already have an account?{' '}
          <Link
            href={
              returnTo === '/'
                ? '/login'
                : `/login?returnTo=${encodeURIComponent(returnTo)}`
            }
          >
            Log in
          </Link>
        </p>
      </section>
    </main>
  )
}
