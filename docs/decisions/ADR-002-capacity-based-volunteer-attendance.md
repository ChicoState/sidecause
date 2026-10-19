# ADR-002: Model bounty attendance as capacity-based volunteer records

## Status

Accepted

## Date

2026-10-14

## Context

Sidecause originally modeled a bounty as a single-member claim. The posts
experience now requires a scheduled task with a minimum and maximum number of
volunteers, a list of attendees, and required or recommended skills and
equipment. The poster's contact information must be available to volunteers
who have joined the post, but never to visitors or other signed-in members.

## Decision

Store attendance in a relation between a bounty and a user, rather than a
single claimant field or a list encoded in the bounty record. Enforce a unique
member-and-bounty attendance record and guard joins transactionally against
`maxVolunteers`.

Each bounty stores one scheduled timestamp and retains its separate joining
deadline. It has a positive `maxVolunteers` value and a non-negative
`payPerVolunteer` amount. Skills and equipment are separate child
relations, with each requirement marked `REQUIRED` or `RECOMMENDED`.

A bounty is `OPEN` while a place remains and `FULL` when its maximum attendance
is reached. A joined volunteer can withdraw; this returns a full bounty to
open and revokes contact access. Only the poster can complete the task. The
poster’s display name and account email are projected only to authenticated
volunteers with active attendance on that bounty.

## Alternatives considered

### Keep one claimant and add a capacity field

This would leave no relational record for the other attendees and could not
reliably enforce or query per-user attendance.

### Store attendee identifiers in an array on the bounty

This weakens relational integrity, makes member deletion and joins harder to
reason about, and complicates the unique-attendance constraint.

### Make poster contact public

Public email disclosure conflicts with the privacy boundary in the product
contract and exposes posters to unsolicited contact.

## Consequences

- The Bounty schema and lifecycle API contract require a reviewed migration.
- Join and withdrawal operations require transactional capacity handling.
- Public, member, and attendee response projections must be tested separately.
- The new `FULL` state is public; cancelled and expired bounties remain hidden.
