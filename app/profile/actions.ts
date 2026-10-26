'use server'

import { auth } from '../../auth'
import {
  validateDisplayName,
  validateProfileDescription,
  validateProfileLocation,
} from '../../lib/auth/validation'
import { prisma } from '../../lib/prisma'
import type { DisplayNameFormState } from './form-state'
import type { ProfileDetailsFormState } from './profile-details-form-state'

export async function updateDisplayNameAction(
  _previousState: DisplayNameFormState,
  formData: FormData,
): Promise<DisplayNameFormState> {
  const rawDisplayName = String(formData.get('displayName') ?? '')
  const values = { displayName: rawDisplayName.trim() }

  try {
    const session = await auth()
    if (!session?.user?.email) {
      return {
        error: 'Please sign in again before updating your display name.',
        success: '',
        values,
      }
    }

    const displayName = validateDisplayName(rawDisplayName)
    await prisma.user.update({
      where: { email: session.user.email },
      data: { displayName },
    })

    return {
      error: '',
      success: 'Display name saved.',
      values: { displayName },
    }
  } catch (error) {
    return {
      error:
        error instanceof Error && error.message.startsWith('Display name')
          ? error.message
          : 'We could not save your display name. Please try again.',
      success: '',
      values,
    }
  }
}

export async function updateProfileDetailsAction(
  _previousState: ProfileDetailsFormState,
  formData: FormData,
): Promise<ProfileDetailsFormState> {
  const rawLocation = String(formData.get('location') ?? '')
  const rawDescription = String(formData.get('description') ?? '')
  const values = {
    description: rawDescription.trim(),
    location: rawLocation.trim(),
  }

  try {
    const session = await auth()
    if (!session?.user?.email) {
      return {
        error: 'Please sign in again before updating your profile details.',
        success: '',
        values,
      }
    }

    const location = validateProfileLocation(rawLocation)
    const description = validateProfileDescription(rawDescription)
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        description: description || null,
        location: location || null,
      },
    })

    return {
      error: '',
      success: 'Profile details saved.',
      values,
    }
  } catch (error) {
    return {
      error:
        error instanceof Error &&
        (error.message.startsWith('Location') ||
          error.message.startsWith('Description'))
          ? error.message
          : 'We could not save your profile details. Please try again.',
      success: '',
      values,
    }
  }
}
