const registrationError =
  'Please enter a display name, valid email address, and password of at least 8 characters.'

export type RegistrationInput = {
  displayName: string
  email: string
  password: string
}

export function validateRegistration(
  input: RegistrationInput,
): RegistrationInput {
  const displayName = input.displayName.trim()
  const email = input.email.trim().toLowerCase()
  const password = input.password

  if (
    displayName.length < 1 ||
    displayName.length > 80 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    password.length < 8 ||
    password.length > 128
  ) {
    throw new Error(registrationError)
  }

  return { displayName, email, password }
}

export function validateLogin(
  input: Pick<RegistrationInput, 'email' | 'password'>,
) {
  const email = input.email.trim().toLowerCase()

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || input.password.length < 1) {
    throw new Error('Invalid email or password.')
  }

  return { email, password: input.password }
}
