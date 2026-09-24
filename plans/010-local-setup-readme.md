# Plan 010: Create Comprehensive README for Local Installation and Setup

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat fed9a6f..HEAD -- README.md`
> If `README.md` already exists and has changed since this plan was written,
> compare against the "Current state" before proceeding; on an unexpected conflict,
> treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: docs
- **Planned at**: commit `fed9a6f`, 2026-09-24

## Why this matters

The repository currently lacks a root `README.md` file. New developers, contributors, and automated tooling onboarding to the project must manually inspect `composer.json`, `package.json`, and CI workflow files to deduce the system prerequisites (PHP 8.4, Composer 2, Bun), SQLite database initialization, environment variable configuration, and how to start the multi-process local dev environment. Adding a clear, accurate, and comprehensive `README.md` standardizes the developer experience and ensures anyone can get the application up and running within minutes.

## Current state

- Root `README.md` does not exist in the repository root.
- The project is a Laravel 12 application with Inertia.js v2, React 19, Tailwind CSS v4, TypeScript, and Laravel Fortify.
- In `composer.json:43-59`:
  - `composer run setup` runs:
    ```json
    "setup": [
      "composer install",
      "@php -r \"file_exists('.env') || copy('.env.example', '.env');\"",
      "@php artisan key:generate",
      "@php artisan migrate --force",
      "bun install",
      "bun run build"
    ]
    ```
  - `composer run dev` runs:
    ```json
    "dev": [
      "Composer\\Config::disableProcessTimeout",
      "bun concurrently -c \"#93c5fd,#c4b5fd,#fb7185,#fdba74\" \"php artisan serve\" \"php artisan queue:listen --tries=1\" \"php artisan pail --timeout=0\" \"bun run dev\" --names=server,queue,logs,vite --kill-others"
    ]
    ```
- In `package.json:6-13`:
  - Scripts: `build`, `build:ssr`, `dev` (Vite), `format`, `format:check`, `lint` (ESLint), `types` (`tsc --noEmit`).
  - Package manager used across the repo and CI is `bun` (also has `bun.lock`).
- In `.env.example:23-40`:
  - `DB_CONNECTION=sqlite`
  - `SESSION_DRIVER=database`
  - `QUEUE_CONNECTION=database`
  - `CACHE_STORE=database`
- In `database/seeders/DatabaseSeeder.php:18-21`:
  - Seeds a default user: `test@example.com` (password defined in `UserFactory.php` defaults to `'password'`).
- In `.github/workflows/lint.yml` and `tests.yml`:
  - PHP version targeted: `8.4` (Composer 2).
  - Frontend runner targeted: `oven-sh/setup-bun@v2`.

## Commands you will need

| Purpose         | Command                              | Expected on success |
| --------------- | ------------------------------------ | ------------------- |
| Check existence | `test -f README.md && echo "exists"` | `exists`            |
| Format check    | `bunx prettier --check README.md`    | exit 0              |
| Format file     | `bunx prettier --write README.md`    | exit 0              |
| Test suite      | `php artisan test --compact`         | all pass            |

## Suggested executor toolkit

- Bun and Prettier for markdown file formatting.

## Scope

**In scope**:

- `README.md` (create at repository root)
- `plans/README.md` (update status row for Plan 010)

**Out of scope**:

- Modifying `composer.json`, `package.json`, or `.env.example`
- Modifying backend PHP code or frontend TypeScript/React code
- Modifying plans 001–009

## Git workflow

- Branch: `advisor/010-local-setup-readme`
- Commit message style: `docs: add setup and installation README` (<= 50 characters)
- Do NOT push or open a PR unless instructed by the operator.

## Steps

### Step 1: Create `README.md` at repository root

Create `/Users/joaquin/Developer/task-manager/README.md` with complete, self-contained documentation matching the repository's exact toolchain.

The content of `README.md` must include:

1. **Title & Overview**: Task Manager application built with Laravel 12, Inertia.js v2, React 19, Tailwind CSS v4, and TypeScript.
2. **Tech Stack Summary**:
   - Backend: Laravel 12, Laravel Fortify (Auth & 2FA), SQLite, Pest 4, Laravel Pint
   - Frontend: Inertia.js v2, React 19, Tailwind CSS v4, TypeScript, Vite 7
   - Runtime / Package Managers: PHP 8.4+ (>= 8.2), Composer 2.x, Bun >= 1.0
3. **Prerequisites**:
   - PHP >= 8.2 (8.4 recommended) with `pdo_sqlite`, `curl`, `mbstring`, `openssl`, `tokenizer`, `xml` extensions.
   - Composer 2.x
   - Bun (primary frontend toolchain and concurrent dev runner)
   - SQLite3
4. **Quick Start (Automated Setup)**:
   - Clone repo: `git clone <repo-url> && cd task-manager`
   - One-command setup: `composer run setup`
     - Briefly explain what `composer run setup` executes (installs PHP dependencies, copies `.env.example` to `.env`, generates app key, runs SQLite migrations, installs Bun packages, and builds frontend assets).
   - Seed database (optional): `php artisan db:seed`
   - Start local development: `composer run dev`
5. **Manual Step-by-Step Installation**:
   - Step 1: `composer install`
   - Step 2: `cp .env.example .env`
   - Step 3: `php artisan key:generate`
   - Step 4: Ensure SQLite database file exists: `touch database/database.sqlite` (if not auto-created)
   - Step 5: Run migrations: `php artisan migrate`
   - Step 6: (Optional) Seed demo user: `php artisan db:seed`
   - Step 7: Install frontend packages: `bun install`
   - Step 8: Build or compile assets: `bun run build`
6. **Running the Application Locally**:
   - Recommended all-in-one command: `composer run dev`
     - Explains the 4 concurrently spawned services:
       - `server`: `php artisan serve` (http://localhost:8000)
       - `queue`: `php artisan queue:listen --tries=1`
       - `logs`: `php artisan pail --timeout=0`
       - `vite`: `bun run dev` (Vite dev server with HMR)
   - Alternative manual multi-terminal approach:
     - Terminal 1: `php artisan serve`
     - Terminal 2: `bun run dev`
     - Terminal 3 (optional): `php artisan queue:listen`
     - Terminal 4 (optional): `php artisan pail`
7. **Default Credentials**:
   - When seeded with `php artisan db:seed`:
     - Email: `test@example.com`
     - Password: `password`
   - Or register a new account directly via http://localhost:8000/register
8. **Testing & Code Quality Commands**:
   - Run tests: `composer test` or `php artisan test`
   - Format PHP: `composer lint` (Laravel Pint)
   - Check PHP style: `composer test:lint`
   - TypeScript verification: `bun run types` (`tsc --noEmit`)
   - Frontend linting: `bun run lint`
   - Frontend formatting: `bun run format` (Prettier)

**Verify**:

```bash
test -f README.md && echo "README exists"
```

→ Expected output: `README exists`

---

### Step 2: Format `README.md` with Prettier

Run Prettier to format markdown and verify consistency with the repo's prettier configuration.

```bash
bunx prettier --write README.md
bunx prettier --check README.md
```

→ Expected output: `README.md` is formatted cleanly, check exits 0.

---

### Step 3: Update `plans/README.md`

Update the status table and dependency notes in `plans/README.md` to record Plan 010.

**Verify**:

```bash
git diff plans/README.md
```

→ Expected output: Plan 010 row present in table with status `TODO` (or updated according to execution).

## Test plan

- **Verification Command 1**: `test -f README.md` exits 0.
- **Verification Command 2**: Confirm required sections exist in `README.md`:
  ```bash
  grep -q "## Prerequisites" README.md && \
  grep -q "composer run setup" README.md && \
  grep -q "composer run dev" README.md && \
  grep -q "test@example.com" README.md && echo "Content validated"
  ```
  → Expected: `Content validated`.
- **Verification Command 3**: Run prettier formatting check:
  ```bash
  bunx prettier --check README.md
  ```
  → Expected: exit 0.

## Done criteria

- [ ] `README.md` exists in the repository root.
- [ ] Contains accurate prerequisites, quickstart (`composer run setup`), manual setup steps, `composer run dev` documentation, default credentials, and testing/linting commands.
- [ ] `bunx prettier --check README.md` exits 0.
- [ ] No source code or configuration files outside `README.md` and `plans/README.md` are modified.
- [ ] Status row for Plan 010 is added in `plans/README.md`.

## STOP conditions

- If `README.md` already exists and has uncommitted local content that should not be overwritten, STOP and ask the user for confirmation.
- If the executor finds instructions requiring changes to `composer.json` or `.env.example`, STOP and report back.

## Maintenance notes

- When additional database systems (e.g. MySQL, Postgres, Redis) or third-party services are configured in subsequent plans, the Prerequisites and Environment Configuration sections of `README.md` should be updated accordingly.
- If the development server script in `composer.json` changes (e.g. removing pail or adding SSR), reflect the change in the Running Locally section.
