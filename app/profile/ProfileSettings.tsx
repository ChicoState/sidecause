'use client'

import { useEffect, useRef, type CSSProperties } from 'react'
import Image from 'next/image'

import type { ProfileImageOption } from '../../lib/profile-images'

import styles from './profile.module.css'

type ProfileSettingsProps = {
  imageOptions: ProfileImageOption[]
  isOpen: boolean
  onAvatarChange: (id: string) => void
  onClose: () => void
  saveState: 'idle' | 'saving' | 'saved' | 'error'
  selectedAvatar: string
}

export default function ProfileSettings({
  imageOptions,
  isOpen,
  onAvatarChange,
  onClose,
  saveState,
  selectedAvatar,
}: ProfileSettingsProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

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
