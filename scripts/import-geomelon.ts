import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { Pool } from 'pg'
import 'dotenv/config'

import {
  toLocationRows,
  type GeomelonDataset,
  type LocationImportRow,
} from '../lib/geomelon.ts'

const defaultDataPath = path.resolve(process.cwd(), 'data/geomelon/data.json')
const dataPath = process.argv[2] ?? defaultDataPath
const batchSize = 500

function createPlaceholders(rowCount: number): string {
  return Array.from({ length: rowCount }, (_, rowIndex) => {
    const firstParameter = rowIndex * 5 + 1
    return `(${Array.from(
      { length: 5 },
      (_, parameterIndex) => `$${firstParameter + parameterIndex}`,
    ).join(', ')})`
  }).join(', ')
}

function getValues(rows: LocationImportRow[]): unknown[] {
  return rows.flatMap((row) => [
    row.id,
    row.kind,
    row.name,
    row.normalizedName,
    row.regionName,
  ])
}

async function importLocations() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is required.')
  }

  const dataset = JSON.parse(
    await readFile(dataPath, 'utf8'),
  ) as GeomelonDataset
  const rows = toLocationRows(dataset)
  const pool = new Pool({ connectionString })
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    for (let offset = 0; offset < rows.length; offset += batchSize) {
      const batch = rows.slice(offset, offset + batchSize)
      await client.query(
        `INSERT INTO "Location" (
          "id", "kind", "name", "normalizedName", "regionName"
        ) VALUES ${createPlaceholders(batch.length)}
        ON CONFLICT ("id") DO UPDATE SET
          "kind" = EXCLUDED."kind",
          "name" = EXCLUDED."name",
          "normalizedName" = EXCLUDED."normalizedName",
          "regionName" = EXCLUDED."regionName"`,
        getValues(batch),
      )
    }

    await client.query('COMMIT')
    console.log(`Imported ${rows.length} Geomelon locations from ${dataPath}.`)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

importLocations().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
