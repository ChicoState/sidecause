# Sidecause v1 Product Specification

## Objective

Sidecause is a community-service bounty board. Anyone can browse open
opportunities. Signed-in members can post an opportunity, join one, and manage
the resulting volunteer work. Full and finished opportunities are visible to
their poster and active attendees.

The first release is deliberately small: a bounty is an unpaid, scheduled
opportunity for a bounded group of volunteers. It must make it easy to
discover a project, join it while places remain, and show that it was
finished.

## Users and access

| User             | Can do                                                                                                                                             |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Visitor          | Browse `OPEN` bounties.                                                                                                                            |
| Signed-in member | All visitor actions plus create, join, and withdraw from bounties. A member with active attendance can view that bounty when `FULL` or `FINISHED`. |
| Bounty poster    | All member actions plus finish, cancel, and optionally verify their bounties. A poster can view their own bounty when `FULL` or `FINISHED`.        |

Authentication uses an email address, password, and public display name. Email
verification, password recovery, social sign-in, and moderation are out of
scope for v1. A user who loses their password cannot recover the account in
v1.

## Bounty lifecycle

```text
OPEN --join until full--> FULL
 ^                       |
 |-------withdraw--------|

OPEN or FULL --poster finishes--> FINISHED

OPEN or FULL --cancel--> CANCELLED
OPEN or FULL --deadline passes--> EXPIRED
```

- A member may join an `OPEN` bounty immediately while its attendance count is
  below `maxVolunteers`; the join changes it to `FULL` when the count reaches
  that limit.
- A joined member may withdraw. Withdrawing from a `FULL` bounty returns it to
  `OPEN`.
- A member may sign up for a bounty only once. After withdrawing, they cannot
  sign up for that bounty again.
- Only the poster may finish a bounty. Finishing requires no note, photograph,
  or attendee approval.
- A poster may optionally verify a finished bounty. Verification is separate
  from its status and never blocks finishing.
- A poster may cancel an `OPEN` or `FULL` bounty, optionally supplying a
  cancellation reason.
- Published bounties cannot otherwise be edited.
- Public listings expose `OPEN` bounties. `FULL` and `FINISHED` detail pages
  are visible only to the poster and members with active attendance on that
  bounty. `CANCELLED` and `EXPIRED` bounties are never visible.
- Expiry is determined server-side from the deadline. An expired bounty cannot
  be joined.

## Bounty data

Each bounty has:

- A required title and description.
- A required human-readable location label, such as a neighbourhood or a
  specific address.
- An optional picture reference. Store the image file in object storage and
  keep its storage key or URL on the bounty.
- Optional precise latitude and longitude, supplied together when the location
  is specific enough for a map point.
- A required scheduled date and time, plus a required deadline for joining. A
  bounty expires after its deadline; its scheduled time is task information,
  not an automatic lifecycle transition.
- A required positive maximum volunteer count.
- A non-negative monetary amount paid per volunteer, stored with two decimal
  places.
- Zero or more named skill requirements and equipment requirements, each
  marked `REQUIRED` or `RECOMMENDED`.
- The poster, zero or more attending volunteers, status, creation time, finish
  time, optional verification time, and optional cancellation reason.

Display names are public where a poster or attendee is shown. The poster's
account email is available only to the poster and authenticated volunteers
with active attendance on that bounty; withdrawing immediately revokes access.
Email addresses, password hashes, and
authentication/session data are never included in public responses.

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
(such as simultaneous attempts to take the final place) `409`. Internal errors never reveal
implementation details.

| Operation                                | Contract                                                                                                                                                                                                 |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/bounties`                      | Public, paginated list of `OPEN` bounties. Supports `page`, `pageSize`, and location filtering defined during implementation. Returns `{ data, pagination }`.                                            |
| `POST /api/bounties`                     | Authenticated creation. Accepts title, description, location, optional coordinates, schedule and deadline, maximum capacity, per-volunteer pay, and requirements. Returns the created bounty with `201`. |
| `GET /api/bounties/:id`                  | Public for `OPEN`; for `FULL` or `FINISHED`, poster and active attendees only. Hidden or unauthorized resources return `404`. Public responses never contain poster contact information.                 |
| `GET /api/bounties/:id/poster-contact`   | Poster or authenticated active attendee only. Returns the poster's permitted contact information.                                                                                                        |
| `POST /api/bounties/:id/volunteers`      | Authenticated. Atomically joins an open, unexpired bounty when capacity remains.                                                                                                                         |
| `DELETE /api/bounties/:id/volunteers/me` | Joined volunteer only. Withdraws and returns a full bounty to `OPEN`.                                                                                                                                    |
| `POST /api/bounties/:id/completion`      | Poster only. Marks the bounty `FINISHED`.                                                                                                                                                                |
| `POST /api/bounties/:id/verification`    | Poster only. Marks a finished bounty verified.                                                                                                                                                           |
| `POST /api/bounties/:id/cancellation`    | Poster only. Cancels an open or full bounty; body may include `reason`.                                                                                                                                  |

Inputs are validated at route-handler boundaries. Internal services receive
trusted, typed inputs. State-changing operations must be transactional so
concurrent joins cannot exceed `maxVolunteers`.

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

- A visitor can view a paginated list and detail pages for open bounties.
- A poster or active attendee can view a full or finished bounty's detail page.
- A member can register, sign in, create a bounty, and join one open bounty
  while capacity remains.
- A joined volunteer can withdraw; concurrent joins never exceed a bounty's
  maximum volunteer count.
- A poster can finish or cancel their own open or full bounty and optionally
  verify a finished one.
- All invalid or unauthorized requests follow the documented error contract.

## Explicitly deferred

- Payments and experience-point rewards.
- Bounty editing, proof uploads, comments, reporting, and moderation.
- Email verification, password recovery, social sign-in, and organization
  accounts.
