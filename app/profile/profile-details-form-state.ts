export type ProfileDetailsFormState = {
  error: string
  success: string
  values: {
    location: string
    description: string
  }
}

export const initialProfileDetailsFormState: ProfileDetailsFormState = {
  error: '',
  success: '',
  values: { location: '', description: '' },
}
