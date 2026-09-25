# Plan 017: Add composite index on user_id and created_at to tasks table

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 7481977..HEAD -- database/migrations/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `7481977`, 2026-09-25

## Why this matters

The primary query executed on the dashboard (`TaskController::index`) is `$request->user()->tasks()->latest()->get()`, which compiles to `SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC`. The `tasks` table currently only indexes `user_id` via the foreign key constraint. Without a composite index, the database engine must fetch all user rows and perform an in-memory or filesort on `created_at`. Adding a composite index on `['user_id', 'created_at']` allows the query engine to scan directly in reverse chronological order, accelerating dashboard queries as users accumulate tasks.

## Current state

- `database/migrations/2026_01_19_164509_create_tasks_table.php` defines:
  ```php
  $table->foreignId('user_id')->constrained()->cascadeOnDelete();
  ```
  Only `user_id` has an index.
- `app/Http/Controllers/TaskController.php:18`:
  ```php
  $tasks = $request->user()->tasks()->latest()->get();
  ```
- Sub-query performance is constrained by single-column indexing.

## Commands you will need

| Purpose        | Command                                                                             | Expected on success |
| -------------- | ----------------------------------------------------------------------------------- | ------------------- |
| Make migration | `php artisan make:migration add_user_created_index_to_tasks_table --no-interaction` | exit 0              |
| Run migration  | `php artisan migrate`                                                               | exit 0              |
| Tests          | `php artisan test --compact`                                                        | all tests pass      |
| Pint           | `vendor/bin/pint --test`                                                            | exit 0              |

## Scope

**In scope**:

- New migration file in `database/migrations/` adding composite index `['user_id', 'created_at']` on `tasks` table.

**Out of scope**:

- Do NOT alter existing migration files (they are already committed and run in production/CI).
- Do NOT touch controllers or models.

## Git workflow

- Branch: `advisor/017-task-composite-index`
- Commit message: `perf(db): add composite index on tasks(user_id, created_at)`

## Steps

### Step 1: Create the migration

Run Artisan to generate a migration:

```bash
php artisan make:migration add_user_created_index_to_tasks_table --no-interaction
```

Open the newly created migration file in `database/migrations/` and populate `up` and `down`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->index(['user_id', 'created_at'], 'tasks_user_id_created_at_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropIndex('tasks_user_id_created_at_index');
        });
    }
};
```

**Verify**: Run `php artisan migrate` → exit 0.

### Step 2: Test rollback and re-application

Ensure the migration rolls back and re-applies cleanly:

```bash
php artisan migrate:rollback --step=1
php artisan migrate
```

**Verify**: Both commands exit 0 without errors.

### Step 3: Run Pint formatter and test suite

```bash
vendor/bin/pint
vendor/bin/pint --test
php artisan test --compact
```

**Verify**: All Pint checks and 58+ Pest tests pass.

## Test plan

- Execute migrations:
  - `php artisan migrate`
- Verify index existence in SQLite schema:
  - `php artisan tinker --execute="dump(Illuminate\Support\Facades\Schema::getIndexes('tasks'));"`
  - Verify `tasks_user_id_created_at_index` is listed.
- Ensure all feature tests continue to pass:
  - `php artisan test --compact`

## Done criteria

- [ ] New migration file created and applied.
- [ ] Composite index `['user_id', 'created_at']` registered on `tasks`.
- [ ] Rollback and re-migration succeed cleanly.
- [ ] `vendor/bin/pint --test` exits 0.
- [ ] `php artisan test --compact` exits 0.
- [ ] `plans/README.md` status row updated to `DONE`.

## STOP conditions

- If an index with that name already exists or SQLite errors on duplicate index, check existing indexes using `Schema::getIndexes('tasks')`.
