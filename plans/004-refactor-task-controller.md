# Plan 004: Refactor TaskController with TaskPolicy, Form Requests, and Explicit Return Types

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 0b9ec9c..HEAD -- app/Http/Controllers/TaskController.php`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/003-task-feature-tests.md
- **Category**: tech-debt
- **Planned at**: commit `0b9ec9c`, 2026-09-24

## Why this matters

`TaskController` violates several Laravel and project architectural conventions:

1. Authorization uses raw `abort_if($task->user_id !== ...)` with inconsistent access checks (`$request->user()->id` vs `auth()->id()`) instead of a registered `TaskPolicy`.
2. Validation is embedded inline inside controller actions via `$request->validate()` rather than dedicated Form Request classes.
3. Controller actions lack explicit PHP return type declarations (`Response`, `RedirectResponse`).

Refactoring to standard Laravel policies and Form Requests makes authorization declarative, keeps controllers thin, and makes validation rules reusable and cleanly testable.

## Current state

- In `app/Http/Controllers/TaskController.php:9-55`:

  ```php
  class TaskController extends Controller
  {
    public function index()
    {
      $tasks = auth()->user()->tasks()->latest()->get();

      return Inertia::render("dashboard/index", [
        "tasks" => $tasks,
      ]);
    }

    public function store(Request $request)
    {
      $validated = $request->validate([
        "title" => "required|string|max:255",
        "description" => "nullable|string",
      ]);

      $request->user()->tasks()->create($validated);

      return redirect()->back();
    }

    public function update(Request $request, Task $task)
    {
      abort_if($task->user_id !== $request->user()->id, 403);

      $validated = $request->validate([
        "title" => "sometimes|required|string|max:255",
        "description" => "nullable|string",
        "completed" => "boolean",
      ]);

      $task->update($validated);

      return redirect()->back();
    }

    public function destroy(Task $task)
    {
      abort_if($task->user_id !== auth()->id(), 403);

      $task->delete();

      return redirect()->back();
    }
  }
  ```

- Exemplar Form Requests in project: `app/Http/Requests/Settings/ProfileUpdateRequest.php`.

## Commands you will need

| Purpose | Command                                                 | Expected on success |
| ------- | ------------------------------------------------------- | ------------------- |
| Tests   | `php artisan test --compact tests/Feature/TaskTest.php` | all pass            |
| Style   | `vendor/bin/pint --dirty`                               | exit 0              |

## Scope

**In scope**:

- `app/Policies/TaskPolicy.php` (create)
- `app/Http/Requests/StoreTaskRequest.php` (create)
- `app/Http/Requests/UpdateTaskRequest.php` (create)
- `app/Http/Controllers/TaskController.php`

**Out of scope**:

- Do not change the JSON response format or the Inertia page path (`dashboard/index`).
- Do not modify routes.

## Git workflow

- Branch: `advisor/004-refactor-task-controller-policy-requests`
- Commit message: `refactor(tasks): extract TaskPolicy and FormRequests`

## Steps

### Step 1: Create TaskPolicy

Create `app/Policies/TaskPolicy.php` using `php artisan make:policy TaskPolicy --model=Task --no-interaction`.
Implement `update` and `delete` methods:

```php
<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
  /**
   * Determine whether the user can update the model.
   */
  public function update(User $user, Task $task): bool
  {
    return $user->id === $task->user_id;
  }

  /**
   * Determine whether the user can delete the model.
   */
  public function delete(User $user, Task $task): bool
  {
    return $user->id === $task->user_id;
  }
}
```

In Laravel 12, policies matching `App\Models\{Model}` are automatically discovered.

**Verify**: Policy file exists and compiles without PHP syntax errors.

### Step 2: Create StoreTaskRequest and UpdateTaskRequest

Create `app/Http/Requests/StoreTaskRequest.php` and `app/Http/Requests/UpdateTaskRequest.php`.

In `app/Http/Requests/StoreTaskRequest.php`:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  /**
   * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
   */
  public function rules(): array
  {
    return [
      "title" => ["required", "string", "max:255"],
      "description" => ["nullable", "string"],
    ];
  }
}
```

In `app/Http/Requests/UpdateTaskRequest.php`:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
  public function authorize(): bool
  {
    return $this->user()->can("update", $this->route("task"));
  }

  /**
   * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
   */
  public function rules(): array
  {
    return [
      "title" => ["sometimes", "required", "string", "max:255"],
      "description" => ["nullable", "string"],
      "completed" => ["sometimes", "boolean"],
    ];
  }
}
```

**Verify**: Request classes created and validate properly.

### Step 3: Refactor TaskController

Update `app/Http/Controllers/TaskController.php`:

1. Use `StoreTaskRequest` and `UpdateTaskRequest`.
2. Add authorization via `Gate::authorize('delete', $task)` in `destroy`.
3. Add explicit return type declarations: `: Response` and `: RedirectResponse`.
4. Consistent user fetching via `$request->user()`.

Target shape for `app/Http/Controllers/TaskController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\Task;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
  public function index(Request $request): Response
  {
    $tasks = $request->user()->tasks()->latest()->get();

    return Inertia::render("dashboard/index", [
      "tasks" => $tasks,
    ]);
  }

  public function store(StoreTaskRequest $request): RedirectResponse
  {
    $request->user()->tasks()->create($request->validated());

    return redirect()->back();
  }

  public function update(UpdateTaskRequest $request, Task $task): RedirectResponse
  {
    $task->update($request->validated());

    return redirect()->back();
  }

  public function destroy(Request $request, Task $task): RedirectResponse
  {
    Gate::authorize("delete", $task);

    $task->delete();

    return redirect()->back();
  }
}
```

**Verify**: `php artisan test --compact tests/Feature/TaskTest.php` → all pass.

### Step 4: Pint format check

Run `vendor/bin/pint --dirty` to ensure PSR-12 and Pint standards are satisfied.

**Verify**: `vendor/bin/pint --dirty` exits 0.

## Test plan

- Run `php artisan test --compact tests/Feature/TaskTest.php`.
- Ensure all tests established in Plan 003 continue to pass:
  - Store with validation rules
  - Update with authorization check (403 on unowned task)
  - Destroy with authorization check (403 on unowned task)

## Done criteria

- [ ] `app/Policies/TaskPolicy.php` created and handles `update` and `delete`
- [ ] `app/Http/Requests/StoreTaskRequest.php` and `UpdateTaskRequest.php` created
- [ ] `TaskController` actions have explicit return types (`Response`, `RedirectResponse`)
- [ ] All feature tests in `tests/Feature/TaskTest.php` pass
- [ ] `vendor/bin/pint --dirty` exits 0
- [ ] `plans/README.md` status row updated

## STOP conditions

- If `Gate::authorize()` throws `AuthorizationException` not converted to 403 response in tests, STOP and report.
- If Wayfinder generated routes fail to resolve `TaskController`, run `php artisan wayfinder:generate` and test.

## Maintenance notes

- Any additional task actions in the future (e.g. archiving, duplicating) should declare policy abilities in `TaskPolicy`.
