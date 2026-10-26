# Post Listing Data Contract

The Posts page reads through a server-side `PostListingSource` in
[`app/posts/post-data.ts`](../app/posts/post-data.ts). Its default source queries
the Prisma `Bounty` table and returns open bounties whose signup deadline has
not passed and whose capacity is not full. The page remains independent of
Prisma and receives only card-safe fields.

## Listing fields

`listPublicPosts()` returns records with:

| Field               | Type                 | Purpose                                   |
| ------------------- | -------------------- | ----------------------------------------- |
| `id`                | string               | Stable post identifier                    |
| `title`             | string               | Card title                                |
| `location`          | string               | Human-readable task location              |
| `imageUrl`          | string or `null`     | Same-origin path or HTTPS URL             |
| `maximumVolunteers` | positive integer     | Capacity; used on the future details page |
| `currentVolunteers` | non-negative integer | Number of active signups                  |

The database query counts only `JOINED` volunteer attendances and omits a
record when that count reaches `maxVolunteers`. The public card data contains
only `id`, `title`, `location`, and `imageUrl`. A missing or invalid picture
reference uses the neutral image fallback.
Uploader contact details, signup identities, and other private fields must not
be returned from the listing source or exposed to the Posts page.

Picture files should be stored in object storage, with the database holding a
storage key or URL. The adapter should resolve storage keys to an HTTPS URL
before returning listing records. The current server boundary accepts only
same-origin paths or HTTPS URLs and falls back to a neutral image block for
missing or invalid values.

## Future details page fields

The collaborator's schema should also support the later details page with:

- Event date and time.
- Description summary.
- Pay per volunteer.
- Required skills and equipment.
- Maximum volunteer capacity.
- Volunteer signups and their public display names.
- Uploader public display name and private contact information.

Signing up is immediate. A volunteer who has signed up may see the uploader's
contact information; visitors and members who have not signed up may not. Keep
that authorization check in the server-side details read path when it is built.
The Posts listing itself has no signup action or details navigation yet.
