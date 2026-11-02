import 'dotenv/config'

import { randomUUID } from 'node:crypto'
import { Pool } from 'pg'

import { hashPassword } from '../lib/auth/password.ts'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required.')
}

const databaseHost = new URL(databaseUrl).hostname
const localDatabaseHosts = new Set([
  'localhost',
  '127.0.0.1',
  '[::1]',
  'postgres',
])

if (!localDatabaseHosts.has(databaseHost)) {
  throw new Error('Example bounties can only be seeded into a local database.')
}

const pool = new Pool({ connectionString: databaseUrl })
const examples = [
  {
    id: 'example-cedar-grove-cleanup',
    title: 'Clean up Cedar Grove',
    description: 'Pick up litter and tidy the paths around Cedar Grove.',
    locationLabel: 'Cedar Grove, Chico, CA',
    imageUrl: '/posts/cedar-grove-cleanup.svg',
    daysUntilScheduled: 7,
    maxVolunteers: 8,
    difficulty: 'EASY',
  },
  {
    id: 'example-food-pantry-sorting',
    title: 'Sort food pantry donations',
    description: 'Organize donated food and prepare boxes for local families.',
    locationLabel: 'Downtown Chico, CA',
    imageUrl: '/posts/food-pantry-sorting.svg',
    daysUntilScheduled: 14,
    maxVolunteers: 6,
    difficulty: 'NORMAL',
  },
  {
    id: 'example-community-garden',
    title: 'Water the community garden',
    description: 'Help water and care for the shared neighborhood garden.',
    locationLabel: 'South Chico, CA',
    imageUrl: '/posts/community-garden.svg',
    daysUntilScheduled: 21,
    maxVolunteers: 5,
    difficulty: 'HARD',
  },
]

function scheduledDate(daysFromNow) {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + daysFromNow)
  date.setUTCHours(17, 0, 0, 0)
  return date
}

const client = await pool.connect()

try {
  await client.query('BEGIN')

  const existingPoster = await client.query(
    'SELECT "id" FROM "User" WHERE "email" = $1',
    ['examples@sidecause.local'],
  )
  let posterId = existingPoster.rows[0]?.id

  if (!posterId) {
    // The demo poster is not login-enabled; its random password is discarded.
    const passwordHash = await hashPassword(randomUUID())
    const insertedPoster = await client.query(
      `INSERT INTO "User" (
         "id", "email", "displayName", "passwordHash", "createdAt", "updatedAt"
       ) VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT ("email") DO UPDATE
         SET "displayName" = EXCLUDED."displayName"
       RETURNING "id"`,
      [
        randomUUID(),
        'examples@sidecause.local',
        'SideCause Examples',
        passwordHash,
      ],
    )
    posterId = insertedPoster.rows[0].id
  }

  for (const example of examples) {
    const scheduledAt = scheduledDate(example.daysUntilScheduled)
    const deadline = new Date(scheduledAt.getTime() - 24 * 60 * 60 * 1000)

    await client.query(
      `INSERT INTO "Bounty" (
         "id", "title", "description", "locationLabel", "imageUrl",
         "scheduledAt", "deadline", "maxVolunteers", "payPerVolunteer",
         "difficulty", "status", "posterId", "createdAt", "updatedAt"
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, $9, 'OPEN', $10, NOW(), NOW())
       ON CONFLICT ("id") DO UPDATE SET
         "title" = EXCLUDED."title",
         "description" = EXCLUDED."description",
         "locationLabel" = EXCLUDED."locationLabel",
         "imageUrl" = EXCLUDED."imageUrl",
         "scheduledAt" = EXCLUDED."scheduledAt",
         "deadline" = EXCLUDED."deadline",
         "maxVolunteers" = EXCLUDED."maxVolunteers",
         "payPerVolunteer" = EXCLUDED."payPerVolunteer",
         "difficulty" = EXCLUDED."difficulty",
         "status" = EXCLUDED."status",
         "posterId" = EXCLUDED."posterId",
         "updatedAt" = NOW()`,
      [
        example.id,
        example.title,
        example.description,
        example.locationLabel,
        example.imageUrl,
        scheduledAt,
        deadline,
        example.maxVolunteers,
        example.difficulty,
        posterId,
      ],
    )
  }

  await client.query('COMMIT')
  process.stdout.write(`Seeded ${examples.length} example bounties.\n`)
} catch (error) {
  await client.query('ROLLBACK')
  throw error
} finally {
  client.release()
  await pool.end()
}
