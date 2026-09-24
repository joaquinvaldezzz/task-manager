# Plan 003: Add Comprehensive Feature Tests for Task CRUD, Authorization, and Validation

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat dc6cd4e..HEAD -- tests/Feature/TaskTest.php`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `dc6cd4e`, 2026-09-24

## Why this matters

The core capability of this application is managing tasks. Today, `tests/Feature/TaskTest.php` only tests dashboard rendering and unverified user redirection. There is zero automated test coverage for:

1. Creating a task (`tasks.store`)
2. Updating a task title, description, or completed status (`tasks.update`)
3. Preventing users from modifying or deleting another user's tasks (authorization)
4. Deleting a task (`tasks.destroy`)
5. Validation failures on empty or invalid inputs

Without these tests, any refactoring of `TaskController`, policy authorization, or request validation poses an immediate risk of regression. Establishing this test baseline is a prerequisite for Plan 004.

## Current state

`tests/Feature/TaskTest.php:1-41` contains:

```php
<?php

use App\Models\Task;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test("dashboard displays tasks", function () {
  $user = User::factory()->create();

  $task1 = Task::factory()->create([
    "user_id" => $user->id,
    "created_at" => now()->subMinutes(10),
  ]);
  $task2 = Task::factory()->create([
    "user_id" => $user->id,
    "created_at" => now()->subMinutes(5),
  ]);
  $task3 = Task::factory()->create(["user_id" => $user->id, "created_at" => now()]);

  $this->actingAs($user)
    ->get(route("dashboard"))
    ->assertInertia(
      fn(Assert $page) => $page
        ->component("dashboard/index")
        ->has("tasks", 3)
        ->where("tasks.0.id", $task3->id)
        ->where("tasks.1.id", $task2->id)
        ->where("tasks.2.id", $task1->id),
    );
});

test("unverified users cannot create tasks", function () {
  $user = User::factory()->unverified()->create();

  $this->actingAs($user)
    ->post(route("tasks.store"), [
      "title" => "Test Task",
    ])
    ->assertRedirect(route("verification.notice"));
});
```

## Commands you will need

| Purpose | Command                                                 | Expected on success |
| ------- | ------------------------------------------------------- | ------------------- |
| Tests   | `php artisan test --compact tests/Feature/TaskTest.php` | all pass            |
| Style   | `vendor/bin/pint --dirty`                               | exit 0              |

## Scope

**In scope**:

- `tests/Feature/TaskTest.php`

**Out of scope**:

- Do not modify `app/Http/Controllers/TaskController.php` in this plan.
- Do not modify routes or models.

## Git workflow

- Branch: `advisor/003-task-feature-tests`
- Commit message: `test(tasks): add feature tests for task CRUD` (45 chars <= 50)

## Steps

### Step 1: Add store tests (happy path, validation, and guest)

In `tests/Feature/TaskTest.php`, add:

- `test('authenticated user can create a task', ...)`:
  Assert redirect back, assert task exists in database with matching `title`, `description`, `user_id`, and `completed = false`. Note: since `User` implements `MustVerifyEmail`, ensure the user is verified (default `User::factory()->create()` is verified).
- `test('task creation requires title', ...)`:
  Send empty title, assert session has errors for `'title'`.
- `test('task title cannot exceed 255 characters', ...)`:
  Send 256-character string, assert session has errors for `'title'`.
- `test('guests cannot create tasks', ...)`:
  Assert redirect to `login`.

**Verify**: `php artisan test --compact --filter=create` → all pass.

### Step 2: Add update tests (happy path, authorization, and validation)

In `tests/Feature/TaskTest.php`, add:

- `test('user can update their own task', ...)`:
  Update title, description, and `completed => true`. Assert redirect back, assert database record updated.
- `test('user cannot update another user task', ...)`:
  Create User A and User B. User B attempts `put(route('tasks.update', $taskOfUserA), [...])`. Assert forbidden status (`assertForbidden()`).
- `test('task update validation requires title when present', ...)`:
  Attempt update with `'title' => ''`. Assert session has errors for `'title'`.

**Verify**: `php artisan test --compact --filter=update` → all pass.

### Step 3: Add destroy tests (happy path and authorization)

In `tests/Feature/TaskTest.php`, add:

- `test('user can delete their own task', ...)`:
  User deletes task via `delete(route('tasks.destroy', $task))`. Assert redirect back, assert model missing from database (`assertModelMissing($task)`).
- `test('user cannot delete another user task', ...)`:
  User B attempts `delete(route('tasks.destroy', $taskOfUserA))`. Assert forbidden (`assertForbidden()`), assert model still exists in database.

**Verify**: `php artisan test --compact tests/Feature/TaskTest.php` → all pass.

### Step 4: Run Pint formatter

Run `vendor/bin/pint --dirty` to ensure strict conformity with formatting rules.

**Verify**: `vendor/bin/pint --dirty` → exit 0.

## Test plan

- Execute full task feature test file:
  `php artisan test --compact tests/Feature/TaskTest.php`
- Confirm all 9+ distinct tests pass:
  1. `dashboard displays tasks`
  2. `unverified users cannot create tasks`
  3. `authenticated user can create a task`
  4. `task creation requires title`
  5. `task title cannot exceed 255 characters`
  6. `guests cannot create tasks`
  7. `user can update their own task`
  8. `user cannot update another user task`
  9. `task update validation requires title when present`
  10. `user can delete their own task`
  11. `user cannot delete another user task`

## Done criteria

- [ ] All 9+ feature tests in `tests/Feature/TaskTest.php` pass cleanly
- [ ] Pest assertion `assertForbidden()` used instead of `assertStatus(403)` (per Pest conventions)
- [ ] `vendor/bin/pint --dirty` exits 0

## STOP conditions

- If any endpoint returns unexpected status codes on current code (e.g. 500 instead of 403 or redirect), STOP and report.
- If sqlite foreign key cascade constraints prevent clean cleanup in test transactions, STOP and report.

## Maintenance notes

- When Plan 004 refactors authorization to use `TaskPolicy`, this test suite will serve as the verification gate to confirm zero behavioral regressions.
