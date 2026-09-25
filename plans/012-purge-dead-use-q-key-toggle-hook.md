# Plan 012: Purge dead use-q-key-toggle hook

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 7481977..HEAD -- resources/js/hooks/use-q-key-toggle.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `7481977`, 2026-09-25

## Why this matters

The hook `resources/js/hooks/use-q-key-toggle.ts` was implemented to bind keyboard shortcuts before the codebase adopted `@tanstack/react-hotkeys`. In `resources/js/pages/dashboard/task-form.tsx`, shortcut handling was switched to `useHotkey("Q", ...)` from `@tanstack/react-hotkeys`. As a result, `use-q-key-toggle.ts` is completely unreferenced across the codebase. Removing dead code avoids confusion for developers and eliminates needless maintenance overhead.

## Current state

- `resources/js/hooks/use-q-key-toggle.ts` — Contains:

  ```ts
  import { useEffect } from "react";

  function isInputElement(target: EventTarget | null): boolean {
    ...
  }

  export function useQKeyToggle(onToggle: (open: boolean) => void): void {
    ...
  }
  ```

- Search for references: `grep -rn "useQKeyToggle" resources/` yields only its own declaration line.
- `resources/js/pages/dashboard/task-form.tsx` uses `@tanstack/react-hotkeys`:
  ```tsx
  import { useHotkey } from "@tanstack/react-hotkeys";
  ...
  useHotkey("Q", () => {
    if (!isDialogOpen) {
      setIsDialogOpen(true);
    }
  });
  ```

## Commands you will need

| Purpose         | Command                      | Expected on success |
| --------------- | ---------------------------- | ------------------- |
| Reference check | `git grep "useQKeyToggle"`   | 0 matches           |
| Typecheck       | `npm run types`              | exit 0, no errors   |
| Lint            | `npm run lint`               | exit 0              |
| Tests           | `php artisan test --compact` | all 58 tests pass   |

## Scope

**In scope**:

- Delete `resources/js/hooks/use-q-key-toggle.ts`

**Out of scope**:

- Do NOT touch `resources/js/pages/dashboard/task-form.tsx` or its hotkey logic.
- Do NOT delete any other hooks in `resources/js/hooks/`.

## Git workflow

- Branch: `advisor/012-purge-dead-use-q-key-toggle`
- Commit message: `chore(hooks): remove deprecated and unused useQKeyToggle hook`

## Steps

### Step 1: Confirm zero external references

Verify that no file imports `useQKeyToggle` or references `use-q-key-toggle`:

```bash
grep -rn "useQKeyToggle" resources/js/
grep -rn "use-q-key-toggle" resources/js/
```

**Verify**: Both commands return only lines in `resources/js/hooks/use-q-key-toggle.ts`.

### Step 2: Delete the dead hook file

Remove the file:

```bash
rm resources/js/hooks/use-q-key-toggle.ts
```

**Verify**: `ls resources/js/hooks/use-q-key-toggle.ts` reports "No such file or directory".

### Step 3: Run project checks

Ensure deleting the file causes no compilation or lint regressions:

```bash
npm run types
npm run lint
php artisan test --compact
```

**Verify**: All three commands exit with code 0.

## Test plan

- Automated verification:
  - `npm run types` → exit 0
  - `npm run lint` → exit 0
  - `php artisan test --compact` → all 58 tests pass

## Done criteria

- [ ] `resources/js/hooks/use-q-key-toggle.ts` is deleted from git.
- [ ] `grep -rn "use-q-key-toggle" resources/` returns no matches.
- [ ] `npm run types` exits 0.
- [ ] `php artisan test --compact` exits 0.
- [ ] `plans/README.md` status row updated to `DONE`.

## STOP conditions

- If `grep -rn "useQKeyToggle" resources/js/` finds references in other active components, STOP and check whether those callers should also be migrated to `@tanstack/react-hotkeys`.
