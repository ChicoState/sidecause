# Infrastructure Plan

> Planning only. This document describes future infrastructure work. No installations, configuration changes, containers, workflows, deployments, or other implementation files were created by the infrastructure-planning process.

## 1. Project and User Experience

- **Application:** Public-facing, full-stack web application.
- **Primary users:** Individual public users with their own accounts.
- **Primary user task:** To be confirmed before product implementation.
- **Selected platform:** Browser-based full-stack web application.
- **User-experience rationale:** Immediate browser access without installation is the priority.
- **Required operating systems, browsers, or devices:** Current desktop and mobile browsers.
- **Offline or native-device requirements:** No strong offline or native-device requirement identified.

## 2. Connectivity and Application Shape

- **Connectivity model:** Single-user web-enabled.
- **Accounts and authentication:** Each user authenticates to access their own data across devices; authentication provider is to be selected.
- **Backend required:** Yes, for authentication, account-scoped data, uploads, and server-side operations.
- **Cross-device persistence:** Hosted database and object storage.
- **Interaction between accounts:** No sharing or collaboration requirement currently selected.
- **Primary application components:** Next.js web UI and server features, PostgreSQL, object storage, and an authentication integration.

## 3. Selected Technology Stack

| Area | Selected technology | Purpose | Version policy |
|---|---|---|---|
| Primary language | TypeScript | Shared client and server language | Supported stable release |
| Application framework | Next.js with React | Pages, UI, server routes, and rendering | Supported stable release |
| Runtime or SDK | Node.js | Runs Next.js tooling and application | Active LTS |
| Package manager | npm | Dependency and script management | Version bundled with selected Node LTS |
| Build or packaging tool | Next.js build | Produces deployable web application | Match framework version |
| Backend framework | Next.js server features | Account-scoped APIs and server logic | Match framework version |
| API or synchronization layer | Next.js route handlers/server actions | Application API; no sync layer required | Match framework version |

## 4. Storage and Persistence

