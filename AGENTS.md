# Agent Guidance

## Project status

`infrastructure_plan.md` is the approved source of truth for the technical foundation. This repository now provides its planned local tooling, PostgreSQL/AIStor development services, Prisma migration setup, CI definitions, and smoke testing. It does not contain production application code.

## Repository map

- `app/` and `pages/`: Next.js front end/server code — not created yet.
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

`npm run build`, `npm run test:integration`, and `npm run test:e2e` need future application code/tests and should not be made green with placeholders. CI currently omits those commands for this reason.

## Docker lifecycle

Start local services with `npm run docker:up` and stop them with `npm run docker:down`. This retains named volumes. The smoke test uses a separate Compose project and removes its volumes automatically. Run `docker compose down --volumes` only when intentionally resetting local PostgreSQL and AIStor data. The profile-gated `app` container requires a future Next.js entrypoint.

## Change checklist

1. Keep scope aligned with the plan and avoid product implementation during infrastructure work.
2. Update `.env.example`, README, and this file when commands, services, or prerequisites change.
3. Run relevant verification and record anything blocked by a manual prerequisite.
4. Inspect `git diff --check`, the final diff, and secret exposure before requesting review or committing.
