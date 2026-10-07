import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

import { prisma } from './lib/prisma'
import {
  assertWithinAuthRateLimit,
  clearAuthRateLimit,
} from './lib/auth/rate-limit'
import { verifyPassword } from './lib/auth/password'
import { validateLogin } from './lib/auth/validation'

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        try {
          const { email, password } = validateLogin({
            email: String(credentials.email ?? ''),
            password: String(credentials.password ?? ''),
          })
          assertWithinAuthRateLimit(`login:${email}`)

          const user = await prisma.user.findUnique({ where: { email } })
          if (!user || !(await verifyPassword(password, user.passwordHash))) {
            return null
          }

          clearAuthRateLimit(`login:${email}`)
          return { id: user.id, name: user.displayName, email: user.email }
        } catch {
          return null
        }
      },
    }),
  ],
})