- **Storage model:** Hosted relational data plus hosted object storage.
- **Primary data store:** Managed PostgreSQL for account-owned structured data.
- **User files or object storage:** S3-compatible managed object storage for uploads and media.
- **Local-development storage:** PostgreSQL and AIStor (MinIO's maintained S3-compatible successor) containers.
- **Production hosting model:** Managed PostgreSQL and object-storage providers, selected alongside the container host.
- **Schema and migration approach:** Select a TypeScript-compatible migration tool during implementation; run reviewed migrations before release deployment.
- **Backup, export, or recovery approach:** Enable provider backups and define an account-data export policy before launch.
- **Secrets and connection-string approach:** Keep database URLs, storage credentials, and auth secrets in local environment configuration and deployment secrets; never commit values.
- **Reason this storage fits the access pattern:** It preserves each authenticated user's data across browsers and devices while supporting uploads.

## 5. Testing Tools

| Test layer | Tool or library | Planned scope | Planned execution point |
|---|---|---|---|
| Unit | Vitest | Pure server and client logic | Local and pull requests |
| Component | React Testing Library with Vitest | Important UI behavior and accessibility-oriented queries | Local and pull requests |
| Integration | Vitest and Testcontainers | API, database, and storage-adjacent behavior against PostgreSQL containers | Local and pull requests |
| End-to-end or UI | Playwright | Authentication and highest-value browser workflows | Pull requests and releases |

## 6. Test Analysis

| Capability | Tool | Planned policy |
|---|---|---|
| Coverage | Vitest V8 coverage | Collect and publish reports on pull requests |
| Coverage threshold or regression rule | None initially | Report only; review baseline after core workflows exist |
| Flaky-test or duration analysis | GitHub Actions test timing and Playwright traces | Inspect failures and slow tests |
| Reporting | GitHub Actions artifacts | Retain coverage output, Playwright reports, traces, and screenshots on failure |

## 7. Static Analysis and Security

| Check | Tool | Planned enforcement |
|---|---|---|
| Formatting | Prettier | Verify on pull requests; block merges |
| Linting | ESLint | Verify on pull requests; block merges |
| Type checking or compiler warnings | TypeScript compiler | Verify on pull requests; block merges |
| Dependency vulnerability scanning | Dependabot | Open update PRs; review security alerts |
| Secret scanning | Gitleaks | Scan pull requests; block merges |
| Static security analysis | GitHub CodeQL | Scan pull requests and scheduled default-branch runs; block high-confidence findings |
| Container scanning | Trivy | Scan release image before registry publication; block critical findings |

## 8. Development Technologies Requiring Manual Installation

These are developer-workstation prerequisites that will not be supplied by the planned Docker environment.

| Technology | Why it is needed | Required on which machines | Version policy | Planned installation or verification method | Why Docker does not provide it |
|---|---|---|---|---|---|
| Git | Source control and GitHub workflow | All developer workstations | Supported stable release | Future documented prerequisite check | Host credentials and working copy remain on the host |
| Docker Desktop or Docker Engine with Compose | Runs the reproducible development environment | All developer workstations | Current supported release | Future documented prerequisite check | It is the host container runtime |
| Node.js and npm | Editor integration, local tooling, and emergency non-container diagnosis | All developer workstations | Active Node LTS | Future documented prerequisite check | Editor and host tooling need direct access |

### Host tools intentionally not required

- **Not required because Docker supplies them:** Development Node runtime, PostgreSQL, AIStor, and application dependencies inside the planned development environment.
- **Not required for this platform:** Xcode, Android Studio, native mobile SDKs, desktop signing tools, and local database-server installation.

## 9. Docker Plan

- **Planned Docker role:** Reproducible development environment; production is a hardened web-application container.
- **Future files that would be created during implementation:** `Dockerfile`, development Compose file, production Compose or deployment manifest, and `.dockerignore`.
- **Planned images and services:** Next.js application, PostgreSQL, and AIStor locally; release image for the application only.
- **Development container behavior:** Bind-mount source code, run the development server, and use named volumes for dependencies and service data.
- **Ports:** Publish application, PostgreSQL, and AIStor ports only for local development; finalize values during implementation.
- **Environment-variable and secret handling:** Use ignored local environment files; inject production secrets through the selected host's secret manager.
- **Local database or service containers:** PostgreSQL and AIStor, with persistent named volumes.
- **Production image or non-container release path:** Multi-stage Node image, non-root runtime user, minimal runtime dependencies, health endpoint, and no embedded secrets.
- **Build stages and hardening:** Separate dependency, build, and runtime stages; add `.dockerignore` and Trivy release scanning.
- **Planned future development command:** `docker compose up --build`.
- **Planned future production command:** Provider-specific build and deploy command after the container host is selected.

## 10. GitHub Actions Plan

### A. Automated pull-request checks

- **Future workflow file:** `.github/workflows/pr-checks.yml`
- **Trigger:** `pull_request`.
- **Runner or matrix:** Ubuntu latest; supported Node LTS. Add a browser-capable Playwright job.
- **Permissions:** Read-only repository contents by default; grant only `security-events: write` to the CodeQL job if needed.
- **Planned jobs in order:**
  1. Checkout, configure Node, restore npm cache, and perform lockfile-enforced installation with `npm ci`.
  2. Run Prettier verification, ESLint, TypeScript checking, and unit/component tests with V8 coverage.
  3. Run PostgreSQL-backed integration tests using Testcontainers, then Playwright end-to-end tests.
  4. Build the Next.js application, scan committed secrets with Gitleaks, and run CodeQL.
- **Service containers:** None for the application test job; Testcontainers manages ephemeral PostgreSQL. Use an explicit AIStor service only if integration coverage needs real object operations.
- **Caching:** Cache npm's download directory keyed by lockfile and Node version; cache Playwright browsers when practical.
- **Coverage and analysis reporting:** Upload coverage artifacts; publish CodeQL findings to GitHub security results.
- **Failure artifacts:** Upload Playwright traces/screenshots/video, test logs, and coverage reports.
- **Checks that should block merging:** Installation, formatting, linting, type checking, tests, build, Gitleaks, and high-confidence CodeQL findings.
- **Proposed branch-protection settings:** Require the blocking checks, at least one approving review, and an up-to-date branch before merge.

### B. New-release deployment

- **Future workflow file:** `.github/workflows/release.yml`
- **Release trigger:** Signed or protected `v*` tag, with `workflow_dispatch` for controlled redeployment.
- **Release destination:** Container registry plus a managed container host; providers are to be selected.
- **Runner or matrix:** Ubuntu latest with Node LTS and the selected cloud provider's supported deployment tooling.
- **Planned jobs in order:**
  1. Validate the tag, install from the lockfile, run formatting, linting, type checks, tests, and production build.
  2. Build a multi-stage application image, scan it with Trivy, generate an immutable image digest, and publish to the selected registry.
  3. Deploy the digest to the protected production environment, run reviewed migrations if required, then execute a smoke/health check.
- **Build artifacts:** Container image digest, image metadata, and optional release notes.
- **Signing, notarization, or store requirements:** No native signing; configure container provenance/signing only if supported by the selected registry and host.
- **Database migration step:** Required only after the migration tool and hosting provider are selected; make it a reviewed, ordered release step.
- **Environment approval:** GitHub `production` environment with required reviewer approval before deployment.
- **Post-deployment verification:** Request the authenticated health endpoint and a public smoke route; verify the deployed image digest.
- **Failed-release or rollback approach:** Redeploy the last known-good immutable image digest, then investigate before retrying migrations or release.

### GitHub configuration required later

| Name | Type | Purpose |
|---|---|---|
| `production` | GitHub environment | Protected deployment approval and environment-scoped secrets |
| `CONTAINER_REGISTRY_TOKEN` | Secret | Authenticate release workflow to the selected container registry, if `GITHUB_TOKEN` is insufficient |
| `CLOUD_DEPLOY_CREDENTIALS` | Secret | Authenticate to the selected container host |
| `DATABASE_URL` | Secret | Production PostgreSQL connection string |
| `OBJECT_STORAGE_*` | Secrets | Object-storage endpoint, bucket, access key, and secret key |
| `AUTH_*` | Secrets | Authentication provider credentials and session secret |
| Cloud and storage accounts | Provider accounts | Managed container host, PostgreSQL, and object storage |

## 11. Planned Repository Artifacts - Not Created by This Skill

- [ ] Application manifest or project file: `package.json`.
- [ ] Lockfile: `package-lock.json`.
- [ ] Test configuration: Vitest and Playwright configuration.
- [ ] Static-analysis configuration: Prettier, ESLint, TypeScript, Gitleaks, and CodeQL configuration as needed.
- [ ] Docker or Compose files: development and production container definitions plus `.dockerignore`.
- [ ] `.github/workflows/pr-checks.yml`: Pull-request checks.
- [ ] `.github/workflows/release.yml`: Tagged-release publication and deployment.
- [ ] Deployment or store configuration: Container-host service definition and secrets configuration.

## 12. Assumptions and Open Items

- **Assumptions:** The product has ordinary structured account data, may accept user uploads, and does not require real-time collaboration, offline-first operation, or native-device APIs.
- **Decisions still requiring an external account, credential, certificate, or organizational approval:** Select container registry, managed container host, PostgreSQL provider, object-storage provider, authentication provider, and their accounts/credentials.
- **Items to confirm before implementation begins:** Primary user task, expected uploads and maximum file sizes, retention/export requirements, authentication provider, cloud-provider region, data-migration tool, and production health-check route.
