# Agent Guidance

## Project status

`infrastructure_plan.md` is the approved source of truth for the technical foundation. The v1 product contract and its implementation sequence are in `docs/product-spec.md` and `docs/implementation-plan.md`. This repository provides local tooling, PostgreSQL/AIStor development services, Prisma migration setup, CI definitions, smoke testing, and the initial App Router shell.

## Repository map

- `app/`: Next.js App Router shell (`layout.tsx`, `page.tsx`, and global styles).
- `pages/`: unused; do not add Pages Router implementation.
- `prisma/`: Prisma configuration and future migrations; no product models or migrations exist.
- `tests/unit/`, `tests/integration/`, `tests/e2e/`: test locations; harness only.
- `scripts/smoke.sh`: infrastructure-only service readiness test.
- `Dockerfile`, `compose.yml`, `.dockerignore`: container infrastructure.
- `.github/workflows/`: `pr-checks.yml`, `codeql.yml`, and guarded `release.yml`.
- `README.md`, `infrastructure_plan.md`: developer documentation and technical plan.
- `.agents/skills/`: local skills and instructions.

## Required reading and boundaries

Before changing infrastructure, read `infrastructure_plan.md`, this file, and the applicable local skill instructions. Do not change plan decisions without using the planning skill to revise the plan. Do not commit `.env`, credentials, generated reports, build output, or local volumes.

Infrastructure work must not add routes, pages, UI components, API handlers, authentication, domain models, business migrations, fixtures, or production data. Application implementation begins only after the product requirements are confirmed.

## Skills to use

- Planning/specification: `infra-planner`, `planning-and-task-breakdown`, `spec-driven-development`.
- Infrastructure: `infra-builder`; CI/CD: `ci-cd-and-automation`.
- Application UI: `frontend-ui-engineering`; API boundaries: `api-and-interface-design`.
- Tests: `test-driven-development`; browser verification: `browser-testing-with-devtools` or `test-in-browser`.
- Security: `security-and-hardening`; documentation: `documentation-and-adrs`; review: `code-review-and-quality`.
- Git changes/commits: `git-workflow-and-versioning` and `git-commit` when a commit is requested.

## Local verification

Run the equivalent available CI checks before handing off a change:

```sh
npm ci
npm run verify
npm run test:smoke
```

`npm run build` now verifies the App Router shell. `npm run test:integration` and `npm run test:e2e` need future application tests and should not be made green with placeholders. CI currently omits those application-test commands for this reason.

## Docker lifecycle

Start local services with `npm run docker:up` and stop them with `npm run docker:down`. This retains named volumes. The smoke test uses a separate Compose project and removes its volumes automatically. Run `docker compose down --volumes` only when intentionally resetting local PostgreSQL and AIStor data. Start the profile-gated application container with `docker compose --profile app up --build`.

## Change checklist

1. Keep scope aligned with the plan and avoid product implementation during infrastructure work.
2. Update `.env.example`, README, and this file when commands, services, or prerequisites change.
3. Run relevant verification and record anything blocked by a manual prerequisite.
4. Inspect `git diff --check`, the final diff, and secret exposure before requesting review or committing.
