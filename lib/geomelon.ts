export type GeomelonRegion = {
  id: string
  name: string
  code?: string | null
  latitude?: number | null
  longitude?: number | null
  population?: number | null
}

export type GeomelonCity = {
  id: string
  name: string
  regionId?: string | null
  latitude?: number | null
  longitude?: number | null
  population?: number | null
}

export type GeomelonDataset = {
  meta: {
    country?: string
    isoCode?: string
  }
  regions: GeomelonRegion[]
  cities: GeomelonCity[]
}

export type LocationImportRow = {
  id: string
  kind: 'CITY' | 'REGION'
  name: string
  normalizedName: string
  regionName: string | null
}

export function normalizeLocationName(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('en-US')
    .replace(/\s+/g, ' ')
}

export function formatLocationLabel(location: {
  kind: 'CITY' | 'REGION'
  name: string
  regionName: string | null
}): string {
  return location.kind === 'CITY' && location.regionName
    ? `${location.name}, ${location.regionName}`
    : location.name
}

export function toLocationRows(dataset: GeomelonDataset): LocationImportRow[] {
  if (
    dataset.meta.country !== 'United States' ||
    dataset.meta.isoCode !== 'US'
  ) {
    throw new Error('Geomelon dataset must be the United States dataset.')
  }

  const regions = new Map(dataset.regions.map((region) => [region.id, region]))

  const regionRows = dataset.regions.map((region): LocationImportRow => ({
    id: region.id,
    kind: 'REGION',
    name: region.name,
    normalizedName: normalizeLocationName(region.name),
    regionName: null,
  }))

  const cityRows = dataset.cities.map((city): LocationImportRow => {
    const region = city.regionId ? regions.get(city.regionId) : undefined

    return {
      id: city.id,
      kind: 'CITY',
      name: city.name,
      normalizedName: normalizeLocationName(city.name),
      regionName: region?.name ?? null,
    }
  })

  return [...regionRows, ...cityRows]
}
