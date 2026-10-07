'use server'

import { AuthError } from 'next-auth'

import { signIn } from '../../auth'
import {
  initialLoginFormState,
  type LoginFormState,
} from '../../lib/auth/form-state'
import { validateLogin } from '../../lib/auth/validation'

export async function loginAction(
  _previousState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const values = { email: String(formData.get('email') ?? '').trim() }
  let credentials: { email: string; password: string }

  try {
    credentials = validateLogin({
      email: values.email,
      password: String(formData.get('password') ?? ''),
    })
  } catch {
    return {
      error: 'Enter a valid email address and password.',
      values,
    }
  }

  try {
    await signIn('credentials', { ...credentials, redirectTo: '/' })
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: 'The email address or password is incorrect.',
        values,
      }
    }
    throw error
  }

  return initialLoginFormState
}
