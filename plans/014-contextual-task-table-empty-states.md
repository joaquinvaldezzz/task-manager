# Plan 014: Provide contextual empty states in task table based on active filter

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 7481977..HEAD -- resources/js/pages/dashboard/task-table-empty.tsx resources/js/pages/dashboard/tasks-table.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/011-fix-eslint-nested-ternary-and-clean-nav-user.md
- **Category**: bug
- **Planned at**: commit `7481977`, 2026-09-25

## Why this matters

When users filter tasks by "Active" or "Completed" in `TasksTable`, if the filtered list has zero items, the table currently renders a generic empty state saying: _"You haven't created any tasks yet. Start by adding a new task to manage your to-dos."_ When a user has 10 active tasks and switches to the "Completed" tab, this message is false and disorienting. Providing context-aware empty state copy (e.g. "All caught up!" for empty active tasks, or "No completed tasks yet" for completed tab) creates clear, helpful feedback.

## Current state

- `resources/js/pages/dashboard/task-table-empty.tsx`:
  ```tsx
  export function TaskTableEmpty() {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CheckIcon />
          </EmptyMedia>
          <EmptyTitle>No tasks found</EmptyTitle>
          <EmptyDescription>
            You haven&apos;t created any tasks yet. Start by adding a new task to manage your
            to-dos.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }
  ```
- `resources/js/pages/dashboard/tasks-table.tsx` (lines 123–128):
  ```tsx
  <TableRow>
    <TableCell colSpan={7}>
      <TaskTableEmpty />
    </TableCell>
  </TableRow>
  ```
- The `TasksTable` manages `filter`: `"all" | "active" | "completed"` and knows the total unfiltered `tasks.length`.

## Commands you will need

| Purpose   | Command                                                 | Expected on success |
| --------- | ------------------------------------------------------- | ------------------- |
| Typecheck | `npm run types`                                         | exit 0, no errors   |
| Lint      | `npm run lint`                                          | exit 0              |
| Format    | `npm run format:check`                                  | exit 0              |
| Tests     | `php artisan test --compact tests/Feature/TaskTest.php` | all pass            |

## Scope

**In scope**:

- `resources/js/pages/dashboard/task-table-empty.tsx`
- `resources/js/pages/dashboard/tasks-table.tsx`

**Out of scope**:

- Do NOT modify the `Empty` primitive components in `@/components/ui/empty`.
- Do NOT alter table layout or styling outside the empty state row.

## Git workflow

- Branch: `advisor/014-contextual-empty-states`
- Commit message: `feat(dashboard): show contextual empty state messaging based on active filter`

## Steps

### Step 1: Update `TaskTableEmpty` to accept filter context

In `resources/js/pages/dashboard/task-table-empty.tsx`:

1. Define props interface:

   ```tsx
   export type TaskFilterType = "all" | "active" | "completed";

   interface TaskTableEmptyProps {
     filter?: TaskFilterType;
     totalTasks?: number;
   }
   ```

2. Define contextual messaging map:
   ```tsx
   const emptyStateContent = {
     none: {
       title: "No tasks found",
       description:
         "You haven't created any tasks yet. Start by adding a new task to manage your to-dos.",
     },
     active: {
       title: "All caught up!",
       description: "You don't have any active tasks right now. Great job!",
     },
     completed: {
       title: "No completed tasks yet",
       description: "Completed tasks will appear here as you check them off.",
     },
     filteredEmpty: {
       title: "No matching tasks",
       description: "No tasks match the selected filter.",
     },
   };
   ```
3. Compute the active message based on `totalTasks` and `filter`:

   ```tsx
   export function TaskTableEmpty({ filter = "all", totalTasks = 0 }: TaskTableEmptyProps) {
     let content = emptyStateContent.none;

     if (totalTasks > 0) {
       if (filter === "active") {
         content = emptyStateContent.active;
       } else if (filter === "completed") {
         content = emptyStateContent.completed;
       } else {
         content = emptyStateContent.filteredEmpty;
       }
     }

     return (
       <Empty>
         <EmptyHeader>
           <EmptyMedia variant="icon">
             <CheckIcon />
           </EmptyMedia>
           <EmptyTitle>{content.title}</EmptyTitle>
           <EmptyDescription>{content.description}</EmptyDescription>
         </EmptyHeader>
       </Empty>
     );
   }
   ```

**Verify**: `npm run types` → exit 0.

### Step 2: Pass `filter` and `totalTasks` in `tasks-table.tsx`

In `resources/js/pages/dashboard/tasks-table.tsx`:
Update line 125 where `<TaskTableEmpty />` is rendered:

```tsx
<TableRow>
  <TableCell colSpan={7}>
    <TaskTableEmpty filter={filter} totalTasks={tasks.length} />
  </TableCell>
</TableRow>
```

**Verify**: `npm run types && npm run lint` → exit 0.

### Step 3: Run formatting check and verify

Run Prettier check:

```bash
npm run format:check
```

If formatting adjustments are needed, run `npx prettier --write resources/js/pages/dashboard/task-table-empty.tsx resources/js/pages/dashboard/tasks-table.tsx`.

Run tests:

```bash
php artisan test --compact tests/Feature/TaskTest.php
```

**Verify**: All checks exit 0.

## Test plan

- Automated tests:
  - `npm run types` → exit 0
  - `npm run lint` → exit 0
  - `php artisan test --compact` → all 58 tests pass
- Manual verification:
  - If 0 tasks exist: "All", "Active", "Completed" show "No tasks found".
  - If only active tasks exist: "Completed" tab shows "No completed tasks yet".
  - If all tasks are completed: "Active" tab shows "All caught up!".

## Done criteria

- [ ] `TaskTableEmpty` renders contextual title and description when `filter === "active"` or `filter === "completed"`.
- [ ] Initial empty state when `totalTasks === 0` preserves onboarding instruction.
- [ ] `npm run types` exits 0.
- [ ] `npm run lint` exits 0.
- [ ] `php artisan test --compact` exits 0.
- [ ] `plans/README.md` status row updated to `DONE`.

## STOP conditions

- If `TaskFilterType` conflicts with tabs value definition, extract a shared union type or use `"all" | "active" | "completed"`.
