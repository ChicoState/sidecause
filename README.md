# Sidecause

## Status

This repository contains the development foundation for a public-facing Next.js application. Production application code, routes, authentication, database models, migrations, and browser workflows have **not** been created yet. The approved decisions are recorded in [infrastructure_plan.md](infrastructure_plan.md).

## Repository map

| Location                                          | Purpose                                                                         |
| ------------------------------------------------- | ------------------------------------------------------------------------------- |
| `app/`, `pages/`                                  | Planned Next.js UI and server features; not created yet.                        |
| `prisma/`                                         | Prisma connection and migration configuration; no product schema or migrations. |
| `tests/unit/`, `tests/integration/`, `tests/e2e/` | Planned test locations; currently empty harnesses.                              |
| `scripts/smoke.sh`                                | Isolated PostgreSQL and AIStor infrastructure smoke test.                       |
| `Dockerfile`, `compose.yml`                       | Development container and local PostgreSQL/AIStor services.                     |
| `.github/workflows/`                              | Pull-request quality/security checks, CodeQL, and guarded release workflow.     |
| `.agents/skills/`                                 | Repository-local operating guidance for agents.                                 |
| `AGENTS.md`                                       | Project-specific human/agent contribution guidance.                             |

## Getting Started

1. Install [Git](https://git-scm.com/downloads), [Node.js 26.8.2](https://nodejs.org/en/download), and [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine with the Compose plugin). Node 26 is the project’s active-LTS line; npm 11 is bundled with it.
2. Copy the local configuration template. It contains only safe local service credentials; replace `AUTH_SECRET` before authentication work begins.

   ```sh
   cp .env.example .env
   ```

3. Install exact locked dependencies.

   ```sh
   npm ci
   ```

4. Start local PostgreSQL on `5432` and AIStor on `9000` (console `9001`).

   ```sh
   npm run docker:up
   ```

5. Run the available local checks.

   ```sh
   npm run verify
   npm run test:smoke
   ```

6. Stop services when finished. `docker:down` preserves local volumes; use `docker compose down --volumes` only when you intentionally want to discard local database and object-storage data.

   ```sh
   npm run docker:down
   ```

`npm run dev`, `npm run build`, and `npm run test:e2e` are configured for the future Next.js application but cannot succeed until application code and browser tests exist. The `app` Compose profile is intentionally not started by default for the same reason.

## Database migrations

Prisma is configured for PostgreSQL and reads `DATABASE_URL` from `.env`. No product schema exists yet. Once a model is approved, create and review a development migration with:

```sh
npm run prisma:migrate -- --name describe_the_change
```

Use `npm run prisma:deploy` only in a controlled deployment workflow against an approved target—never against production from a workstation.

## CI and GitHub configuration

Pull requests run formatting, linting, TypeScript, the current Vitest coverage harness, Gitleaks, and CodeQL. The Next.js build, integration suite, and Playwright suite are deferred until application code exists. Configure branch protection to require those completed checks and a review.

Dependabot checks npm, Docker, and GitHub Actions dependencies weekly. Releases are intentionally blocked until a container registry and managed container host are selected. Before enabling release publishing/deployment, create a protected GitHub `production` environment and supply `CONTAINER_REGISTRY_TOKEN`, `CLOUD_DEPLOY_CREDENTIALS`, `DATABASE_URL`, `OBJECT_STORAGE_*`, and `AUTH_*` as environment-scoped secrets.

## Troubleshooting

- **`npm ci` rejects the lockfile:** use Node `26.8.2` and npm 11, then retry without editing `package-lock.json`.
- **A local port is occupied:** free or remap port `5432`, `9000`, or `9001` before starting Compose. Update `.env` if you remap a service used by application code.
- **Docker permission/daemon error:** start Docker Desktop (or the Docker daemon) and ensure your account can run `docker compose`.
- **Prisma reports `DATABASE_URL` missing:** copy `.env.example` to `.env`, then run the command from the repository root.

## Source references

The configuration follows the official [Next.js manual installation and linting guidance](https://nextjs.org/docs/app/getting-started/installation), [Next.js ESLint flat-config guidance](https://nextjs.org/docs/app/api-reference/config/eslint), [Prisma Migrate development/production workflow](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/development-and-production), [Vitest V8 coverage guide](https://vitest.dev/guide/coverage), and [Playwright installation guide](https://playwright.dev/docs/intro). AIStor is used locally because the current MinIO project advises it for maintained container security updates.
