import Link from 'next/link'
import Image from 'next/image'
import { signOut } from '../auth'
import type { ProfileImageOption } from '../lib/profile-images'

import './Navbar.css'

type NavbarProps = {
  session: { user?: { name?: string | null } } | null
  avatar?: ProfileImageOption
}

export default function Navbar({ session, avatar }: NavbarProps) {
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
              <Link className="navbar-profile" href="/profile">
                <span
                  aria-hidden="true"
                  className="navbar-avatar"
                  style={{
                    backgroundColor:
                      avatar && 'color' in avatar ? avatar.color : undefined,
                  }}
                >
                  {avatar && 'imageUrl' in avatar ? (
                    <Image
                      alt=""
                      height={32}
                      src={avatar.imageUrl}
                      unoptimized
                      width={32}
                    />
                  ) : avatar && 'symbol' in avatar ? (
                    avatar.symbol
                  ) : (
                    '🌿'
                  )}
                </span>
                {session.user.name ?? 'Member'}
              </Link>
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
