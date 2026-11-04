import { randomUUID } from 'node:crypto'

import { Client } from 'pg'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const databaseUrl = process.env.DATABASE_URL
const client = databaseUrl
  ? new Client({ connectionString: databaseUrl })
  : null

beforeAll(async () => {
  if (!client) {
    throw new Error(
      'DATABASE_URL is required for bounty schema integration tests.',
    )
  }

  await client.connect()
})

afterAll(async () => {
  await client?.end()
})

describe('bounty schema', () => {
  it('stores scheduling, capacity, pay, attendance, and requirements relationally', async () => {
    if (!client) {
      throw new Error(
        'DATABASE_URL is required for bounty schema integration tests.',
      )
    }

    const tables = await client.query<{ table_name: string }>(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'public'
         AND table_name IN (
           'Bounty',
           'BountyVolunteer',
           'BountySkillRequirement',
           'BountyEquipmentRequirement'
         )
       ORDER BY table_name`,
    )

    expect(tables.rows.map((row) => row.table_name)).toEqual([
      'Bounty',
      'BountyEquipmentRequirement',
      'BountySkillRequirement',
      'BountyVolunteer',
    ])

    const constraints = await client.query<{ conname: string }>(
      `SELECT conname
       FROM pg_constraint
       WHERE conname IN (
         'Bounty_pay_per_volunteer_non_negative',
         'Bounty_coordinates_paired',
         'BountyVolunteer_withdrawal_status'
       )
       ORDER BY conname`,
    )

    expect(constraints.rows.map((row) => row.conname)).toEqual([
      'BountyVolunteer_withdrawal_status',
      'Bounty_coordinates_paired',
      'Bounty_pay_per_volunteer_non_negative',
    ])
  })

  it('rejects invalid pay, coordinate, and withdrawal states', async () => {
    if (!client) {
      throw new Error(
        'DATABASE_URL is required for bounty schema integration tests.',
      )
    }

    const posterId = `schema-test-${randomUUID()}`
    const bountyId = `schema-test-${randomUUID()}`

    await client.query('BEGIN')

    try {
      await client.query(
        `INSERT INTO "User" ("id", "email", "displayName", "passwordHash", "updatedAt")
         VALUES ($1, $2, 'Schema Test Poster', 'not-a-real-password-hash', CURRENT_TIMESTAMP)`,
        [posterId, `${posterId}@example.test`],
      )

      await client.query('SAVEPOINT invalid_pay')

      await expect(
        client.query(
          `INSERT INTO "Bounty" (
            "id", "title", "description", "locationLabel", "scheduledAt",
            "deadline", "maxVolunteers", "payPerVolunteer", "difficulty", "posterId", "updatedAt"
          ) VALUES (
            $1, 'Invalid capacity', 'Test record', 'Test location', CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP, 1, -1.00, 'NORMAL', $2, CURRENT_TIMESTAMP
          )`,
          [`invalid-pay-${randomUUID()}`, posterId],
        ),
      ).rejects.toMatchObject({
        code: '23514',
        constraint: 'Bounty_pay_per_volunteer_non_negative',
      })

      await client.query('ROLLBACK TO SAVEPOINT invalid_pay')

      await client.query('SAVEPOINT invalid_coordinates')

      await expect(
        client.query(
          `INSERT INTO "Bounty" (
            "id", "title", "description", "locationLabel", "latitude", "scheduledAt",
            "deadline", "maxVolunteers", "payPerVolunteer", "difficulty", "posterId", "updatedAt"
          ) VALUES (
            $1, 'Invalid coordinates', 'Test record', 'Test location', 39.7285,
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2, 0.00, 'NORMAL', $2, CURRENT_TIMESTAMP
          )`,
          [`invalid-coordinates-${randomUUID()}`, posterId],
        ),
      ).rejects.toMatchObject({
        code: '23514',
        constraint: 'Bounty_coordinates_paired',
      })

      await client.query('ROLLBACK TO SAVEPOINT invalid_coordinates')

      await client.query(
        `INSERT INTO "Bounty" (
          "id", "title", "description", "locationLabel", "scheduledAt",
            "deadline", "maxVolunteers", "payPerVolunteer", "difficulty", "posterId", "updatedAt"
        ) VALUES (
          $1, 'Valid task', 'Test record', 'Test location', CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP, 2, 0.00, 'NORMAL', $2, CURRENT_TIMESTAMP
        )`,
        [bountyId, posterId],
      )

      await client.query('SAVEPOINT invalid_withdrawal')

      await expect(
        client.query(
          `INSERT INTO "BountyVolunteer" (
            "bountyId", "volunteerId", "status", "withdrawnAt"
          ) VALUES ($1, $2, 'WITHDRAWN', NULL)`,
          [bountyId, posterId],
        ),
      ).rejects.toMatchObject({
        code: '23514',
        constraint: 'BountyVolunteer_withdrawal_status',
      })

      await client.query('ROLLBACK TO SAVEPOINT invalid_withdrawal')
    } finally {
      await client.query('ROLLBACK')
    }
  })
})
