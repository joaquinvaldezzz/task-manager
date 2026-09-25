# Plan 011: Fix ESLint nested ternary in tasks-table and clean unused nav-user symbols

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 7481977..HEAD -- resources/js/pages/dashboard/tasks-table.tsx resources/js/components/nav-user.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `7481977`, 2026-09-25

## Why this matters

The project linter workflow (`.github/workflows/lint.yml:48`) executes `bun lint` (which runs `eslint . --ext .ts,.tsx`). Currently, `npm run lint` / `bun lint` fails with exit code 1 due to an ESLint `no-nested-ternary` violation in `resources/js/pages/dashboard/tasks-table.tsx` and raises warnings for unused imports in `resources/js/components/nav-user.tsx`. This failure blocks automated pull requests and CI pipelines. Refactoring the nested ternary into a clean helper and pruning unused variables restores a green CI status.

## Current state

- `resources/js/pages/dashboard/tasks-table.tsx` — Dashboard tasks table. Lines 84–91 contain a nested ternary assigning badge variant based on priority:
  ```tsx
  <Badge
    variant={
      task.priority === "high"
        ? "destructive"
        : task.priority === "low"
          ? "outline"
          : "secondary"
    }
    className="capitalize"
  >
  ```
- `resources/js/components/nav-user.tsx` — Navigation user profile menu in the app sidebar. Lines 8, 20, and 21 import or define unused variables:
  ```tsx
  import {
    SidebarMenu,
    SidebarMenuBadge, // unused
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
  } from "@/components/ui/sidebar";
  ...
  export function NavUser() {
    const { auth } = usePage<SharedData>().props;
    const { state } = useSidebar(); // unused
    const isMobile = useIsMobile(); // unused
  ```
- Repo conventions: TypeScript and ESLint configuration (`eslint.config.js` or `.eslintrc.*`). All UI components use Tailwind CSS and Prettier formatting (`npm run format:check`).

## Commands you will need

| Purpose      | Command                      | Expected on success                                                    |
| ------------ | ---------------------------- | ---------------------------------------------------------------------- |
| Typecheck    | `npm run types`              | exit 0, no errors                                                      |
| Lint         | `npm run lint`               | exit 0, 0 errors, 0 warnings (or only acceptable third-party warnings) |
| Format check | `npm run format:check`       | exit 0, all files use Prettier style                                   |
| Test suite   | `php artisan test --compact` | all 58 tests pass                                                      |

## Scope

**In scope**:

- `resources/js/pages/dashboard/tasks-table.tsx`
- `resources/js/components/nav-user.tsx`

**Out of scope**:

- Do NOT touch `two-factor-setup-modal.tsx` (the `react/no-danger` warning is intentional for SVG QR code rendering).
- Do NOT change any behavior or prop contracts of `TasksTable` or `NavUser`.

## Git workflow

- Branch: `advisor/011-fix-eslint-nested-ternary`
- Commit message: `fix(dashboard): resolve eslint nested-ternary error and remove unused nav symbols`

## Steps

### Step 1: Refactor priority badge variant mapping in `tasks-table.tsx`

In `resources/js/pages/dashboard/tasks-table.tsx`:

1. Define a helper mapping object or function outside the component:

   ```tsx
   import type { BadgeProps } from "@/components/ui/badge";
   import type { TaskPriority } from "@/types/task";

   const priorityBadgeVariants: Record<TaskPriority, BadgeProps["variant"]> = {
     high: "destructive",
     medium: "secondary",
     low: "outline",
   };
   ```

2. Replace lines 83–95 where `<Badge>` is rendered with:
   ```tsx
   <TableCell>
     {task.priority ? (
       <Badge variant={priorityBadgeVariants[task.priority] ?? "secondary"} className="capitalize">
         {task.priority}
       </Badge>
     ) : (
       "—"
     )}
   </TableCell>
   ```

**Verify**: `npx eslint resources/js/pages/dashboard/tasks-table.tsx` → exit 0, no errors.

### Step 2: Remove unused imports and variables in `nav-user.tsx`

In `resources/js/components/nav-user.tsx`:

1. Remove `SidebarMenuBadge` from the import list from `@/components/ui/sidebar` (line 8).
2. Remove `useSidebar` from the import list if `state` was its only usage.
3. Remove `import { useIsMobile } from "@/hooks/use-mobile";` if `isMobile` is unused.
4. Remove `const { state } = useSidebar();` and `const isMobile = useIsMobile();` from the component body (lines 20–21).

**Verify**: `npx eslint resources/js/components/nav-user.tsx` → exit 0, no unused-vars warnings.

### Step 3: Run full verification suite

Run formatting check, type checking, and full ESLint check across the repository:

1. Run `npm run types`
2. Run `npm run format:check` (if Prettier complains, run `npx prettier --write resources/js/pages/dashboard/tasks-table.tsx resources/js/components/nav-user.tsx`)
3. Run `npm run lint`

**Verify**: `npm run lint` → exit 0 (only 1 expected warning in `two-factor-setup-modal.tsx`, 0 errors).

## Test plan

- Automated verification:
  - Run `npm run types` → exit 0
  - Run `npm run lint` → exit 0
  - Run `php artisan test --compact` → all tests pass

## Done criteria

- [ ] `npm run lint` exits 0 with 0 errors.
- [ ] `npm run types` exits 0 with no TypeScript diagnostic errors.
- [ ] `npm run format:check` exits 0.
- [ ] `php artisan test --compact` exits 0.
- [ ] No files outside the in-scope list are modified (`git status`).
- [ ] `plans/README.md` status row updated to `DONE`.

## STOP conditions

- If `priorityBadgeVariants` produces a TypeScript error with `BadgeProps["variant"]`, inspect `resources/js/components/ui/badge.tsx` for the exported variant type.
- If `resources/js/pages/dashboard/tasks-table.tsx` or `nav-user.tsx` has diverged significantly from the current state excerpts, stop and report.

## Maintenance notes

- Future additions of priority levels should add their corresponding variant to `priorityBadgeVariants`.
