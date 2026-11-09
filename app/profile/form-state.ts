export type DisplayNameFormState = {
  error: string
  success: string
  values: { displayName: string }
}

export const initialDisplayNameFormState: DisplayNameFormState = {
  error: '',
  success: '',
  values: { displayName: '' },
}
