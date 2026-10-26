'use client'

import { useActionState, useEffect, useRef, type CSSProperties } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import type { ProfileImageOption } from '../../lib/profile-images'

import {
  updateDisplayNameAction,
  updateProfileDetailsAction,
} from './actions'
import { initialDisplayNameFormState } from './form-state'
import { initialProfileDetailsFormState } from './profile-details-form-state'
import styles from './profile.module.css'

type ProfileSettingsProps = {
  imageOptions: ProfileImageOption[]
  isOpen: boolean
  displayName: string
  location: string
  description: string
  onProfileDetailsSaved: (
    location: string,
    description: string,
  ) => void
  onAvatarChange: (id: string) => void
  onClose: () => void
  saveState: 'idle' | 'saving' | 'saved' | 'error'
  selectedAvatar: string
}

export default function ProfileSettings({
  imageOptions,
  isOpen,
  displayName,
  location,
  description,
  onProfileDetailsSaved,
  onAvatarChange,
  onClose,
  saveState,
  selectedAvatar,
}: ProfileSettingsProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()
  const [displayNameState, displayNameFormAction, isDisplayNamePending] =
    useActionState(updateDisplayNameAction, {
      ...initialDisplayNameFormState,
      values: { displayName },
    })
  const [profileDetailsState, profileDetailsFormAction, isDetailsPending] =
    useActionState(updateProfileDetailsAction, {
      ...initialProfileDetailsFormState,
      values: { description, location },
    })

  useEffect(() => {
    if (!isOpen) return

    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (profileDetailsState.success) {
      onProfileDetailsSaved(
        profileDetailsState.values.location,
        profileDetailsState.values.description,
      )
    }
    if (displayNameState.success || profileDetailsState.success) {
      router.refresh()
    }
  }, [
    displayNameState.success,
    onProfileDetailsSaved,
    profileDetailsState.success,
    profileDetailsState.values.description,
    profileDetailsState.values.location,
    router,
  ])

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <section
        aria-labelledby="profile-settings-title"
        aria-modal="true"
        className={styles.settingsDialog}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className={styles.settingsHeader}>
          <div>
            <p className="eyebrow">Profile</p>
            <h2 id="profile-settings-title">Settings</h2>
          </div>
          <button
            aria-label="Close settings"
            className={styles.closeButton}
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            ×
          </button>
        </div>

        <div className={styles.settingGroup}>
          <div>
            <h3>About you</h3>
            <p className={styles.settingDescription}>
              Share where you are and what you care about.
            </p>
          </div>
          <form
            action={profileDetailsFormAction}
            className={styles.detailsForm}
          >
            <label htmlFor="profile-location">Location</label>
            <input
              autoComplete="address-level2"
              defaultValue={profileDetailsState.values.location}
              id="profile-location"
              maxLength={100}
              name="location"
              placeholder="City, region"
              type="text"
            />
            <label htmlFor="profile-description">Description</label>
            <textarea
              defaultValue={profileDetailsState.values.description}
              id="profile-description"
              maxLength={120}
              name="description"
              placeholder="Tell people a little about yourself"
              rows={4}
            />
            <button disabled={isDetailsPending} type="submit">
              {isDetailsPending ? 'Saving…' : 'Save details'}
            </button>
          </form>
          {profileDetailsState.error && (
            <p className={styles.settingError} role="alert">
              {profileDetailsState.error}
            </p>
          )}
          {profileDetailsState.success && (
            <p className={styles.savedMessage} role="status">
              {profileDetailsState.success}
            </p>
          )}
        </div>

        <div className={styles.settingGroup}>
          <div>
            <h3>Display name</h3>
            <p className={styles.settingDescription}>
              This is the name other SideCause members will see.
            </p>
          </div>
          <form action={displayNameFormAction} className={styles.nameForm}>
            <label className={styles.visuallyHidden} htmlFor="display-name">
              Display name
            </label>
            <input
              autoComplete="nickname"
              defaultValue={displayNameState.values.displayName}
              id="display-name"
              maxLength={30}
              name="displayName"
              required
              type="text"
            />
            <button disabled={isDisplayNamePending} type="submit">
              {isDisplayNamePending ? 'Saving…' : 'Save name'}
            </button>
          </form>
          {displayNameState.error && (
            <p className={styles.settingError} role="alert">
              {displayNameState.error}
            </p>
          )}
          {displayNameState.success && (
            <p className={styles.savedMessage} role="status">
              {displayNameState.success}
            </p>
          )}
        </div>

        <div className={styles.settingGroup}>
          <div>
            <h3>Profile image</h3>
            <p className={styles.settingDescription}>
              Choose an image from the SideCause collection.
            </p>
          </div>
          <div
            aria-label="Profile image choices"
            className={styles.avatarGrid}
            role="radiogroup"
          >
            {imageOptions.map((avatar) => (
              <button
                aria-label={avatar.label}
                aria-checked={selectedAvatar === avatar.id}
                className={`${styles.avatarOption} ${
                  selectedAvatar === avatar.id
                    ? styles.avatarOptionSelected
                    : ''
                }`}
                key={avatar.id}
                onClick={() => onAvatarChange(avatar.id)}
                role="radio"
                style={
                  'color' in avatar
                    ? ({ '--avatar-color': avatar.color } as CSSProperties)
                    : undefined
                }
                type="button"
              >
                {'imageUrl' in avatar ? (
                  <Image
                    alt=""
                    className={styles.avatarImage}
                    height={56}
                    src={avatar.imageUrl}
                    unoptimized
                    width={56}
                  />
                ) : (
                  <span aria-hidden="true" className={styles.avatarSymbol}>
                    {avatar.symbol}
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className={styles.savedMessage} role="status">
            {saveState === 'saving' && 'Saving…'}
            {saveState === 'saved' && 'Saved to your profile.'}
            {saveState === 'error' && 'Could not save your profile image.'}
          </p>
        </div>

        <div className={styles.settingPlaceholder}>
          <div>
            <h3>More profile settings</h3>
            <p className={styles.settingDescription}>
              Additional profile preferences can be added here as they become
              available.
            </p>
          </div>
          <span className={styles.comingSoon}>Coming soon</span>
        </div>
      </section>
    </div>
  )
}
