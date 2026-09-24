# Plan 001: Fix TypeScript Compilation Error in Two-Factor Settings

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 0b9ec9c..HEAD -- resources/js/pages/settings/two-factor.tsx resources/js/layouts/app-layout.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `0b9ec9c`, 2026-09-24

## Why this matters

Running `bun run types` (`tsc --noEmit`) currently fails with TS2322. `resources/js/pages/settings/two-factor.tsx` passes a `breadcrumbs` prop to `AppLayout`, but `AppLayoutProps` in `resources/js/layouts/app-layout.tsx` only accepts `children`. This compiler error breaks static analysis, blocks CI type verification, and leaves developer tooling showing errors.

## Current state

- In `resources/js/layouts/app-layout.tsx:1-10`:

  ```tsx
  import type { ReactNode } from "react";

  interface AppLayoutProps {
    children: ReactNode;
  }

  export default function AppLayout({ children, ...props }: AppLayoutProps) {
    return <div {...props}>{children}</div>;
  }
  ```

- In `resources/js/pages/settings/two-factor.tsx:46`:
  ```tsx
  <AppLayout breadcrumbs={breadcrumbs}>
  ```
  `breadcrumbs` has type `BreadcrumbItem[]` (imported from `@/types`), but `AppLayoutProps` rejects it.

## Commands you will need

| Purpose   | Command         | Expected on success |
| --------- | --------------- | ------------------- |
| Typecheck | `bun run types` | exit 0, no errors   |
| Lint      | `bun run lint`  | exit 0              |
| Build     | `bun run build` | exit 0              |

## Scope

**In scope**:

- `resources/js/layouts/app-layout.tsx`
- `resources/js/pages/settings/two-factor.tsx`

**Out of scope**:

- Do not redesign or replace `AppLayout` with `AppSidebarLayout` in this plan; full navigation layout restoration is handled in Plan 006.
- Other settings pages (`profile.tsx`, `password.tsx`, `appearance.tsx`).

## Git workflow

- Branch: `advisor/001-fix-two-factor-type-error`
- Commit message: `fix(types): support optional breadcrumbs on AppLayout`

## Steps

### Step 1: Add optional breadcrumbs prop to AppLayoutProps

In `resources/js/layouts/app-layout.tsx`:

1. Import `type { BreadcrumbItem } from "@/types";`.
2. Update `AppLayoutProps` to include `breadcrumbs?: BreadcrumbItem[];`.
3. Destructure `breadcrumbs = undefined` in `AppLayout({ children, breadcrumbs = undefined, ...props }: AppLayoutProps)` so that `breadcrumbs` is not leaked into the DOM wrapper element props.

Target code shape for `resources/js/layouts/app-layout.tsx`:

```tsx
import type { BreadcrumbItem } from "@/types";
import type { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs = undefined, ...props }: AppLayoutProps) {
  return <div {...props}>{children}</div>;
}
```

**Verify**: `bun run types` → exit 0, no errors found.

### Step 2: Verify ESLint and build pass

Run the linter and Vite build to confirm no import or compilation regressions:

**Verify**:

- `bun run lint` → exit 0
- `bun run build` → exit 0

## Test plan

- Verification is static type checking and bundle building:
  - `bun run types` → must report 0 errors (previously reported TS2322 on `two-factor.tsx:46`).
  - `bun run build` → must succeed.

## Done criteria

- [ ] `bun run types` exits 0 with 0 errors
- [ ] `bun run lint` exits 0
- [ ] `bun run build` exits 0
- [ ] No files outside `resources/js/layouts/app-layout.tsx` and `resources/js/pages/settings/two-factor.tsx` are modified
- [ ] `plans/README.md` status row updated

## STOP conditions

- If `bun run types` produces errors in files other than `two-factor.tsx` after the change, STOP and report.
- If `BreadcrumbItem` type definition in `resources/js/types/index.d.ts` has changed or is missing, STOP and report.

## Maintenance notes

- This change unblocks Plan 005 (adding type checking to CI).
- Plan 006 builds on this by properly passing `breadcrumbs` to `AppSidebarLayout`.
