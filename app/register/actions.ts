'use server'

import { Prisma } from '../../generated/prisma/client'
import { AuthError } from 'next-auth'

import { signIn } from '../../auth'
import {
  initialRegisterFormState,
  type RegisterFormState,
} from '../../lib/auth/form-state'
import { assertWithinAuthRateLimit } from '../../lib/auth/rate-limit'
import { hashPassword } from '../../lib/auth/password'
import { validateRegistration } from '../../lib/auth/validation'
import { prisma } from '../../lib/prisma'

export async function registerAction(
  _previousState: RegisterFormState,
  formData: FormData,
): Promise<RegisterFormState> {
  const values = {
    displayName: String(formData.get('displayName') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim(),
  }
  let input: { displayName: string; email: string; password: string }

  try {
    input = validateRegistration({
      displayName: values.displayName,
      email: values.email,
      password: String(formData.get('password') ?? ''),
    })
  } catch {
    return {
      error:
        'Enter a display name, valid email address, and password of at least 8 characters.',
      values,
    }
  }

  const { displayName, email, password } = input
  const normalizedValues = { displayName, email }

  try {
    assertWithinAuthRateLimit(`register:${email}`)
  } catch {
    return {
      error: 'Too many account creation attempts. Please try again later.',
      values: normalizedValues,
    }
  }

  try {
    await prisma.user.create({
      data: { displayName, email, passwordHash: await hashPassword(password) },
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return {
        error:
          'An account already exists with this email address. Log in instead.',
        values: normalizedValues,
      }
    }
    throw error
  }

  try {
    await signIn('credentials', { email, password, redirectTo: '/' })
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error:
          'Your account was created, but we could not log you in. Please log in.',
        values: normalizedValues,
      }
    }
    throw error
  }

  return initialRegisterFormState
}
