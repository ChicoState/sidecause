# ADR-002: Store XP and derive member levels

## Status

Accepted

## Date

2026-11-02

## Context

Sidecause needs to show member progression and award experience from trusted
server-side events. XP must not be writable from the browser, and concurrent
awards must not overwrite one another.

## Decision

Store a non-negative lifetime `xp` integer on `User`. Derive the displayed
level as `floor(xp / 100) + 1`, so members start at level 1 and reach the next
level every 100 XP. The `addXpToUser` service validates positive safe integer
awards and uses Prisma's atomic increment operation. Event-specific reward
amounts remain in the server-side callers that authorize those events.

## Alternatives considered

### Store XP and level independently

Rejected because duplicated state can drift when awards happen concurrently.

### Accept XP awards through a public profile endpoint

Rejected because a client-controlled award endpoint would let members grant
themselves arbitrary XP.

## Consequences

- XP totals are durable and safe for concurrent increments.
- Level rules can change in application code without a data migration.
- Existing users begin at level 1 with 0 XP through the migration default.
- Future bounty lifecycle work must call the server-side service when reward
  amounts are approved.
