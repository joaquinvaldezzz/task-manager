# Plan 018: Add visual distinction and strikethrough styling for completed tasks

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 7481977..HEAD -- resources/js/pages/dashboard/tasks-table.tsx resources/js/pages/dashboard/task-edit-dialog.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/011-fix-eslint-nested-ternary-and-clean-nav-user.md
- **Category**: direction
- **Planned at**: commit `7481977`, 2026-09-25

## Why this matters

When users check the completion checkbox in `TasksTable`, the only visible feedback is the small checkbox checkmark. In `resources/js/pages/dashboard/task-edit-dialog.tsx` and `tasks-table.tsx`, the task title and row metadata remain styled identically to incomplete tasks. Applying strikethrough typography (`line-through`), muted text colors (`text-muted-foreground`), and subtle row dimming to completed tasks gives instant, rewarding feedback and makes scanning active versus completed tasks effortless.

## Current state

- `resources/js/pages/dashboard/task-edit-dialog.tsx` (line 71):
  ```tsx
  <DialogTrigger className="hover:underline">{task.title}</DialogTrigger>
  ```
- `resources/js/pages/dashboard/tasks-table.tsx` (lines 68–79):

  ```tsx
  <TableRow key={task.id}>
    <TableCell>
      <Checkbox
        id={task.id.toString()}
        checked={task.completed}
        onCheckedChange={(checked) => toggleTask(task.id, Boolean(checked))}
      />
    </TableCell>

    <TableCell>
      <TaskEditDialog task={task} />
    </TableCell>
  ```

- No conditional CSS classes exist based on `task.completed`.

## Commands you will need

| Purpose   | Command                                                 | Expected on success |
| --------- | ------------------------------------------------------- | ------------------- |
| Typecheck | `npm run types`                                         | exit 0, no errors   |
| Lint      | `npm run lint`                                          | exit 0              |
| Format    | `npm run format:check`                                  | exit 0              |
| Tests     | `php artisan test --compact tests/Feature/TaskTest.php` | all pass            |

## Scope

**In scope**:

- `resources/js/pages/dashboard/task-edit-dialog.tsx`
- `resources/js/pages/dashboard/tasks-table.tsx`

**Out of scope**:

- Do NOT alter task toggle logic or backend endpoints.
- Do NOT alter dialog popup content.

## Git workflow

- Branch: `advisor/018-completed-task-visual-styling`
- Commit message: `feat(dashboard): apply strikethrough and muted styling to completed tasks`

## Steps

### Step 1: Update task title trigger in `task-edit-dialog.tsx`

In `resources/js/pages/dashboard/task-edit-dialog.tsx`:

1. Import `cn` from `@/lib/utils`.
2. Update the `<DialogTrigger>` rendering:
   ```tsx
   <DialogTrigger
     className={cn(
       "text-left transition-colors hover:underline",
       task.completed && "text-muted-foreground line-through",
     )}
   >
     {task.title}
   </DialogTrigger>
   ```

**Verify**: `npm run types` → exit 0.

### Step 2: Apply subtle opacity to completed rows in `tasks-table.tsx`

In `resources/js/pages/dashboard/tasks-table.tsx`:

1. Import `cn` from `@/lib/utils` if not already imported.
2. In `TableRow` for each task, apply conditional muted styling:
   ```tsx
   <TableRow
     key={task.id}
     className={cn(
       "transition-colors",
       task.completed && "opacity-75 bg-muted/30",
     )}
   >
   ```

**Verify**: `npm run types && npm run lint` → exit 0.

### Step 3: Run formatting check and tests

```bash
npm run format:check
php artisan test --compact tests/Feature/TaskTest.php
```

**Verify**: Formatting passes and existing tests pass.

## Test plan

- Automated tests:
  - `npm run types` → exit 0
  - `npm run lint` → exit 0
  - `php artisan test --compact` → all pass
- Manual verification:
  - On the dashboard, clicking the checkbox for an active task marks it as completed and immediately strikes through the title and applies muted styling.
  - Clicking it again clears strikethrough and restores full contrast.

## Done criteria

- [ ] Completed task titles render with `line-through` and `text-muted-foreground`.
- [ ] Completed rows render with subtle opacity or background dimming.
- [ ] Incomplete tasks retain standard bold/clear styling.
- [ ] `npm run types` exits 0.
- [ ] `npm run lint` exits 0.
- [ ] `php artisan test --compact` exits 0.
- [ ] `plans/README.md` status row updated to `DONE`.

## STOP conditions

- If `cn` import from `@/lib/utils` fails, check the path in sibling components.
