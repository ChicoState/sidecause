import Link from 'next/link'
import { signOut } from '../auth'

import './Navbar.css'

type NavbarProps = {
  session: { user?: { name?: string | null } } | null
}

export default function Navbar({ session }: NavbarProps) {
  return (
    <nav>
      <ul>
        <li>
          <Link href="/">SideCause</Link>
        </li>
        <li>
          <Link href="/posts">Posts</Link>
        </li>
        {session?.user ? (
          <>
            <li aria-label="Signed in member">
              <Link href="/">{session.user.name ?? 'Member'}</Link>
            </li>
            <li>
              <form
                action={async () => {
                  'use server'
                  await signOut({ redirectTo: '/' })
                }}
              >
                <button type="submit">Log out</button>
              </form>
            </li>
          </>
        ) : (
          <li>
            <Link href="/login">Login</Link>
          </li>
        )}
      </ul>
    </nav>
  )
}
