'use client'

import { useState } from 'react'

import { FilterPopover } from './FilterPopover'
import type { PostCardData } from './post-data'
import {
  defaultPostFilters,
  filterPosts,
  sortPosts,
  type PostSortOrder,
} from './post-filters'
import { PostsList } from './PostsList'
import styles from './posts.module.css'

type ActiveFilterKey =
  'search' | 'location' | 'availability' | 'difficulty' | 'sortOrder'

type PostsBrowserProps = {
  posts: PostCardData[]
}

export function PostsBrowser({ posts }: PostsBrowserProps) {
  const [filters, setFilters] = useState(defaultPostFilters)
  const visiblePosts = sortPosts(filterPosts(posts, filters), filters.sortOrder)
  const activeFilters: Array<{ key: ActiveFilterKey; label: string }> = []

  if (filters.search.trim()) {
    activeFilters.push({
      key: 'search',
      label: `Search: ${filters.search.trim()}`,
    })
  }
  if (filters.location.trim()) {
    activeFilters.push({
      key: 'location',
      label: `Location: ${filters.location.trim()}`,
    })
  }
  if (filters.availability !== null) {
    activeFilters.push({
      key: 'availability',
      label: `At least ${filters.availability} spots`,
    })
  }
  for (const difficulty of filters.difficulty) {
    activeFilters.push({
      key: 'difficulty',
      label: `Difficulty: ${formatDifficulty(difficulty)}`,
    })
  }
  if (filters.sortOrder !== defaultPostFilters.sortOrder) {
    activeFilters.push({
      key: 'sortOrder',
      label: `Sort: ${formatSortOrder(filters.sortOrder)}`,
    })
  }

  function removeFilter(key: ActiveFilterKey) {
    setFilters((current) => {
      if (key === 'search') return { ...current, search: '' }
      if (key === 'difficulty') return { ...current, difficulty: [] }
      if (key === 'location') return { ...current, location: '' }
      if (key === 'availability') return { ...current, availability: null }
      return { ...current, sortOrder: defaultPostFilters.sortOrder }
    })
  }

  return (
    <>
      <div className={styles.controls} aria-label="Post browsing controls">
        <FilterPopover filters={filters} onApplyFilters={setFilters} />
        <button disabled type="button">
          Chico, CA
        </button>
      </div>
      {activeFilters.length > 0 && (
        <div className={styles.activeFilters} aria-label="Active filters">
          {activeFilters.map((filter) => (
            <button
              aria-label={filter.label}
              className={styles.filterChip}
              key={`${filter.key}-${filter.label}`}
              onClick={() => removeFilter(filter.key)}
              type="button"
            >
              {filter.label} ×
            </button>
          ))}
          <button
            className={styles.clearFiltersButton}
            onClick={() => setFilters(defaultPostFilters)}
            type="button"
          >
            Clear filters
          </button>
        </div>
      )}
      <div className={styles.listViewport}>
        <PostsList posts={visiblePosts} />
      </div>
    </>
  )
}

function formatDifficulty(difficulty: PostCardData['difficulty']) {
  return difficulty
    .toLowerCase()
    .replace('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatSortOrder(sortOrder: PostSortOrder) {
  return {
    newest: 'Most recent',
    oldest: 'Oldest',
    'earliest-event': 'Earliest event',
    'latest-event': 'Latest event',
  }[sortOrder]
}
