# Plan 016: Seed realistic sample tasks for local development

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 7481977..HEAD -- database/seeders/DatabaseSeeder.php`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/015-task-factory-priority-and-status-states.md
- **Category**: dx
- **Planned at**: commit `7481977`, 2026-09-25

## Why this matters

When developers run `composer run setup` or `php artisan db:seed`, `DatabaseSeeder` currently creates only a single `User` (`test@example.com`) with 0 tasks. As a result, developers and QA must manually enter tasks, deadlines, and priorities through the UI every time they refresh the SQLite database. Seeding a realistic, diverse set of sample tasks (high/medium/low priority, completed, active, due today, overdue) ensures the dashboard UI is immediately testable and demonstrates all visual states on first launch.

## Current state

- `database/seeders/DatabaseSeeder.php` (lines 15–22):
  ```php
  public function run(): void
  {
      User::factory()->create([
          'name' => 'Test User',
          'email' => 'test@example.com',
      ]);
  }
  ```
- No tasks are created for `test@example.com`.
- `TaskFactory` (enhanced in Plan 015) provides states `highPriority()`, `mediumPriority()`, `lowPriority()`, `completed()`, `incomplete()`, `dueToday()`, `overdue()`.

## Commands you will need

| Purpose        | Command                            | Expected on success |
| -------------- | ---------------------------------- | ------------------- |
| Migrate & Seed | `php artisan migrate:fresh --seed` | exit 0              |
| Tests          | `php artisan test --compact`       | all pass            |
| Pint           | `vendor/bin/pint --test`           | exit 0              |

## Scope

**In scope**:

- `database/seeders/DatabaseSeeder.php`

**Out of scope**:

- Do NOT alter database migrations.
- Do NOT change the credentials of `test@example.com` (password: `password`).

## Git workflow

- Branch: `advisor/016-seed-sample-tasks`
- Commit message: `feat(seeders): seed diverse sample tasks`

## Steps

### Step 1: Update `DatabaseSeeder.php` to seed sample tasks

In `database/seeders/DatabaseSeeder.php`:

1. Import `App\Models\Task`.
2. Create `test@example.com` and attach sample tasks covering multiple scenarios:

   ```php
   public function run(): void
   {
       $user = User::factory()->create([
           'name' => 'Test User',
           'email' => 'test@example.com',
       ]);

       // Active high priority task due today
       Task::factory()->for($user)->highPriority()->dueToday()->create([
           'title' => 'Submit quarterly budget proposal',
           'description' => 'Finalize department headcount and cloud infrastructure estimates.',
       ]);

       // Active medium priority task due in 3 days
       Task::factory()->for($user)->mediumPriority()->create([
           'title' => 'Review pull requests for authentication sprint',
           'description' => 'Check Fortify two-factor flow and session expiration tests.',
           'completed' => false,
           'deadline' => now()->addDays(3)->toDateString(),
       ]);

       // Active low priority task with no deadline
       Task::factory()->for($user)->lowPriority()->incomplete()->create([
           'title' => 'Update developer onboarding documentation',
           'description' => 'Add notes on running Inertia SSR and local SQLite setup.',
           'deadline' => null,
       ]);

       // Overdue task
       Task::factory()->for($user)->highPriority()->overdue()->create([
           'title' => 'Renew domain SSL certificates',
           'description' => 'Ensure automated certbot renewals are operational.',
       ]);

       // Completed tasks
       Task::factory()->for($user)->completed()->mediumPriority()->create([
           'title' => 'Install Tailwind CSS v4 and React 19',
           'description' => 'Completed frontend stack upgrade.',
           'deadline' => now()->subDay()->toDateString(),
       ]);

       Task::factory()->for($user)->completed()->lowPriority()->create([
           'title' => 'Organize desktop folders and archives',
           'description' => 'Cleaned up project scratch directories.',
           'deadline' => null,
       ]);
   }
   ```

**Verify**: Run `php artisan db:seed` → exit 0, tasks table populated.

### Step 2: Format and test

Run Pint and test suite:

```bash
vendor/bin/pint
vendor/bin/pint --test
php artisan test --compact
```

**Verify**: `vendor/bin/pint --test` and `php artisan test --compact` both exit 0.

## Test plan

- Test database seeding execution:
  - Run `php artisan migrate:fresh --seed` → exit 0
  - Run `php artisan tinker --execute="echo App\Models\User::first()->tasks()->count();"` → outputs 6
  - Existing feature tests must continue to pass cleanly (`php artisan test --compact`).

## Done criteria

- [ ] `DatabaseSeeder.php` seeds a realistic set of 6 tasks for `test@example.com`.
- [ ] Tasks include both active and completed, with high, medium, and low priorities, plus varied deadlines.
- [ ] `php artisan migrate:fresh --seed` succeeds without errors.
- [ ] `vendor/bin/pint --test` exits 0.
- [ ] `php artisan test --compact` exits 0.
- [ ] `plans/README.md` status row updated to `DONE`.

## STOP conditions

- If `TaskFactory` states from Plan 015 are missing or throw BadMethodCallException, execute Plan 015 first.
