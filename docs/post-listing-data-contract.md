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

## Details page fields and access

The detail route reads these additional fields from the server:

- Event date and time.
- Description summary.
- Pay per volunteer.
- Required skills and equipment.
- Maximum volunteer capacity.
- Current volunteer count and the viewer's own attendance state.
- Poster display name and, only for the poster or an active attendee, poster
  email.

`OPEN` details are public. `FULL` and `FINISHED` details are visible only to the
poster or an active attendee; cancelled and expired records remain hidden. The
Posts listing remains limited to available `OPEN` bounties, so discovery for
full and finished posts is future work. Signup and unenroll controls on the
detail page are visual placeholders; no mutation is performed yet.
