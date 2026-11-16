import styles from './create.module.css'

export function CreatePostSpecifications({
  pending,
  error,
}: {
  pending: boolean
  error: string
}) {
  return (
    <aside className={styles.details} aria-label="Post specifications">
      <label className={styles.imageField}>
        <span>Add an image (optional)</span>
        <input
          accept="image/jpeg,image/png,image/webp"
          name="image"
          type="file"
        />
        <span className={styles.fieldHint}>JPEG, PNG, or WebP, up to 5 MB</span>
      </label>

      <dl className={styles.specifications}>
        <div className={styles.specification}>
          <dt>
            <label htmlFor="location">Location</label>
          </dt>
          <dd>
            <input
              autoComplete="street-address"
              id="location"
              maxLength={500}
              name="location"
              placeholder="Street address or neighborhood"
              required
            />
          </dd>
        </div>
        <div className={styles.specification}>
          <dt>
            <label htmlFor="scheduledAt">Date and time</label>
          </dt>
          <dd>
            <input
              id="scheduledAt"
              name="scheduledAt"
              required
              type="datetime-local"
            />
          </dd>
        </div>
        <div className={styles.specification}>
          <dt>
            <label htmlFor="deadline">Sign-up deadline</label>
          </dt>
          <dd>
            <input
              id="deadline"
              name="deadline"
              required
              type="datetime-local"
            />
          </dd>
        </div>
        <div className={styles.specification}>
          <dt>
            <label htmlFor="maximumVolunteers">Maximum volunteers</label>
          </dt>
          <dd>
            <input
              id="maximumVolunteers"
              min="1"
              name="maximumVolunteers"
              required
              type="number"
            />
          </dd>
        </div>
        <div className={styles.specification}>
          <dt>
            <label htmlFor="difficulty">Difficulty</label>
          </dt>
          <dd>
            <select defaultValue="" id="difficulty" name="difficulty" required>
              <option disabled value="">
                Choose difficulty
              </option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="NORMAL">Normal</option>
              <option value="HARD">Hard</option>
              <option value="EXTRA_HARD">Extra hard</option>
            </select>
          </dd>
        </div>
        <div className={styles.specification}>
          <dt>
            <label htmlFor="payPerVolunteer">Pay per volunteer</label>
          </dt>
          <dd className={styles.payInput}>
            <span aria-hidden="true">$</span>
            <input
              id="payPerVolunteer"
              min="0"
              name="payPerVolunteer"
              required
              step="0.01"
              type="number"
            />
          </dd>
        </div>
      </dl>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <button className={styles.submitButton} disabled={pending} type="submit">
        {pending ? 'Creating post…' : 'Create post'}
      </button>
    </aside>
  )
}
