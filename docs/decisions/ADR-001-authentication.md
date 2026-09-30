# ADR-001: Use Auth.js credentials with Prisma-backed local accounts

## Status

Accepted

## Date

2026-09-28

## Context

Sidecause needs authenticated members to post, claim, finish, verify, and
cancel bounties. The application is a new Next.js 16 App Router project with
Prisma and PostgreSQL already selected for application data. The v1 product
scope requires email-and-password accounts, a public display name, no social
sign-in, no email verification, and no password recovery.

## Decision

Use Auth.js with a credentials-based sign-in flow and Prisma/PostgreSQL-backed
local user records. Store only a secure password hash; never expose the hash or
email address in public bounty responses. Server-side authorization uses the
authenticated local user ID.

## Alternatives considered

### Clerk

Clerk has first-class Next.js support and a quick setup, but it adds a
vendor-managed identity layer and provider keys to a project that already owns
its relational data model. It is not needed for the intentionally small v1
credentials flow.

### Supabase Auth

Supabase Auth integrates with Next.js, but adopting it would introduce a
separate hosted auth/PostgreSQL ecosystem alongside the project’s existing
Prisma-managed PostgreSQL direction.

### Social sign-in

Social sign-in reduces password management but is explicitly out of scope for
v1.

## Consequences

- The project owns its user identity relationships and authorization model.
- Credential validation, secure password hashing, session handling, and
  rate-limiting are implementation responsibilities.
- No email provider is required for v1, but users cannot verify email addresses
  or recover forgotten passwords.
- Adding password recovery or email verification later requires an email
  provider and a reviewed security design.

## Sources

- https://authjs.dev/
- https://authjs.dev/reference/core/errors#missingsecret
- https://clerk.com/docs/nextjs/getting-started/quickstart
- https://supabase.com/docs/guides/auth/quickstarts/nextjs
