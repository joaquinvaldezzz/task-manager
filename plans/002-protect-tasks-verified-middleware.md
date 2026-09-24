# Plan 002: Require Email Verification Middleware on Task Modification Routes

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 03fed30..HEAD -- routes/web.php tests/Feature/TaskTest.php app/Models/User.php`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `03fed30`, 2026-09-24

## Why this matters

The dashboard route (`GET /dashboard`) and several settings routes specify `['auth', 'verified']`. However, two issues currently prevent email verification from actually being enforced:

1. `app/Models/User.php` does not implement `Illuminate\Contracts\Auth\MustVerifyEmail` (it remains commented out from the starter kit). Laravel's `EnsureEmailIsVerified` middleware checks `($request->user() instanceof MustVerifyEmail && ! $request->user()->hasVerifiedEmail())`; without `MustVerifyEmail`, the `verified` middleware is inert across the entire application and allows unverified users through.
2. The task mutation routes (`POST /tasks`, `PUT /tasks/{task}`, `DELETE /tasks/{task}`) only specify `'auth'` rather than sharing the `['auth', 'verified']` group.

Enabling `MustVerifyEmail` on `User` and grouping task routes under `['auth', 'verified']` ensures email verification is genuinely active and consistent for both task access and dashboard access.

## Current state

- In `app/Models/User.php:5-12`:

  ```php
  // use Illuminate\Contracts\Auth\MustVerifyEmail;
  use Database\Factories\UserFactory;
  use Illuminate\Database\Eloquent\Factories\HasFactory;
  use Illuminate\Foundation\Auth\User as Authenticatable;
  use Illuminate\Notifications\Notifiable;
  use Laravel\Fortify\TwoFactorAuthenticatable;

  class User extends Authenticatable
  ```

  `MustVerifyEmail` is commented out.

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

## Commands you will need

| Purpose | Command                                                 | Expected on success |
| ------- | ------------------------------------------------------- | ------------------- |
| Test    | `php artisan test --compact tests/Feature/TaskTest.php` | all pass            |
| Suite   | `php artisan test --compact`                            | all pass            |
| Style   | `vendor/bin/pint --dirty`                               | exit 0              |

## Scope

**In scope**:

- `app/Models/User.php`
- `routes/web.php`
- `tests/Feature/TaskTest.php`

**Out of scope**:

- Do not modify `config/fortify.php` (already has `Features::emailVerification()`).
- Do not modify `routes/settings.php` or `routes/console.php`.
- Do not alter `TaskController` methods.

## Git workflow

- Branch: `advisor/002-protect-tasks-verified-middleware`
- Commit message: `fix(auth): enforce MustVerifyEmail and require verified middleware for tasks`

## Steps

### Step 1: Enable MustVerifyEmail on User model

In `app/Models/User.php`:

1. Uncomment `use Illuminate\Contracts\Auth\MustVerifyEmail;`.
2. Implement `MustVerifyEmail` on the `User` class:
   ```php
   class User extends Authenticatable implements MustVerifyEmail
   ```

**Verify**: `php artisan test --compact tests/Feature/Auth/EmailVerificationTest.php` → all pass.

### Step 2: Group task routes under verified middleware

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

### Step 3: Add test verifying unverified users cannot mutate tasks

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

### Step 4: Verify entire test suite and format with Pint

Run the test suite and Laravel Pint:

- `php artisan test --compact`
- `vendor/bin/pint --dirty`

**Verify**: All tests pass and Pint reports exit 0.

## Test plan

- Run `php artisan test --compact tests/Feature/TaskTest.php`.
- Run full test suite `php artisan test --compact` to verify existing auth and settings tests continue to pass.

## Done criteria

- [ ] `User` class implements `MustVerifyEmail` in `app/Models/User.php`
- [ ] `php artisan route:list --name=tasks` lists `auth, verified` middleware for `tasks.store`, `tasks.update`, `tasks.destroy`
- [ ] `php artisan test --compact tests/Feature/TaskTest.php` passes with unverified test
- [ ] `php artisan test --compact` passes full suite
- [ ] `vendor/bin/pint --dirty` exits 0 with no formatting diffs

## STOP conditions

- If any existing test in `tests/Feature/Auth` fails because of `MustVerifyEmail`, STOP and report.
- If unverified users are intended to create tasks without email verification by product specification (e.g. Fortify email verification feature disabled), STOP and report.

## Maintenance notes

- Any newly added authenticated task or dashboard routes should reside within the `['auth', 'verified']` group.
