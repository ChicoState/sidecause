export type LoginFormState = {
  error: string | null
  values: { email: string }
}

export const initialLoginFormState: LoginFormState = {
  error: null,
  values: { email: '' },
}

export type RegisterFormState = {
  error: string | null
  values: { displayName: string; email: string }
}

export const initialRegisterFormState: RegisterFormState = {
  error: null,
  values: { displayName: '', email: '' },
}
