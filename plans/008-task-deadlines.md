# Plan 008: Implement Task Deadlines with Calendar Date Picker

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 0b9ec9c..HEAD -- app/Models/Task.php resources/js/types/task.ts resources/js/pages/dashboard/task-form.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: M
- **Risk**: MED
- **Depends on**: plans/003-task-feature-tests.md, plans/004-refactor-task-controller.md
- **Category**: direction
- **Planned at**: commit `0b9ec9c`, 2026-09-24

## Why this matters

The repository already contains preparations for task deadlines: `resources/js/types/task.ts` specifies `deadline?: string`, `react-day-picker` and `date-fns` are installed, commit `44c103e` added `resources/js/components/ui/calendar.tsx`, and `tasks-table.tsx` displays created/modified dates. However, the database schema, model, validation, and forms lack `deadline` support. Completing this feature lets users set and modify due dates for their tasks and view upcoming deadlines in the table.

## Current state

- In `resources/js/types/task.ts:1-17`:

  ```ts
  export interface Task {
    id: number;
    title: string;
    description?: string;
    deadline?: string;
    priority?: "low" | "medium" | "high";
    labels?: string[];
    completed: boolean;
    created_at: string;
    updated_at: string;
  }

  export interface TaskFormData {
    title: string;
    description: string;
  }
  ```

- In `database/migrations/2026_01_19_164509_create_tasks_table.php:18-22`:
  The table has `title`, `description`, `completed`, `timestamps()`, but no `deadline` column.
- In `app/Models/Task.php`:
  `$fillable` only contains `['title', 'description', 'completed']`.
- Calendar component exists at `resources/js/components/ui/calendar.tsx`. Popover component exists at `resources/js/components/ui/popover.tsx`.

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

- Create migration `add_deadline_to_tasks_table`
- `app/Models/Task.php` (add `deadline` to `$fillable` and `casts`)
- `database/factories/TaskFactory.php` (add optional `deadline`)
- `app/Http/Requests/StoreTaskRequest.php` and `UpdateTaskRequest.php` (validate `deadline` as nullable date)
- `resources/js/types/task.ts` (add `deadline?: string | null` to `TaskFormData`)
- `resources/js/pages/dashboard/task-form.tsx` (add date picker)
- `resources/js/pages/dashboard/task-edit-dialog.tsx` (add date picker)
- `resources/js/pages/dashboard/tasks-table.tsx` (display deadline column)
- `tests/Feature/TaskTest.php` (test creating and updating tasks with deadlines)

**Out of scope**:

- Recurring tasks or reminder notifications.
- Do not modify other settings or auth pages.

## Git workflow

- Branch: `advisor/008-task-deadlines`
- Commit message: `feat(tasks): support task deadlines with calendar picker`

## Steps

### Step 1: Create migration adding deadline column

Run `php artisan make:migration add_deadline_to_tasks_table --table=tasks --no-interaction`.
In the migration `up` method:

```php
Schema::table("tasks", function (Blueprint $table) {
  $table->date("deadline")->nullable()->after("completed");
});
```

In `down`:

```php
Schema::table("tasks", function (Blueprint $table) {
  $table->dropColumn("deadline");
});
```

Run `php artisan migrate`.

**Verify**: `php artisan migrate:status` → new migration is ran.

### Step 2: Update Task model and Form Requests

1. In `app/Models/Task.php`:
   - Add `'deadline'` to `$fillable`.
   - In `casts()`: add `'deadline' => 'date:Y-m-d'`.
2. In `app/Http/Requests/StoreTaskRequest.php`:
   - Add `'deadline' => ['nullable', 'date']`.
3. In `app/Http/Requests/UpdateTaskRequest.php`:
   - Add `'deadline' => ['nullable', 'date']`.

**Verify**: `php artisan test --compact tests/Feature/TaskTest.php` → exits 0.

### Step 3: Update TypeScript definitions

In `resources/js/types/task.ts`:
Update `TaskFormData`:

```ts
export interface TaskFormData {
  title: string;
  description: string;
  deadline?: string | null;
}
```

**Verify**: `bun run types` → exits 0.

### Step 4: Add Calendar Date Picker to TaskForm and TaskEditDialog

1. In `resources/js/pages/dashboard/task-form.tsx`:
   - Import `Popover`, `PopoverTrigger`, `PopoverContent` from `@/components/ui/popover`.
   - Import `Calendar` from `@/components/ui/calendar`.
   - Add deadline picker field in `DialogPanel`.
   - On date select: format as `yyyy-MM-dd` via `date-fns` `format()` and set `data.deadline`.
2. In `resources/js/pages/dashboard/task-edit-dialog.tsx`:
   - Add the same calendar date picker, initialized with `task.deadline`.

**Verify**: `bun run types` → exit 0, `bun run build` → exit 0.

### Step 5: Display Deadline in TasksTable

In `resources/js/pages/dashboard/tasks-table.tsx`:
Add a "Due" column in the table between "Task" and "Created", displaying formatted `format(new Date(task.deadline), "MMM d")` or "—" if null.

**Verify**: `bun run build` → exits 0.

### Step 6: Add backend tests for deadline

In `tests/Feature/TaskTest.php`:

- Add test: `test('user can create a task with a deadline', ...)`
- Add test: `test('user can update a task deadline', ...)`

**Verify**: `php artisan test --compact tests/Feature/TaskTest.php` → all pass.

## Test plan

- Execute `php artisan test --compact tests/Feature/TaskTest.php`.
- Execute `bun run types`.
- Execute `bun run build`.

## Done criteria

- [ ] `deadline` column exists in `tasks` database table
- [ ] `Task` model has `deadline` in `$fillable` and `casts()`
- [ ] Form requests validate `deadline` as nullable date
- [ ] `TaskForm` and `TaskEditDialog` allow selecting a deadline date
- [ ] `TasksTable` displays the deadline
- [ ] `tests/Feature/TaskTest.php` contains passing tests for deadlines
- [ ] `bun run types` and `bun run build` exit 0
- [ ] `plans/README.md` status row updated

## STOP conditions

- If `react-day-picker` version installed has breaking API changes with `components/ui/calendar.tsx`, STOP and report.
- If timezone parsing offsets dates incorrectly, use standard UTC/ISO date strings (`YYYY-MM-DD`).

## Maintenance notes

- Future filtering (e.g. "Due today", "Overdue") can build directly upon this `deadline` column.
