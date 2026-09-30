# Sidecause v1 Product Specification

## Objective

Sidecause is a public community-service bounty board. Anyone can browse active
or completed opportunities. Signed-in members can post an opportunity, claim
one, and manage the resulting volunteer work.

The first release is deliberately small: a bounty is a single-volunteer,
unpaid opportunity. It must make it easy to discover a project, commit to it,
and show that it was finished.

## Users and access

| User             | Can do                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------- |
| Visitor          | Browse `OPEN`, `CLAIMED`, and `FINISHED` bounties.                                       |
| Signed-in member | All visitor actions plus create, claim, withdraw from, and finish bounties.              |
| Bounty poster    | All member actions plus cancel and optionally verify completion of bounties they posted. |

Authentication uses an email address, password, and public display name. Email
verification, password recovery, social sign-in, and moderation are out of
scope for v1. A user who loses their password cannot recover the account in
v1.

## Bounty lifecycle

```text
OPEN --claim--> CLAIMED --finish--> FINISHED
  ^                 |
  |---withdraw------|

OPEN or CLAIMED --cancel--> CANCELLED
OPEN --deadline passes--> EXPIRED
```

- Only one member may claim an `OPEN` bounty.
- Finishing is immediate and requires no note, photograph, or poster approval.
- A poster may optionally verify a finished bounty. Verification is separate
  from its status and never blocks finishing.
- A poster may cancel an `OPEN` or `CLAIMED` bounty, optionally supplying a
  cancellation reason.
- Published bounties cannot otherwise be edited.
- Public listings and public detail pages expose only `OPEN`, `CLAIMED`, and
  `FINISHED` bounties. `CANCELLED` and `EXPIRED` bounties are not public.
- Expiry is determined server-side from the deadline. An expired bounty cannot
  be claimed.

## Bounty data

Each bounty has:

- A required title and description.
- A required human-readable location label, such as a neighbourhood or a
  specific address.
- Optional precise latitude and longitude, supplied together when the location
  is specific enough for a map point.
- A required deadline. A bounty expires after it.
- The poster, optional claimant, status, creation time, finish time, optional
  verification time, and optional cancellation reason.

Display names are public where a poster or claimant is shown. Email addresses,
password hashes, and authentication/session data are never public.

## Application boundary and API contract

Use the Next.js App Router only; `pages/` remains unused. Public reads remain
available without a session. Every mutation requires an authenticated session
and performs authorization on the server.

All API errors use this response shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "A deadline is required.",
    "details": {}
  }
}
```

Validation failures return `422`; unauthenticated requests `401`; unauthorized
requests `403`; missing or non-public resources `404`; and lifecycle conflicts
(such as a second simultaneous claim) `409`. Internal errors never reveal
implementation details.

| Operation                             | Contract                                                                                                                                                                |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/bounties`                   | Public, paginated list of public statuses. Supports `page`, `pageSize`, `status`, and location filtering defined during implementation. Returns `{ data, pagination }`. |
| `POST /api/bounties`                  | Authenticated creation. Accepts title, description, location, optional coordinates, and deadline. Returns the created bounty with `201`.                                |
| `GET /api/bounties/:id`               | Public only for a public-status bounty; otherwise returns `404`.                                                                                                        |
| `POST /api/bounties/:id/claims`       | Authenticated. Atomically claims an open, unexpired bounty for the current user.                                                                                        |
| `DELETE /api/bounties/:id/claims/me`  | Claimant only. Releases the claim and returns the bounty to `OPEN`.                                                                                                     |
| `POST /api/bounties/:id/completion`   | Claimant only. Marks the bounty `FINISHED`.                                                                                                                             |
| `POST /api/bounties/:id/verification` | Poster only. Marks a finished bounty verified.                                                                                                                          |
| `POST /api/bounties/:id/cancellation` | Poster only. Cancels an open or claimed bounty; body may include `reason`.                                                                                              |

Inputs are validated at route-handler boundaries. Internal services receive
trusted, typed inputs. State-changing operations must be transactional so two
users cannot both claim the same bounty.

## Commands

```sh
npm ci
npm run docker:up
npm run dev
npm run verify
npm run test:smoke
```

Once application tests exist, use `npm run test:integration` and `npm run
test:e2e` for relevant changes. Do not add placeholder tests merely to make
those commands pass.

## Project structure

```text
app/                 App Router pages, layouts, and route handlers
prisma/              Prisma schema and reviewed migrations
tests/unit/          Pure domain and validation tests
tests/integration/   PostgreSQL-backed route and persistence tests
tests/e2e/           Browser tests for public browsing and member workflows
docs/                Product specification, decisions, and implementation plans
```

## Boundaries

- Always: validate external input at API boundaries, enforce authorization on
  the server, run relevant tests, and keep user data account-scoped.
- Ask first: add dependencies, create or modify Prisma migrations, change
  authentication providers, alter API contracts, or enable payments, XP,
  uploads, moderation, email verification, or recovery.
- Never: expose private user data, trust client-supplied ownership or status,
  commit credentials, or make cancelled/expired bounties public.

## Success criteria

- A visitor can view a paginated public list and public detail pages for open,
  claimed, and finished bounties.
- A member can register, sign in, create a bounty, and claim one open bounty.
- A claimant can withdraw or finish their own claim; concurrent claims do not
  assign two volunteers.
- A poster can cancel their own open or claimed bounty and optionally verify a
  finished one.
- All invalid or unauthorized requests follow the documented error contract.

## Explicitly deferred

- Payments and experience-point rewards.
- Multiple volunteers per bounty. A future additive `volunteerCapacity` field
  may extend the one-volunteer model.
- Bounty editing, proof uploads, comments, reporting, and moderation.
- Email verification, password recovery, social sign-in, and organization
  accounts.
