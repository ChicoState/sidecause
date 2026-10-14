import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '../../auth'

import { RegisterForm } from './RegisterForm'

export default async function RegisterPage() {
    const session = await auth()
    if (session?.user?.email) {
    redirect('/')
    }
  return (
    <main className="account-page">
      <section className="account-panel" aria-labelledby="register-title">
        <p className="eyebrow">Join the cause</p>
        <h2 id="register-title">Create an Account</h2>

        <RegisterForm />

        <p className="account-panel__switch">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </section>
    </main>
  )
}
