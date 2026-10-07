import Link from 'next/link'

import { RegisterForm } from './RegisterForm'

export default function RegisterPage() {
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
