'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import { CreatePostSpecifications } from './CreatePostSpecifications'
import { RequirementEditor, type RequirementRow } from './RequirementEditor'
import styles from './create.module.css'

export function CreatePostForm({ accountEmail }: { accountEmail: string }) {
  const router = useRouter()
  const [skills, setSkills] = useState<RequirementRow[]>([{ id: 0 }])
  const [equipment, setEquipment] = useState<RequirementRow[]>([{ id: 0 }])
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    const form = event.currentTarget
    const data = new FormData(form)
    for (const fieldName of ['scheduledAt', 'deadline']) {
      const localDateTime = data.get(fieldName)
      if (typeof localDateTime === 'string' && localDateTime) {
        const date = new Date(localDateTime)
        if (Number.isNaN(date.getTime())) {
          setError('Enter a valid date and time.')
          return
        }
        data.set(fieldName, date.toISOString())
      }
    }

    setPending(true)
    setError('')

    try {
      const response = await fetch('/api/bounties', {
        method: 'POST',
        body: data,
      })
      const result = (await response.json()) as {
        error?: { message?: string }
      }

      if (!response.ok) {
        setError(result.error?.message ?? 'The post could not be created.')
        setPending(false)
        return
      }

      router.replace('/posts')
    } catch {
      setError(
        'The post could not be created. Check your connection and try again.',
      )
      setPending(false)
    }
  }

  function addRequirement(
    rows: RequirementRow[],
    setRows: (rows: RequirementRow[]) => void,
  ) {
    if (rows.length < 3) {
      setRows([...rows, { id: Math.max(...rows.map((row) => row.id)) + 1 }])
    }
  }

  function removeRequirement(
    rows: RequirementRow[],
    setRows: (rows: RequirementRow[]) => void,
    id: number,
  ) {
    if (rows.length > 1) setRows(rows.filter((row) => row.id !== id))
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.columns}>
        <section
          className={styles.primary}
          aria-label="Post description and requirements"
        >
          <p className={styles.eyebrow}>New community opportunity</p>
          <label className={styles.titleField}>
            <span className={styles.visuallyHidden}>Post title</span>
            <input
              autoComplete="off"
              maxLength={200}
              name="title"
              placeholder="Post title"
              required
            />
          </label>

          <label className={styles.field}>
            <span>Description</span>
            <textarea maxLength={10000} name="description" required rows={7} />
          </label>

          <section className={styles.contact} aria-labelledby="contact-title">
            <h2 id="contact-title">Contact email</h2>
            <p className={styles.accountEmail}>{accountEmail}</p>
            <p className={styles.fieldHint}>
              This comes from your account and is shared only with you and
              active volunteers.
            </p>
          </section>

          <section
            className={styles.requirements}
            aria-labelledby="requirements-title"
          >
            <h2 id="requirements-title">What you’ll need</h2>
            <RequirementEditor
              label="Skills"
              name="skill"
              onAdd={() => addRequirement(skills, setSkills)}
              onRemove={(id) => removeRequirement(skills, setSkills, id)}
              rows={skills}
            />
            <RequirementEditor
              label="Equipment"
              name="equipment"
              onAdd={() => addRequirement(equipment, setEquipment)}
              onRemove={(id) => removeRequirement(equipment, setEquipment, id)}
              rows={equipment}
            />
          </section>
        </section>

        <CreatePostSpecifications error={error} pending={pending} />
      </div>
    </form>
  )
}
