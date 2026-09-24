# Plan 002: Require Email Verification Middleware on Task Modification Routes

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 0b9ec9c..HEAD -- routes/web.php tests/Feature/TaskTest.php`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `0b9ec9c`, 2026-09-24

## Why this matters

The dashboard route (`GET /dashboard`) is protected by `['auth', 'verified']`, which stops unverified users from viewing the interface. However, the task mutation routes (`POST /tasks`, `PUT /tasks/{task}`, `DELETE /tasks/{task}`) only require `'auth'`. An unverified user can bypass the email verification gate entirely by submitting HTTP requests directly to the task endpoints to create, modify, or delete tasks. Aligning the task mutation routes under the `['auth', 'verified']` middleware ensures access control consistency across the application.

## Current state

- In `routes/web.php:14-22`:

  ```php
  Route::middleware(["auth", "verified"])->group(function () {
    Route::get("dashboard", [TaskController::class, "index"])->name("dashboard");
  });

  Route::middleware("auth")->group(function () {
    Route::post("/tasks", [TaskController::class, "store"])->name("tasks.store");
    Route::put("/tasks/{task}", [TaskController::class, "update"])->name("tasks.update");
    Route::delete("/tasks/{task}", [TaskController::class, "destroy"])->name("tasks.destroy");
  });
  ```

  The task mutations are in a separate `auth` group rather than sharing the `['auth', 'verified']` group.

## Commands you will need

| Purpose | Command                                                 | Expected on success |
| ------- | ------------------------------------------------------- | ------------------- |
| Test    | `php artisan test --compact tests/Feature/TaskTest.php` | all pass            |
| Style   | `vendor/bin/pint --dirty`                               | exit 0              |

## Scope

**In scope**:

- `routes/web.php`
- `tests/Feature/TaskTest.php`

**Out of scope**:

- Do not modify `routes/settings.php` or `routes/console.php`.
- Do not alter `TaskController` methods.

## Git workflow

- Branch: `advisor/002-protect-tasks-verified-middleware`
- Commit message: `fix(auth): require email verification for task mutations`

## Steps

### Step 1: Group task routes under verified middleware

In `routes/web.php`:
Consolidate the dashboard route and all task mutation routes (`tasks.store`, `tasks.update`, `tasks.destroy`) into the single `['auth', 'verified']` middleware group.

Target shape in `routes/web.php`:

```php
Route::middleware(["auth", "verified"])->group(function () {
  Route::get("dashboard", [TaskController::class, "index"])->name("dashboard");
  Route::post("/tasks", [TaskController::class, "store"])->name("tasks.store");
  Route::put("/tasks/{task}", [TaskController::class, "update"])->name("tasks.update");
  Route::delete("/tasks/{task}", [TaskController::class, "destroy"])->name("tasks.destroy");
});
```

**Verify**: `php artisan route:list --name=tasks` → confirm all task routes show `auth` and `verified` middleware.

### Step 2: Add test verifying unverified users cannot mutate tasks

In `tests/Feature/TaskTest.php`:
Add a test ensuring an unverified user cannot perform task mutations:

```php
test("unverified users cannot create tasks", function () {
  $user = User::factory()->unverified()->create();

  $this->actingAs($user)
    ->post(route("tasks.store"), [
      "title" => "Test Task",
    ])
    ->assertRedirect(route("verification.notice"));
});
```

**Verify**: `php artisan test --compact tests/Feature/TaskTest.php` → all pass.

### Step 3: Format code with Pint

Run Laravel Pint on modified files:

**Verify**: `vendor/bin/pint --dirty` → exit 0.

## Test plan

- Run `php artisan test --compact tests/Feature/TaskTest.php`.
- Verify that unverified user receives a redirect to `verification.notice`.
- Verify existing test `test('dashboard displays tasks')` still passes.

## Done criteria

- [ ] `php artisan route:list --name=tasks` lists `auth, verified` middleware for `tasks.store`, `tasks.update`, `tasks.destroy`
- [ ] `php artisan test --compact tests/Feature/TaskTest.php` passes with new unverified check
- [ ] `vendor/bin/pint --dirty` exits 0 with no formatting diffs
- [ ] `plans/README.md` status row updated

## STOP conditions

- If unverified users are intended to create tasks without email verification by product specification (e.g. Fortify email verification feature disabled), STOP and report.
- If existing tests fail due to factory unverified defaults, STOP and report.

## Maintenance notes

- Any newly added task routes (e.g. bulk operations, tags) should be added inside this verified group.
