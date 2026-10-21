'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'

import type { ProfileImageOption } from '../../lib/profile-images'

import ProfileSettings from './ProfileSettings'
import styles from './profile.module.css'

export default function ProfileView({
  avatarId,
  imageOptions,
  name,
  memberSince,
}: {
  avatarId: string
  imageOptions: ProfileImageOption[]
  name: string | null | undefined
  memberSince: Date | undefined
}) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(avatarId)
  const [saveState, setSaveState] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle')
  const closeSettings = useCallback(() => setSettingsOpen(false), [])
  const chooseAvatar = useCallback(
    async (id: string) => {
      const previousAvatar = selectedAvatar
      setSelectedAvatar(id)
      setSaveState('saving')

      try {
        const response = await fetch('/api/profile/avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatarId: id }),
        })
        if (!response.ok) throw new Error('Unable to save profile image')
        setSaveState('saved')
      } catch {
        setSelectedAvatar(previousAvatar)
        setSaveState('error')
      }
    },
    [selectedAvatar],
  )
  const currentAvatar =
    imageOptions.find((avatar) => avatar.id === selectedAvatar) ??
    imageOptions[0]

  return (
    <main className={styles.profilePage}>
      <section aria-labelledby="profile-title" className={styles.profileHeader}>
        <div
          aria-label={`Selected profile image: ${currentAvatar?.label}`}
          className={styles.profileAvatar}
          style={{
            backgroundColor:
              currentAvatar && 'color' in currentAvatar
                ? currentAvatar.color
                : undefined,
          }}
        >
          {currentAvatar && 'imageUrl' in currentAvatar ? (
            <Image
              alt=""
              className={styles.profileAvatarImage}
              height={88}
              src={currentAvatar?.imageUrl}
              unoptimized
              width={88}
            />
          ) : (
            <span aria-hidden="true">
              {currentAvatar && 'symbol' in currentAvatar
                ? currentAvatar.symbol
                : ''}
            </span>
          )}
        </div>
        <div>
          <p className="eyebrow">Your profile</p>
          <h1 id="profile-title">{name ?? 'SideCause member'}</h1>
          <p className={styles.profileMeta}>
            Member since: {memberSince?.toLocaleDateString() ?? 'Recently'}
          </p>
        </div>
        <button
          aria-haspopup="dialog"
          className={styles.settingsButton}
          onClick={() => setSettingsOpen(true)}
          type="button"
        >
          Settings
        </button>
      </section>
      <section aria-label="Profile activity" className={styles.profileStats}>
        <p>Quests created: &mdash; &emsp; Quests completed: &mdash;</p>
      </section>
      <ProfileSettings
        displayName={name ?? ''}
        isOpen={settingsOpen}
        imageOptions={imageOptions}
        onAvatarChange={chooseAvatar}
        onClose={closeSettings}
        saveState={saveState}
        selectedAvatar={selectedAvatar}
      />
    </main>
  )
}
