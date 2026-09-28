# Sidecause v1 Implementation Plan

## Overview

Implement Sidecause in small, testable vertical slices. The product contract in
[`product-spec.md`](product-spec.md) is the source of truth. Each schema and
API task must preserve the documented public/hidden status boundary and the
single-volunteer claim invariant.

## Architecture decisions

- Use the Next.js App Router; do not create parallel Pages Router features.
- Use Auth.js with email-and-password credentials and Prisma/PostgreSQL-backed
  user records. Passwords are stored only as secure hashes.
- Expose REST-style route handlers with a single structured error shape.
- Use transactions or an equivalent guarded conditional update for claims.

## Task list

### Phase 1: Application and account foundation

#### Task 1: Create the App Router shell

**Acceptance criteria:**

- [ ] The app has a root layout, public landing page, and global styles.
- [ ] `npm run dev`, linting, formatting, and type checking work.
- [ ] `pages/` has no application implementation.

**Verify:** `npm run verify`; manually load the landing page.

**Dependencies:** None.

**Likely files:** `app/layout.tsx`, `app/page.tsx`, `app/globals.css`.

#### Task 2: Add registration and session authentication

**Acceptance criteria:**

- [ ] A member can register with display name, unique email, and password.
- [ ] Passwords are securely hashed and never returned by application APIs.
- [ ] A member can sign in and sign out; visitors cannot perform mutations.

**Verify:** Unit tests for credential validation and hashing; browser test for
registration and sign-in.

**Dependencies:** Task 1; approval of the authentication dependency and first
Prisma migration.

**Likely files:** `auth.ts`, `app/api/auth/[...nextauth]/route.ts`,
`proxy.ts`, `prisma/schema.prisma`, authentication pages and tests.

### Checkpoint: accounts

- [ ] A public page is accessible without a session.
- [ ] Protected mutation attempts return the documented `401` error.
- [ ] The migration is reviewed and no secrets are committed.

### Phase 2: Publish and browse bounties

#### Task 3: Define and migrate the bounty domain

**Acceptance criteria:**

- [ ] The schema represents locations, deadlines, lifecycle status, poster,
      optional claimant, completion, verification, and cancellation reason.
- [ ] The schema makes a single claimant unambiguous and supports future
      additive volunteer capacity.
- [ ] A migration is reviewed and applies to local PostgreSQL.

**Verify:** `npm run prisma:validate`; run the reviewed development migration;
integration tests for persistence constraints.

**Dependencies:** Task 2 and explicit approval for the migration.

**Likely files:** `prisma/schema.prisma`, `prisma/migrations/*`, domain types,
integration tests.

#### Task 4: Create and list public bounties

**Acceptance criteria:**

- [ ] An authenticated member can create a valid open bounty.
- [ ] Visitors can browse a paginated list of `OPEN`, `CLAIMED`, and
      `FINISHED` bounties.
- [ ] Cancelled and expired bounties never appear in public list or detail
      responses.

**Verify:** Unit tests for input schemas and expiry calculation; integration
tests for API contracts; browser test for browse and create flows.

**Dependencies:** Task 3.

**Likely files:** bounty validation/domain service, route handlers, list/detail
pages and components, unit/integration/e2e tests.

### Checkpoint: publishing and discovery

- [ ] Public read paths work while signed out.
- [ ] Validation and authorization errors use the specified shape.
- [ ] `npm run verify` and relevant integration/browser tests pass.

### Phase 3: Claim and completion lifecycle

#### Task 5: Claim and withdraw safely

**Acceptance criteria:**

- [ ] Exactly one member can claim an open, unexpired bounty.
- [ ] A second or late claim returns `409` and does not modify ownership.
- [ ] The claimant can withdraw, returning the bounty to `OPEN`.

**Verify:** Concurrent integration test for claim attempts; browser test for
claim and withdrawal.

**Dependencies:** Task 4.

**Likely files:** claim service, claim route handlers, bounty detail UI, tests.

#### Task 6: Finish, verify, and cancel

**Acceptance criteria:**

- [ ] Only the claimant can finish a claimed bounty, without proof submission.
- [ ] Only the poster can optionally verify a finished bounty.
- [ ] Only the poster can cancel an open or claimed bounty with an optional
      reason.

**Verify:** Authorization and transition integration tests; browser test for
the full poster/claimant workflow.

**Dependencies:** Task 5.

**Likely files:** lifecycle service, route handlers, detail UI, tests.

### Checkpoint: v1 completion

- [ ] Each success criterion in the product spec passes via automated test or
      documented manual check.
- [ ] `npm run verify`, `npm run test:smoke`, and relevant application tests
      pass.
- [ ] Review the API contract, migration, and private-data exposure before
      release planning.

## Risks and mitigations

| Risk                                 | Impact                 | Mitigation                                                                                                 |
| ------------------------------------ | ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| Two members claim simultaneously     | High                   | Use a transaction/conditional status update and test concurrent requests.                                  |
| Unverified email plus no recovery    | High user-support cost | Make the limitation explicit in registration UI; revisit verification/recovery before public launch.       |
| Inappropriate or unsafe public posts | High                   | Moderation is intentionally deferred; do not launch broadly until a reporting/moderation decision is made. |
| Deadlines depend on client clocks    | Medium                 | Compare deadlines on the server and use one UTC timestamp representation.                                  |

## Approval gates

Before Task 2: approve the Auth.js credential implementation and its dependency
changes. Before Task 3: approve the User and Bounty Prisma migration. Before a
public launch: choose account recovery/verification and moderation policies.
