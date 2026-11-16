'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import styles from './detail.module.css'

type VolunteerActionProps = {
  bountyId: string
  status: 'OPEN' | 'FULL' | 'FINISHED'
  attendance: 'JOINED' | 'WITHDRAWN' | null
  signedIn: boolean
}

export function VolunteerAction({
  bountyId,
  status,
  attendance,
  signedIn,
}: VolunteerActionProps) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const returnTo = `/posts/${bountyId}`
  const accountHref = `/login?returnTo=${encodeURIComponent(returnTo)}`

  let label = 'Sign up'
  let disabled = false
  if (attendance === 'WITHDRAWN') {
    label = 'Unenrolled'
    disabled = true
  } else if (status === 'FINISHED') {
    label = attendance === 'JOINED' ? 'Unenroll' : 'Sign up'
    disabled = true
  } else if (status === 'FULL' && attendance !== 'JOINED') {
    disabled = true
  } else if (attendance === 'JOINED') {
    label = 'Unenroll'
  }

  if (!signedIn && !disabled) {
    return (
      <Link className={styles.signupButton} href={accountHref}>
        Sign up
      </Link>
    )
  }

  async function updateAttendance() {
    setPending(true)
    setError(null)
    try {
      const response = await fetch(`/api/bounties/${bountyId}/volunteers`, {
        method: attendance === 'JOINED' ? 'DELETE' : 'POST',
      })
      const result = (await response.json()) as {
        error?: { message?: string }
      }
      if (!response.ok) {
        setError(result.error?.message ?? 'Your sign-up could not be updated.')
        return
      }
      router.refresh()
    } catch {
      setError('Your sign-up could not be updated. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <button
        className={styles.signupButton}
        disabled={disabled || pending}
        onClick={updateAttendance}
        type="button"
      >
        {pending ? 'Updating…' : label}
      </button>
      {error && (
        <p className={styles.signupError} role="alert">
          {error}
        </p>
      )}
    </>
  )
}
