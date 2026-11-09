const registrationError =
  'Please enter a display name, valid email address, and password of at least 8 characters.'

const displayNameError = 'Display name must be between 1 and 30 characters.'
const locationError = 'Location must be 100 characters or fewer.'
const descriptionError = 'Description must be 500 characters or fewer.'

export function validateDisplayName(value: string): string {
  const displayName = value.trim()

  if (displayName.length < 1 || displayName.length > 30) {
    throw new Error(displayNameError)
  }

  return displayName
}

export function validateProfileLocation(value: string): string {
  const location = value.trim()

  if (location.length > 100) {
    throw new Error(locationError)
  }

  return location
}

export function validateProfileDescription(value: string): string {
  const description = value.trim()

  if (description.length > 120) {
    throw new Error(descriptionError)
  }

  return description
}

export type RegistrationInput = {
  displayName: string
  email: string
  password: string
}

export function validateRegistration(
  input: RegistrationInput,
): RegistrationInput {
  let displayName: string
  try {
    displayName = validateDisplayName(input.displayName)
  } catch {
    throw new Error(registrationError)
  }
  const email = input.email.trim().toLowerCase()
  const password = input.password

  if (
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
