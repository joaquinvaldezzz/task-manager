# Plan 022: Implement task labels and tagging system

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 7481977..HEAD -- resources/js/types/task.ts app/Models/Task.php app/Http/Requests/StoreTaskRequest.php app/Http/Requests/UpdateTaskRequest.php`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plans/011-fix-eslint-nested-ternary-and-clean-nav-user.md, plans/013-task-edit-dialog-state-sync.md
- **Category**: direction
- **Planned at**: commit `7481977`, 2026-09-25

## Why this matters

The TypeScript interface for tasks in `resources/js/types/task.ts` already specifies `labels?: string[];`, demonstrating clear unfinished product intent. However, no database migration, model casting, request validation, or frontend tag input was ever wired up. Completing the labels feature allows users to tag tasks with categories (e.g., `bug`, `design`, `work`, `home`) and display visual pill badges in the task list.

## Current state

- `resources/js/types/task.ts` (lines 3–13):
  ```ts
  export interface Task {
    id: number;
    title: string;
    description?: string;
    deadline?: string;
    priority?: TaskPriority;
    labels?: string[];
    completed: boolean;
    created_at: string;
    updated_at: string;
  }
  ```
- `app/Models/Task.php` lacks `labels` in `$fillable` and `casts()`.
- Database table `tasks` has no `labels` column.
- `StoreTaskRequest` and `UpdateTaskRequest` do not accept `labels`.

## Commands you will need

| Purpose        | Command                                                                 | Expected on success |
| -------------- | ----------------------------------------------------------------------- | ------------------- |
| Make migration | `php artisan make:migration add_labels_to_tasks_table --no-interaction` | exit 0              |
| Migrate        | `php artisan migrate`                                                   | exit 0              |
| Tests          | `php artisan test --compact tests/Feature/TaskTest.php`                 | all pass            |
| Typecheck      | `npm run types`                                                         | exit 0, no errors   |
| Lint           | `npm run lint`                                                          | exit 0              |
| Pint           | `vendor/bin/pint --test`                                                | exit 0              |

## Scope

**In scope**:

- Migration: `add_labels_to_tasks_table` (adds JSON nullable `labels` column to `tasks`)
- `app/Models/Task.php` (casts `labels => 'array'` and adds to `$fillable`)
- `app/Http/Requests/StoreTaskRequest.php` & `UpdateTaskRequest.php`
- `resources/js/types/task.ts` (ensure `TaskFormData` includes `labels?: string[]`)
- `resources/js/pages/dashboard/tasks-table.tsx` (display label badges)
- `resources/js/pages/dashboard/task-form.tsx` & `task-edit-dialog.tsx` (label input)
- `tests/Feature/TaskTest.php`

**Out of scope**:

- Do NOT create a separate many-to-many labels table (a JSON column matches lightweight project requirements).

## Git workflow

- Branch: `advisor/022-task-labels`
- Commit message: `feat(tasks): implement task labels system with json column and badge tags`

## Steps

### Step 1: Create migration and update model

1. Generate migration:
   ```bash
   php artisan make:migration add_labels_to_tasks_table --no-interaction
   ```
2. Populate migration:

   ```php
   public function up(): void
   {
       Schema::table('tasks', function (Blueprint $table) {
           $table->json('labels')->nullable()->after('priority');
       });
   }

   public function down(): void
   {
       Schema::table('tasks', function (Blueprint $table) {
           $table->dropColumn('labels');
       });
   }
   ```

3. Run `php artisan migrate`.
4. In `app/Models/Task.php`:
   - Add `'labels'` to `$fillable`.
   - Add `'labels' => 'array'` to `casts()`.

**Verify**: `php artisan migrate` → exit 0.

### Step 2: Update Form Requests and write feature tests

1. In `app/Http/Requests/StoreTaskRequest.php` and `UpdateTaskRequest.php`:
   Add:
   ```php
   'labels' => ['nullable', 'array'],
   'labels.*' => ['string', 'max:50'],
   ```
2. In `tests/Feature/TaskTest.php`:
   Add test:

   ```php
   test('user can create and update task with labels', function () {
       $user = User::factory()->create();

       $this->actingAs($user)->post(route('tasks.store'), [
           'title' => 'Task with tags',
           'labels' => ['work', 'urgent'],
       ])->assertRedirect(route('dashboard'));

       $task = Task::where('title', 'Task with tags')->firstOrFail();
       expect($task->labels)->toBe(['work', 'urgent']);
   });
   ```

**Verify**: `php artisan test --compact --filter=labels` → pass.

### Step 3: Update frontend types and forms

1. In `resources/js/types/task.ts`:
   Add `labels?: string[];` to `TaskFormData`.
2. In `resources/js/pages/dashboard/tasks-table.tsx`:
   Render labels next to or below task title as small outline badges:
   ```tsx
   {
     task.labels && task.labels.length > 0 && (
       <div className="mt-1 flex flex-wrap gap-1">
         {task.labels.map((label) => (
           <span
             key={label}
             className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
           >
             #{label}
           </span>
         ))}
       </div>
     );
   }
   ```
3. In `resources/js/pages/dashboard/task-form.tsx` and `task-edit-dialog.tsx`:
   Add a comma-separated text input for labels that converts comma-separated strings to `string[]` on submit or change.

**Verify**: `npm run types && npm run lint` → exit 0.

### Step 4: Run full verification

```bash
vendor/bin/pint
vendor/bin/pint --test
npm run types
npm run lint
php artisan test --compact
```

**Verify**: All checks exit 0.

## Test plan

- Feature test verifying storing and updating array of labels in SQLite JSON column.
- Validation rejects non-array or oversized label entries.
- TypeScript compiler verifies `labels` type consistency.
- Command: `php artisan test --compact tests/Feature/TaskTest.php`

## Done criteria

- [ ] `labels` JSON column migrated on `tasks` table.
- [ ] `Task` model casts `labels` to `array`.
- [ ] Requests validate `labels` as an array of strings.
- [ ] Feature tests pass covering task label creation and updates.
- [ ] Badges render in `TasksTable`.
- [ ] `npm run types` exits 0.
- [ ] `npm run lint` exits 0.
- [ ] `vendor/bin/pint --test` exits 0.
- [ ] `php artisan test --compact` exits 0.
- [ ] `plans/README.md` status row updated to `DONE`.

## STOP conditions

- If SQLite version does not support JSON columns, use `text` with serialized array cast.
