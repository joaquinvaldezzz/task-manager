# Plan 005: Add TypeScript Typecheck and Check-Mode Enforcement to CI Workflows

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 0b9ec9c..HEAD -- .github/workflows/lint.yml .github/workflows/tests.yml package.json`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001-fix-two-factor-type-error.md
- **Category**: dx
- **Planned at**: commit `0b9ec9c`, 2026-09-24

## Why this matters

Currently, CI pipelines run tests (`.github/workflows/tests.yml`) and linting (`.github/workflows/lint.yml`), but never run `bun run types` (`tsc --noEmit`). This allowed the TypeScript error in `two-factor.tsx` to be pushed to `main` without failing CI. Furthermore:

1. `lint.yml` executes `bun format` (`prettier --write .`) and `vendor/bin/pint` (without `--test`), which mutates files in the ephemeral CI runner instead of failing the job when formatting is incorrect.
2. `lint.yml` has `permissions: contents: write` left over from an old auto-commit step that was commented out.

Fixing CI to check types and enforce non-mutating checks (`format:check`, `pint --test`, `bun run types`) guarantees broken builds and unformatted code cannot merge.

## Current state

- In `.github/workflows/lint.yml:38-46`:

  ```yaml
  - name: Run Pint
    run: vendor/bin/pint

  - name: Format code
    run: bun format

  - name: Lint code
    run: bun lint
  ```

  `vendor/bin/pint` mutates rather than checks.
  `bun format` mutates rather than checks (`package.json` already has `"format:check": "prettier --check resources/"`).
  Missing `bun run types`.

- In `package.json:9-13`:
  ```json
      "format": "prettier --write .",
      "format:check": "prettier --check resources/",
      "lint": "eslint . --ext .ts,.tsx",
      "types": "tsc --noEmit"
  ```
- In `composer.json:63-65`:
  ```json
      "test:lint": [
        "pint --parallel --test"
      ],
  ```

## Commands you will need

| Purpose      | Command                  | Expected on success |
| ------------ | ------------------------ | ------------------- |
| Type check   | `bun run types`          | exit 0              |
| Format check | `bun run format:check`   | exit 0              |
| Lint check   | `bun run lint`           | exit 0              |
| Pint test    | `vendor/bin/pint --test` | exit 0              |

## Scope

**In scope**:

- `.github/workflows/lint.yml`
- `.github/workflows/tests.yml`
- `package.json` (update `format:check` target if needed to match root)

**Out of scope**:

- Do not re-enable automatic git commits in CI.
- Do not change PHP/Bun versions in CI.

## Git workflow

- Branch: `advisor/005-ci-typecheck-and-lint-check`
- Commit message: `ci: add typecheck and enforce check-mode linting in CI`

## Steps

### Step 1: Update package.json format:check script

In `package.json`, update `"format:check"` from `"prettier --check resources/"` to `"prettier --check ."` so it verifies all files consistently with `"format": "prettier --write ."`.

Target in `package.json`:

```json
    "format": "prettier --write .",
    "format:check": "prettier --check .",
```

**Verify**: `bun run format:check` runs against the whole repo.

### Step 2: Update .github/workflows/lint.yml

In `.github/workflows/lint.yml`:

1. Change permissions from `contents: write` to `contents: read`.
2. Add a `Typecheck` step (`bun run types`).
3. Change `vendor/bin/pint` to `vendor/bin/pint --test`.
4. Change `bun format` to `bun run format:check`.

Target steps in `.github/workflows/lint.yml`:

```yaml
name: linter

on:
  push:
    branches:
      - develop
      - main
  pull_request:
    branches:
      - develop
      - main

permissions:
  contents: read

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: "8.4"

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2

      - name: Install Dependencies
        run: |
          composer install -q --no-ansi --no-interaction --no-scripts --no-progress --prefer-dist
          bun install

      - name: Build project
        run: bun run build

      - name: Check TypeScript types
        run: bun run types

      - name: Run Pint Check
        run: vendor/bin/pint --test

      - name: Check code formatting
        run: bun run format:check

      - name: Lint code
        run: bun run lint
```

**Verify**: Validate workflow YAML syntax with a parser or linter.

### Step 3: Run local verification of all check commands

Confirm each command runs cleanly locally:

1. `bun run types` (depends on Plan 001 having resolved the `two-factor.tsx` error)
2. `bun run lint`
3. `vendor/bin/pint` (run without `--test` first if unformatted files need aligning before checking)

**Verify**: All check commands exit 0.

## Test plan

- Test locally:
  - `bun run types` → exit 0
  - `bun run lint` → exit 0
  - `vendor/bin/pint --test` → exit 0

## Done criteria

- [ ] `.github/workflows/lint.yml` contains `bun run types` step
- [ ] `.github/workflows/lint.yml` uses check modes (`pint --test`, `bun run format:check`)
- [ ] `.github/workflows/lint.yml` permissions scoped to `contents: read`
- [ ] `plans/README.md` status row updated

## STOP conditions

- If `bun run types` fails because Plan 001 was not executed yet, STOP and ensure Plan 001 executes first.
- If third-party plugins in Prettier fail on GitHub Actions runners, verify dependencies in `package.json`.

## Maintenance notes

- Any future new checks (e.g. psalm/phpstan or pest type coverage) should be added as separate steps in this workflow.
