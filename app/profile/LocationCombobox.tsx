'use client'

import { useEffect, useId, useState } from 'react'

import styles from './profile.module.css'

type LocationOption = {
  id: string
  kind: 'CITY' | 'REGION'
  name: string
  regionName: string | null
}

function labelFor(location: LocationOption) {
  return location.kind === 'CITY' && location.regionName
    ? `${location.name}, ${location.regionName}`
    : location.name
}

export default function LocationCombobox({
  initialLocation,
  initialLocationId,
}: {
  initialLocation: string
  initialLocationId: string
}) {
  const listId = useId()
  const [query, setQuery] = useState(initialLocation)
  const [locationId, setLocationId] = useState(initialLocationId)
  const [locations, setLocations] = useState<LocationOption[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    const normalized = query.trim()
    if (normalized.length < 2 || locationId) {
      return
    }

    const controller = new AbortController()
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/locations?q=${encodeURIComponent(normalized)}`,
          { signal: controller.signal },
        )
        if (!response.ok) throw new Error('Search failed')
        const data: { locations: LocationOption[] } = await response.json()
        setLocations(data.locations)
        setError('')
      } catch (searchError) {
        if ((searchError as Error).name !== 'AbortError') {
          setLocations([])
          setError('Location search is unavailable. Please try again.')
        }
      }
    }, 200)

    return () => {
      controller.abort()
      window.clearTimeout(timeout)
    }
  }, [locationId, query])

  return (
    <div className={styles.locationCombobox}>
      <input name="locationId" type="hidden" value={locationId} />
      <input
        aria-autocomplete="list"
        aria-controls={locations.length ? listId : undefined}
        aria-expanded={locations.length > 0}
        autoComplete="off"
        id="profile-location"
        name="location"
        onChange={(event) => {
          setQuery(event.target.value)
          setLocationId('')
          setLocations([])
          setError('')
        }}
        placeholder="Search city or region"
        role="combobox"
        type="search"
        value={query}
      />
      {locations.length > 0 && (
        <ul className={styles.locationResults} id={listId} role="listbox">
          {locations.map((location) => (
            <li aria-selected={false} key={location.id} role="option">
              <button
                onClick={() => {
                  setQuery(labelFor(location))
                  setLocationId(location.id)
                  setLocations([])
                }}
                type="button"
              >
                {labelFor(location)}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p role="alert">{error}</p>}
    </div>
  )
}
