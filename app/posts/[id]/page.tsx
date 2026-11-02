import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { auth } from '../../../auth'
import { getAccessiblePostDetail, type PostDifficulty } from './detail-data'
import styles from './detail.module.css'

type PostDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params
  const session = await auth()
  const post = await getAccessiblePostDetail(id, session?.user?.id ?? null)

  if (!post) notFound()
  const action = getPostAction(post.status, post.viewerAttendance)
  const statusClassName = {
    OPEN: styles.statusOpen,
    FULL: styles.statusFull,
    FINISHED: styles.statusFinished,
  }[post.status]

  return (
    <main className={styles.page}>
      <article className={styles.detail}>
        <Link className={styles.backLink} href="/posts">
          <span aria-hidden="true">←</span> Back to posts
        </Link>

        <div className={styles.columns}>
          <section className={styles.primary} aria-label="Post description">
            <p className={styles.poster}>Posted by {post.posterName}</p>
            <h1 className={styles.title}>{post.title}</h1>

            <div className={styles.descriptionSection}>
              <h2>Description</h2>
              <div
                aria-label={`Description for ${post.title}`}
                className={styles.description}
                tabIndex={0}
              >
                {post.description}
              </div>
            </div>

            <section className={styles.contact} aria-labelledby="contact-title">
              <h2 id="contact-title">Email</h2>
              <div className={styles.contactValue}>
                {post.posterEmail ?? ''}
              </div>
            </section>

            <section
              className={styles.requirements}
              aria-labelledby="requirements-title"
            >
              <h2 id="requirements-title">What you’ll need</h2>
              <RequirementList label="Skills" items={post.skills} />
              <RequirementList label="Equipment" items={post.equipment} />
            </section>
          </section>

          <aside className={styles.details} aria-label="Post specifications">
            <p className={`${styles.status} ${statusClassName}`}>
              {formatStatus(post.status)}
            </p>
            {post.imageUrl ? (
              <div className={styles.image}>
                <Image
                  alt={`${post.title} community task`}
                  className={styles.imageAsset}
                  fill
                  unoptimized
                  sizes="(min-width: 48rem) 42vw, 100vw"
                  src={post.imageUrl}
                />
              </div>
            ) : (
              <div
                className={`${styles.image} ${styles.imageFallback}`}
                aria-hidden="true"
              >
                Community task
              </div>
            )}

            <dl className={styles.specifications}>
              <div className={styles.specification}>
                <dt>Location</dt>
                <dd>{post.location}</dd>
              </div>
              <div className={styles.specification}>
                <dt>Date and time</dt>
                <dd>{formatSchedule(post.scheduledAt)}</dd>
              </div>
              <div className={styles.specification}>
                <dt>Volunteers</dt>
                <dd>
                  {post.currentVolunteers} of {post.maximumVolunteers} signed up
                </dd>
              </div>
              <div className={styles.specification}>
                <dt>Difficulty</dt>
                <dd>
                  <DifficultyCounter difficulty={post.difficulty} />
                </dd>
              </div>
              <div className={styles.specification}>
                <dt>Pay</dt>
                <dd>{formatPay(post.payPerVolunteer)} per volunteer</dd>
              </div>
            </dl>

            <button
              className={styles.signupButton}
              disabled={action.disabled}
              type="button"
            >
              {action.label}
            </button>
          </aside>
        </div>
      </article>
    </main>
  )
}

function DifficultyCounter({ difficulty }: { difficulty: PostDifficulty }) {
  const levels: { value: PostDifficulty; label: string }[] = [
    { value: 'EASY', label: 'Easy' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'NORMAL', label: 'Normal' },
    { value: 'HARD', label: 'Hard' },
    { value: 'EXTRA_HARD', label: 'Extra hard' },
  ]
  const selectedIndex = levels.findIndex((level) => level.value === difficulty)
  const selected = levels[selectedIndex]

  return (
    <span className={styles.difficulty}>
      <span
        className={styles.difficultySteps}
        role="meter"
        aria-label="Difficulty"
        aria-valuemin={1}
        aria-valuemax={levels.length}
        aria-valuenow={selectedIndex + 1}
        aria-valuetext={selected.label}
      >
        {levels.map((level, index) => (
          <span
            className={
              index <= selectedIndex
                ? styles.difficultyStepActive
                : styles.difficultyStep
            }
            key={level.value}
          />
        ))}
      </span>
      <span>{selected.label}</span>
    </span>
  )
}

function RequirementList({
  label,
  items,
}: {
  label: string
  items: { name: string; level: 'REQUIRED' | 'RECOMMENDED' }[]
}) {
  return (
    <div className={styles.requirementGroup}>
      <h3>{label}</h3>
      {items.length === 0 ? (
        <p className={styles.noRequirements}>
          No {label.toLowerCase()} specified.
        </p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.name}>
              {item.name} <span>{item.level.toLowerCase()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function getPostAction(
  status: 'OPEN' | 'FULL' | 'FINISHED',
  attendance: 'JOINED' | 'WITHDRAWN' | null,
): { label: string; disabled: boolean } {
  if (attendance === 'WITHDRAWN') {
    return { label: 'Unenrolled', disabled: true }
  }

  if (status === 'FINISHED') {
    return {
      label: attendance === 'JOINED' ? 'Unenroll' : 'Sign up',
      disabled: true,
    }
  }

  if (status === 'FULL' && attendance !== 'JOINED') {
    return { label: 'Sign up', disabled: true }
  }

  if (attendance === 'JOINED') {
    return { label: 'Unenroll', disabled: false }
  }

  return { label: 'Sign up', disabled: false }
}

function formatStatus(status: 'OPEN' | 'FULL' | 'FINISHED'): string {
  return status.charAt(0) + status.slice(1).toLowerCase()
}

function formatSchedule(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function formatPay(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}
