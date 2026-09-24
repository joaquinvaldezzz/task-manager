# Plan 007: Modernize Task and User Model Relationship Types and Casts Method

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 0b9ec9c..HEAD -- app/Models/Task.php app/Models/User.php`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `0b9ec9c`, 2026-09-24

## Why this matters

Laravel 12 standards and project guidelines specify:

1. "Casts can and likely should be set in a `casts()` method on a model rather than the `$casts` property."
2. "Always use explicit return type declarations for methods and functions. Use appropriate PHP type hints for method parameters."
3. "Always use proper Eloquent relationship methods with return type hints (`BelongsTo`, `HasMany`)."

Currently, `app/Models/Task.php` still uses the legacy `$casts` property while `app/Models/User.php` uses `casts(): array`. Furthermore, neither `Task::user()` nor `User::tasks()` defines a return type hint, degrading IDE autocompletion and static analysis.

## Current state

- In `app/Models/Task.php:12-22`:

  ```php
  protected $fillable = ['title', 'description', 'completed'];

  protected $casts = [
      'completed' => 'boolean',
  ];

  public function user()
  {
      return $this->belongsTo(User::class);
  }
  ```

- In `app/Models/User.php:36-39`:
  ```php
  public function tasks()
  {
      return $this->hasMany(Task::class);
  }
  ```

## Commands you will need

| Purpose | Command                      | Expected on success |
| ------- | ---------------------------- | ------------------- |
| Tests   | `php artisan test --compact` | all pass            |
| Style   | `vendor/bin/pint --dirty`    | exit 0              |

## Scope

**In scope**:

- `app/Models/Task.php`
- `app/Models/User.php`

**Out of scope**:

- Do not alter table schemas or migrations.
- Do not modify factories or seeders.

## Git workflow

- Branch: `advisor/007-modernize-model-casts-and-relations`
- Commit message: `refactor(models): adopt casts method and relationship return types`

## Steps

### Step 1: Update Task model

In `app/Models/Task.php`:

1. Import `Illuminate\Database\Eloquent\Relations\BelongsTo`.
2. Replace `protected $casts = [...]` with `protected function casts(): array { return ['completed' => 'boolean']; }`.
3. Add return type `BelongsTo` to `public function user(): BelongsTo`.

Target shape for `app/Models/Task.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
  use HasFactory;

  protected $fillable = ["title", "description", "completed"];

  /**
   * Get the attributes that should be cast.
   *
   * @return array<string, string>
   */
  protected function casts(): array
  {
    return [
      "completed" => "boolean",
    ];
  }

  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class);
  }
}
```

**Verify**: `php artisan test --compact` → all pass.

### Step 2: Update User model tasks relationship

In `app/Models/User.php`:

1. Import `Illuminate\Database\Eloquent\Relations\HasMany`.
2. Add `: HasMany` return type hint to `tasks()` method:
   ```php
   public function tasks(): HasMany
   {
       return $this->hasMany(Task::class);
   }
   ```

**Verify**: `php artisan test --compact` → all pass.

### Step 3: Run Pint formatter

Run `vendor/bin/pint --dirty` to ensure formatting complies with project style.

**Verify**: `vendor/bin/pint --dirty` exits 0.

## Test plan

- Run `php artisan test --compact`.
- Confirm tests relating to users, tasks, and factories pass without regressions.

## Done criteria

- [ ] `Task.php` uses `casts(): array` method instead of `$casts` property
- [ ] `Task::user()` has `: BelongsTo` return type hint
- [ ] `User::tasks()` has `: HasMany` return type hint
- [ ] `php artisan test --compact` exits 0
- [ ] `vendor/bin/pint --dirty` exits 0
- [ ] `plans/README.md` status row updated

## STOP conditions

- If `php artisan test` fails because of relationship invocation mismatch, STOP and report.

## Maintenance notes

- Any newly added attributes that require casting (e.g. `deadline` => `'date'`) will be added to `Task::casts()`.
