import { describe, expect, it } from 'vitest'

import {
  normalizeLocationName,
  toLocationRows,
  type GeomelonDataset,
} from '../../lib/geomelon'

const dataset: GeomelonDataset = {
  meta: { country: 'United States', isoCode: 'US' },
  regions: [
    {
      id: 'region-ca',
      name: 'California',
      code: 'US-CA',
      latitude: 37.2,
      longitude: -119.7,
      population: 39000000,
    },
  ],
  cities: [
    {
      id: 'city-san-francisco',
      name: 'San Francisco',
      regionId: 'region-ca',
      latitude: 37.7749,
      longitude: -122.4194,
      population: 808437,
    },
  ],
}

describe('Geomelon location import mapping', () => {
  it('normalizes names for case-insensitive autocomplete', () => {
    expect(normalizeLocationName('  San   José  ')).toBe('san jose')
  })

  it('maps regions and cities to the database import shape', () => {
    expect(toLocationRows(dataset)).toEqual([
      {
        id: 'region-ca',
        kind: 'REGION',
        name: 'California',
        normalizedName: 'california',
        regionName: null,
      },
      {
        id: 'city-san-francisco',
        kind: 'CITY',
        name: 'San Francisco',
        normalizedName: 'san francisco',
        regionName: 'California',
      },
    ])
  })

  it('rejects datasets that are not the US dataset', () => {
    expect(() =>
      toLocationRows({
        ...dataset,
        meta: { country: 'Canada', isoCode: 'CA' },
      }),
    ).toThrow('United States')
  })
})
