# Plan 015: Enhance TaskFactory with priority defaults and fluent status states

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 7481977..HEAD -- database/factories/TaskFactory.php tests/Feature/TaskTest.php`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `7481977`, 2026-09-25

## Why this matters

The `TaskFactory` currently omits `priority` from its definition and lacks fluent state helper methods (such as `completed()`, `incomplete()`, `highPriority()`, `overdue()`, `dueToday()`). As a result, tests and database seeders must repeatedly write repetitive attribute arrays (`['priority' => 'high', 'completed' => true]`). Supplying expressive factory states adheres to Laravel best practices and dramatically simplifies building diverse test datasets and seeders.

## Current state

- `database/factories/TaskFactory.php` (lines 19–29):
  ```php
  public function definition(): array
  {
      return [
          'user_id' => User::factory(),
          'title' => $this->faker->sentence(),
          'description' => $this->faker->paragraph(),
          'completed' => $this->faker->boolean(),
          'deadline' => $this->faker->optional()->date(),
      ];
  }
  ```
- Priority column exists in the database schema (`2026_09_25_110935_add_priority_to_tasks_table.php`), with default `'medium'`.
- Exemplar factory with state methods: `database/factories/UserFactory.php` provides `unverified()` and `withTwoFactor()` states:
  ```php
  public function unverified(): static
  {
      return $this->state(
          fn (array $attributes) => [
              'email_verified_at' => null,
          ],
      );
  }
  ```

## Commands you will need

| Purpose | Command                      | Expected on success |
| ------- | ---------------------------- | ------------------- |
| Tests   | `php artisan test --compact` | all tests pass      |
| Pint    | `vendor/bin/pint --test`     | exit 0              |

## Scope

**In scope**:

- `database/factories/TaskFactory.php`
- `tests/Feature/TaskTest.php` (add tests asserting factory state output)

**Out of scope**:

- Do NOT alter `app/Models/Task.php`.
- Do NOT touch database migrations.

## Git workflow

- Branch: `advisor/015-task-factory-states`
- Commit message: `feat(factories): add priority and lifecycle states to TaskFactory`

## Steps

### Step 1: Add default priority and state methods to `TaskFactory.php`

In `database/factories/TaskFactory.php`:

1. Include `'priority' => 'medium'` in `definition()`.
2. Add the following fluent state methods:

   ```php
   public function completed(): static
   {
       return $this->state(fn (array $attributes) => [
           'completed' => true,
       ]);
   }

   public function incomplete(): static
   {
       return $this->state(fn (array $attributes) => [
           'completed' => false,
       ]);
   }

   public function highPriority(): static
   {
       return $this->state(fn (array $attributes) => [
           'priority' => 'high',
       ]);
   }

   public function mediumPriority(): static
   {
       return $this->state(fn (array $attributes) => [
           'priority' => 'medium',
       ]);
   }

   public function lowPriority(): static
   {
       return $this->state(fn (array $attributes) => [
           'priority' => 'low',
       ]);
   }

   public function overdue(): static
   {
       return $this->state(fn (array $attributes) => [
           'completed' => false,
           'deadline' => now()->subDays(3)->toDateString(),
       ]);
   }

   public function dueToday(): static
   {
       return $this->state(fn (array $attributes) => [
           'completed' => false,
           'deadline' => now()->toDateString(),
       ]);
   }
   ```

**Verify**: Run `php artisan test --compact tests/Feature/TaskTest.php` to ensure existing tests still pass.

### Step 2: Add factory test assertions in `tests/Feature/TaskTest.php`

In `tests/Feature/TaskTest.php`, add test cases covering the new states:

```php
test('task factory produces default priority and supports state helpers', function () {
    $defaultTask = Task::factory()->create();
    expect($defaultTask->priority)->toBe('medium');

    $completedHighTask = Task::factory()->completed()->highPriority()->create();
    expect($completedHighTask->completed)->toBeTrue()
        ->and($completedHighTask->priority)->toBe('high');

    $overdueTask = Task::factory()->overdue()->create();
    expect($overdueTask->completed)->toBeFalse()
        ->and($overdueTask->deadline)->not->toBeNull();
});
```

**Verify**: `php artisan test --compact --filter=factory` → pass.

### Step 3: Run Pint formatter check

Format and check PHP files:

```bash
vendor/bin/pint
vendor/bin/pint --test
```

**Verify**: `vendor/bin/pint --test` exits 0.

## Test plan

- Test coverage:
  - Verify default priority is `'medium'`.
  - Verify `completed()`, `incomplete()`, `highPriority()`, `lowPriority()`, `overdue()`, `dueToday()` set the correct model attributes.
- Command: `php artisan test --compact tests/Feature/TaskTest.php`

## Done criteria

- [ ] `TaskFactory` defines `'priority' => 'medium'`.
- [ ] `TaskFactory` includes `completed()`, `incomplete()`, `highPriority()`, `mediumPriority()`, `lowPriority()`, `overdue()`, `dueToday()`.
- [ ] New factory test passes in `tests/Feature/TaskTest.php`.
- [ ] `vendor/bin/pint --test` exits 0.
- [ ] `php artisan test --compact` exits 0.
- [ ] `plans/README.md` status row updated to `DONE`.

## STOP conditions

- If existing tests fail due to `'priority' => 'medium'`, inspect test assertions expecting `null` priority.
