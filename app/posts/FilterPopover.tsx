'use client'

import { useEffect, useRef, useState } from 'react'

import {
  defaultPostFilters,
  type PostFilters,
  type PostSortOrder,
} from './post-filters'
import styles from './posts.module.css'

type FilterPopoverProps = {
  filters: PostFilters
  onApplyFilters: (filters: PostFilters) => void
}

export function FilterPopover({ filters, onApplyFilters }: FilterPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!isOpen) return

    closeButtonRef.current?.focus()

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [isOpen])

  return (
    <div className={styles.filterControl}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={styles.filterButton}
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        Filters
      </button>

      {isOpen && (
        <form
          className={styles.filterPopover}
          onSubmit={(event) => {
            event.preventDefault()
            const formData = new FormData(event.currentTarget)
            const value = formData.get('sortOrder')
            const nextOrder: PostSortOrder =
              value === 'oldest' ||
              value === 'earliest-event' ||
              value === 'latest-event'
                ? value
                : 'newest'
            const availability = formData.get('availability')
            const parsedAvailability = Number(availability)
            const nextAvailability =
              typeof availability === 'string' &&
              availability.trim() !== '' &&
              Number.isInteger(parsedAvailability) &&
              parsedAvailability > 0
                ? parsedAvailability
                : null
            const difficulty = formData
              .getAll('difficulty')
              .filter((value): value is PostFilters['difficulty'][number] =>
                ['EASY', 'MEDIUM', 'NORMAL', 'HARD', 'EXTRA_HARD'].includes(
                  value as string,
                ),
              )
            onApplyFilters({
              search: String(formData.get('search') ?? '').trim(),
              location: String(formData.get('location') ?? ''),
              availability: nextAvailability,
              difficulty,
              sortOrder: nextOrder,
            })
            setIsOpen(false)
          }}
          ref={formRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="filter-title"
        >
          <div className={styles.filterHeader}>
            <div>
              <h2 id="filter-title">Filter posts</h2>
              <p>Find a community task that fits your day.</p>
            </div>
            <button
              aria-label="Close filters"
              className={styles.filterClose}
              onClick={() => setIsOpen(false)}
              ref={closeButtonRef}
              type="button"
            >
              ×
            </button>
          </div>

          <div className={styles.filterFields}>
            <div className={styles.filterField}>
              <label htmlFor="filter-search">Search posts</label>
              <input
                defaultValue={filters.search}
                id="filter-search"
                name="search"
                placeholder="Search titles or descriptions"
                type="search"
              />
            </div>
            <div className={styles.filterField}>
              <label htmlFor="filter-location">Location</label>
              <input
                defaultValue={filters.location}
                id="filter-location"
                name="location"
                placeholder="Chico, CA"
                type="text"
              />
            </div>

            <div className={styles.filterField}>
              <label htmlFor="filter-availability">Availability</label>
              <input
                defaultValue={filters.availability ?? ''}
                id="filter-availability"
                name="availability"
                min="1"
                placeholder="Any number of spots"
                step="1"
                type="number"
              />
            </div>

            <div className={styles.filterField}>
              <label htmlFor="filter-sort">Sort posts by</label>
              <select
                defaultValue={filters.sortOrder}
                id="filter-sort"
                name="sortOrder"
              >
                <option value="newest">Most recent</option>
                <option value="oldest">Oldest</option>
                <option value="earliest-event">Earliest event</option>
                <option value="latest-event">Latest event</option>
              </select>
            </div>

            <fieldset className={styles.filterFieldset}>
              <legend>Difficulty</legend>
              <label>
                <input
                  defaultChecked={filters.difficulty.includes('EASY')}
                  name="difficulty"
                  type="checkbox"
                  value="EASY"
                />
                Easy
              </label>
              <label>
                <input
                  defaultChecked={filters.difficulty.includes('MEDIUM')}
                  name="difficulty"
                  type="checkbox"
                  value="MEDIUM"
                />
                Medium
              </label>
              <label>
                <input
                  defaultChecked={filters.difficulty.includes('NORMAL')}
                  name="difficulty"
                  type="checkbox"
                  value="NORMAL"
                />
                Normal
              </label>
              <label>
                <input
                  defaultChecked={filters.difficulty.includes('HARD')}
                  name="difficulty"
                  type="checkbox"
                  value="HARD"
                />
                Hard
              </label>
              <label>
                <input
                  defaultChecked={filters.difficulty.includes('EXTRA_HARD')}
                  name="difficulty"
                  type="checkbox"
                  value="EXTRA_HARD"
                />
                Extra hard
              </label>
            </fieldset>
          </div>

          <div className={styles.filterActions}>
            <button
              className={styles.clearButton}
              onClick={() => {
                formRef.current?.reset()
                onApplyFilters(defaultPostFilters)
                setIsOpen(false)
              }}
              type="button"
            >
              Clear all
            </button>
            <button className={styles.applyButton} type="submit">
              Apply filters
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
