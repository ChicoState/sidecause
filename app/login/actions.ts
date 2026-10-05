'use server'

import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'

import { signIn } from '../../auth'
import { validateLogin } from '../../lib/auth/validation'

export async function loginAction(formData: FormData) {
  let credentials: { email: string; password: string }

  try {
    credentials = validateLogin({
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
    })
  } catch (error) {
    if (error instanceof Error) {
      redirect('/login?error=invalid')
    }
    throw error
  }

  try {
    await signIn('credentials', { ...credentials, redirectTo: '/' })
  } catch (error) {
    if (error instanceof AuthError) {
      redirect('/login?error=invalid')
    }
    throw error
  }
}
