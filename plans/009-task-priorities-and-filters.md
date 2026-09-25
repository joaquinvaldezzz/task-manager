# Plan 009: Implement Task Priorities and Status Filter Tabs

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat b072232..HEAD -- app/Models/Task.php resources/js/types/task.ts resources/js/pages/dashboard/tasks-table.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plans/003-task-feature-tests.md, plans/004-refactor-task-controller.md
- **Category**: direction
- **Planned at**: commit `b072232`, 2026-09-25

## Why this matters

In `resources/js/types/task.ts`, `Task` already includes `priority?: 'low' | 'medium' | 'high'`. However, priority is not stored in the database, cannot be chosen when creating or editing a task, and tasks cannot be filtered. As a user's task list grows, distinguishing urgent tasks from low-priority tasks and filtering out completed tasks is essential for daily usability.

## Current state

- In `resources/js/types/task.ts:6`:
  ```ts
  priority?: "low" | "medium" | "high";
  ```
- In `database/migrations/`:
  No `priority` column exists on `tasks` table.
- In `resources/js/pages/dashboard/tasks-table.tsx`:
  All tasks are rendered in a single flat list without tabs or filter controls.
- UI components available: `Badge` (`components/ui/badge.tsx`), `Select` (`components/ui/select.tsx`), `Tabs` (`components/ui/tabs.tsx`).

## Commands you will need

| Purpose   | Command                                                 | Expected on success |
| --------- | ------------------------------------------------------- | ------------------- |
| Migrate   | `php artisan migrate`                                   | exit 0              |
| Tests     | `php artisan test --compact tests/Feature/TaskTest.php` | all pass            |
| Typecheck | `bun run types`                                         | exit 0              |
| Build     | `bun run build`                                         | exit 0              |
| Style     | `vendor/bin/pint --dirty`                               | exit 0              |

## Scope

**In scope**:

- Create migration `add_priority_to_tasks_table`
- `app/Models/Task.php` (add `priority` to `$fillable`)
- `app/Http/Requests/StoreTaskRequest.php` and `UpdateTaskRequest.php` (validate `priority` in `['low', 'medium', 'high']`)
- `resources/js/types/task.ts` (add `TaskPriority` and `priority` to `TaskFormData`)
- `resources/js/hooks/use-task-form.ts` (support `initialPriority`)
- `resources/js/pages/dashboard/task-form.tsx` (add priority selector)
- `resources/js/pages/dashboard/task-edit-dialog.tsx` (add priority selector)
- `resources/js/pages/dashboard/tasks-table.tsx` (add priority badge and All/Active/Completed filter tabs)
- `tests/Feature/TaskTest.php` (test creating, updating, and validating priority)

**Out of scope**:

- Custom color tags or label management (keep strictly to low/medium/high priority).
- Server-side query parameter filtering (client-side filtering in `tasks-table.tsx` is sufficient for current dataset sizes).

## Git workflow

- Branch: `advisor/009-task-priorities-and-filters`
- Commit message: `feat(tasks): add priority and filter tabs`

## Steps

### Step 1: Create migration adding priority column

Run `php artisan make:migration add_priority_to_tasks_table --table=tasks --no-interaction`.
In the migration `up` method:

```php
Schema::table("tasks", function (Blueprint $table) {
  $table->string("priority")->default("medium")->after("completed");
});
```

In `down`:

```php
Schema::table("tasks", function (Blueprint $table) {
  $table->dropColumn("priority");
});
```

Run `php artisan migrate`.

**Verify**: `php artisan migrate:status` → new migration is ran.

### Step 2: Update Model and Form Requests

1. In `app/Models/Task.php`:
   - Add `'priority'` to `$fillable`.
2. In `app/Http/Requests/StoreTaskRequest.php`:
   - Add `'priority' => ['nullable', 'string', 'in:low,medium,high']`.
3. In `app/Http/Requests/UpdateTaskRequest.php`:
   - Add `'priority' => ['sometimes', 'string', 'in:low,medium,high']`.

**Verify**: `php artisan test --compact tests/Feature/TaskTest.php` → all pass.

### Step 3: Update TypeScript definitions and form hook

1. In `resources/js/types/task.ts`:

```ts
export type TaskPriority = "low" | "medium" | "high";

export interface TaskFormData {
  title: string;
  description: string;
  deadline?: string | null;
  priority?: TaskPriority;
}
```

2. In `resources/js/hooks/use-task-form.ts`:
   - Add `initialPriority?: TaskPriority;` to `UseTaskFormOptions`.
   - Set `priority: options?.initialPriority ?? "medium"` in `useForm<TaskFormData>`.

**Verify**: `bun run types` → exit 0.

### Step 4: Add Priority Selector to Task Form Dialogs

In `resources/js/pages/dashboard/task-form.tsx` and `task-edit-dialog.tsx`:
Add a priority selector using `Select` from `@/components/ui/select` or similar with options: "Low", "Medium", "High" (defaulting to "medium").

**Verify**: `bun run types` → exit 0.

### Step 5: Add Priority Badges and Filter Tabs to TasksTable

In `resources/js/pages/dashboard/tasks-table.tsx`:

1. Add state `const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');`.
2. Add filter tabs (`All`, `Active`, `Completed`) above the table using `Tabs` from `@/components/ui/tabs` or button group.
3. Filter tasks array:
   ```ts
   const filteredTasks = tasks.filter((task) => {
     if (filter === "active") return !task.completed;
     if (filter === "completed") return task.completed;
     return true;
   });
   ```
4. Render colored `Badge` for `task.priority` (`high`: destructive/red/amber, `medium`: secondary/default, `low`: outline/muted).

**Verify**: `bun run build` → exit 0.

### Step 6: Add Tests for Priority

In `tests/Feature/TaskTest.php`:

- Test creating a task with priority `high`.
- Test updating a task priority.
- Test rejecting an invalid priority value (e.g. `urgent`).

**Verify**: `php artisan test --compact tests/Feature/TaskTest.php` → all pass.

### Step 7: Format code with Pint and Prettier

Run:

- `vendor/bin/pint --dirty`
- `bun run format` (or verify types and build)

**Verify**: `php artisan test --compact` full suite passes.

## Test plan

- Run `php artisan test --compact tests/Feature/TaskTest.php`.
- Run full test suite `php artisan test --compact`.
- Run `bun run types`.
- Run `bun run build`.

## Done criteria

- [ ] `priority` column exists in `tasks` table with default `'medium'`
- [ ] Requests reject invalid priorities
- [ ] UI allows selecting priority during create and edit
- [ ] Table renders priority badges and status filter tabs (`All`, `Active`, `Completed`)
- [ ] All tests pass, typecheck passes, and build succeeds

## STOP conditions

- If SQLite default enum / in constraints fail during migration, use string with in-validation.
- If existing tasks fail because priority was null, default `'medium'` must be applied in the migration.

## Maintenance notes

- Priority sorting (e.g. sort by high -> medium -> low) can be added cleanly as an extension to this filter setup.
