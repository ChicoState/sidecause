'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'

import type { ProfileImageOption } from '../../lib/profile-images'
import { getXpProgressPercent } from '../../lib/xp'

import ProfileSettings from './ProfileSettings'
import styles from './profile.module.css'

export default function ProfileView({
  avatarId,
  description,
  imageOptions,
  level,
  location,
  locationId,
  name,
  memberSince,
  xp,
}: {
  avatarId: string
  description: string | null | undefined
  imageOptions: ProfileImageOption[]
  level: number
  location: string | null | undefined
  locationId: string | null | undefined
  name: string | null | undefined
  memberSince: Date | undefined
  xp: number
}) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(avatarId)
  const [saveState, setSaveState] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle')
  const [profileLocation, setProfileLocation] = useState(location ?? '')
  const [profileDescription, setProfileDescription] = useState(
    description ?? '',
  )
  const closeSettings = useCallback(() => setSettingsOpen(false), [])
  const handleProfileDetailsSaved = useCallback(
    (nextLocation: string, nextDescription: string) => {
      setProfileLocation(nextLocation)
      setProfileDescription(nextDescription)
    },
    [],
  )
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
  const profileImageBackground =
    currentAvatar && 'color' in currentAvatar ? currentAvatar.color : undefined
  const xpProgressPercent = getXpProgressPercent(xp)

  return (
    <main className={styles.profilePage}>
      <section aria-labelledby="profile-title" className={styles.profileHeader}>
        <div
          aria-label={`Selected profile image: ${currentAvatar?.label}`}
          className={styles.profileAvatar}
          style={{
            backgroundColor: profileImageBackground,
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
        <div className={styles.profileIdentity}>
          <h1 id="profile-title">{name ?? 'SideCause member'}</h1>
          <p className={`${styles.profileMemberSince} eyebrow`}>
            Member since: {memberSince?.toLocaleDateString() ?? 'Recently'}
          </p>
          <div className={styles.profileDetails}>
            <p className={profileLocation ? '' : styles.profileDetailPrompt}>
              {profileLocation
                ? `📍 ${profileLocation}`
                : '📍 Add your location in Settings'}
            </p>
          </div>
        </div>
        <button
          aria-label="Open profile settings"
          aria-haspopup="dialog"
          className={styles.settingsButton}
          onClick={() => setSettingsOpen(true)}
          type="button"
        >
          ⚙
        </button>
        <div className={styles.profileDescription}>
          <p className={profileDescription ? '' : styles.profileDetailPrompt}>
            {profileDescription || 'Add a description in Settings'}
          </p>
        </div>
        <section aria-label="Profile activity" className={styles.profileStats}>
          <div
            className={styles.profileStatsCard}
            style={{ backgroundColor: profileImageBackground }}
          >
            <div className={styles.levelRow}>
              <span>Level: {level}</span>
              <div
                aria-label={`${xpProgressPercent}% toward level ${level + 1}`}
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={xpProgressPercent}
                className={styles.xpProgress}
                role="progressbar"
              >
                <span
                  className={styles.xpProgressFill}
                  style={{ width: `${xpProgressPercent}%` }}
                />
              </div>
            </div>
            <span>Total XP: {xp}</span>
          </div>
        </section>
      </section>
      <ProfileSettings
        description={description ?? ''}
        displayName={name ?? ''}
        isOpen={settingsOpen}
        imageOptions={imageOptions}
        location={location ?? ''}
        locationId={locationId ?? ''}
        onAvatarChange={chooseAvatar}
        onClose={closeSettings}
        onProfileDetailsSaved={handleProfileDetailsSaved}
        saveState={saveState}
        selectedAvatar={selectedAvatar}
      />
      <section aria-label="Profile posts" className={styles.profilePosts}>
        <div className={styles.profilePostColumn}>
          <h2>Quests Completed: [#]</h2>
          <div>
            <p>COMPLETED POSTS GO HERE</p>
          </div>
        </div>
        <div className={styles.profilePostColumn}>
          <h2>Quests Posted: [#]</h2>
          <div>
            <p>POSTED POSTS GO HERE</p>
          </div>
        </div>
      </section>
    </main>
  )
}
