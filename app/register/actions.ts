'use server'

import { Prisma } from '../../generated/prisma/client'
import { redirect } from 'next/navigation'

import { signIn } from '../../auth'
import { assertWithinAuthRateLimit } from '../../lib/auth/rate-limit'
import { hashPassword } from '../../lib/auth/password'
import { validateRegistration } from '../../lib/auth/validation'
import { prisma } from '../../lib/prisma'

export async function registerAction(formData: FormData) {
  let input: { displayName: string; email: string; password: string }

  try {
    input = validateRegistration({
      displayName: String(formData.get('displayName') ?? ''),
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
    })
  } catch {
    redirect('/register?error=invalid')
  }

  const { displayName, email, password } = input
  assertWithinAuthRateLimit(`register:${email}`)

  try {
    await prisma.user.create({
      data: { displayName, email, passwordHash: await hashPassword(password) },
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      redirect('/register?error=email')
    }
    throw error
  }

  await signIn('credentials', { email, password, redirectTo: '/' })
}
