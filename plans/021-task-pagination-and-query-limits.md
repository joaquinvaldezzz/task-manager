# Plan 021: Implement pagination and bounded loading for dashboard tasks

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 7481977..HEAD -- app/Http/Controllers/TaskController.php resources/js/pages/dashboard/index.tsx resources/js/pages/dashboard/tasks-table.tsx tests/Feature/TaskTest.php`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: M
- **Risk**: MED
- **Depends on**: plans/017-task-composite-index.md
- **Category**: perf
- **Planned at**: commit `7481977`, 2026-09-25

## Why this matters

`TaskController::index` currently executes `$request->user()->tasks()->latest()->get()`, fetching all historical tasks in a single query and transmitting the entire payload to the client on every dashboard request. As a user creates hundreds or thousands of tasks, this unbounded data transfer degrades response time, increases server memory consumption, and blows up client DOM size. Implementing pagination (e.g. 25 tasks per page) ensures predictable performance and payload sizing.

## Current state

- `app/Http/Controllers/TaskController.php` (lines 16–23):

  ```php
  public function index(Request $request): Response
  {
      $tasks = $request->user()->tasks()->latest()->get();

      return Inertia::render('dashboard/index', [
          'tasks' => $tasks,
      ]);
  }
  ```

- `resources/js/pages/dashboard/index.tsx`:
  ```tsx
  interface DashboardProps {
    tasks: Task[];
  }
  ```
- `tests/Feature/TaskTest.php` (lines 20–30):
  ```php
  $this->actingAs($user)
      ->get(route('dashboard'))
      ->assertInertia(
          fn (Assert $page) => $page
              ->component('dashboard/index')
              ->has('tasks', 3)
              ->where('tasks.0.id', $task3->id)
              ->where('tasks.1.id', $task2->id)
              ->where('tasks.2.id', $task1->id),
      );
  ```
  Tests assert `'tasks'` as a collection.

## Commands you will need

| Purpose   | Command                                                 | Expected on success |
| --------- | ------------------------------------------------------- | ------------------- |
| Tests     | `php artisan test --compact tests/Feature/TaskTest.php` | all pass            |
| Typecheck | `npm run types`                                         | exit 0, no errors   |
| Lint      | `npm run lint`                                          | exit 0              |
| Pint      | `vendor/bin/pint --test`                                | exit 0              |

## Scope

**In scope**:

- `app/Http/Controllers/TaskController.php`
- `resources/js/pages/dashboard/index.tsx`
- `resources/js/pages/dashboard/tasks-table.tsx`
- `resources/js/types/task.ts`
- `tests/Feature/TaskTest.php`

**Out of scope**:

- Do NOT alter task create, update, or delete endpoints.
- Do NOT alter auth or settings controllers.

## Git workflow

- Branch: `advisor/021-task-pagination`
- Commit message: `perf(tasks): paginate dashboard task list with pagination controls`

## Steps

### Step 1: Update `TaskController::index` to paginate

In `app/Http/Controllers/TaskController.php`:
Use Laravel's standard paginator (e.g., `paginate(25)` or `fastPaginate(25)`):

```php
public function index(Request $request): Response
{
    $tasks = $request->user()->tasks()->latest()->paginate(25)->withQueryString();

    return Inertia::render('dashboard/index', [
        'tasks' => $tasks,
    ]);
}
```

**Verify**: `php artisan test --compact tests/Feature/TaskTest.php` (will indicate any pagination structure mismatch).

### Step 2: Update TypeScript types and frontend props

1. In `resources/js/types/task.ts` (or `resources/js/types/index.d.ts`), define paginated response shape:
   ```ts
   export interface PaginatedData<T> {
     data: T[];
     current_page: number;
     last_page: number;
     per_page: number;
     total: number;
     prev_page_url: string | null;
     next_page_url: string | null;
     links: {
       url: string | null;
       label: string;
       active: boolean;
     }[];
   }
   ```
2. In `resources/js/pages/dashboard/index.tsx`:
   Update `DashboardProps`:
   ```tsx
   interface DashboardProps {
     tasks: PaginatedData<Task>;
   }
   ```
   Pass `tasks.data` or the paginated object to `TasksTable`:
   ```tsx
   <TasksTable tasks={tasks.data} pagination={tasks} />
   ```
3. In `resources/js/pages/dashboard/tasks-table.tsx`:
   Add pagination links at the bottom of the table using Inertia `<Link href={link.url}>` or the `Pagination` component from `@/components/ui/pagination`.

**Verify**: `npm run types` → exit 0.

### Step 3: Update `TaskTest.php` to assert paginated Inertia structure

In `tests/Feature/TaskTest.php`:
Update the dashboard test assertion to check `tasks.data`:

```php
$this->actingAs($user)
    ->get(route('dashboard'))
    ->assertInertia(
        fn (Assert $page) => $page
            ->component('dashboard/index')
            ->has('tasks.data', 3)
            ->where('tasks.data.0.id', $task3->id)
            ->where('tasks.data.1.id', $task2->id)
            ->where('tasks.data.2.id', $task1->id),
    );
```

**Verify**: `php artisan test --compact tests/Feature/TaskTest.php` → all pass.

### Step 4: Run Pint, typecheck, and full test suite

```bash
vendor/bin/pint
vendor/bin/pint --test
npm run types
npm run lint
php artisan test --compact
```

**Verify**: All checks exit 0.

## Test plan

- Test coverage:
  - Verify dashboard loads 25 tasks per page and provides pagination links.
  - Verify navigating between pages retains filters via `withQueryString()`.
  - Feature test verifies paginated `tasks.data` structure.
- Command: `php artisan test --compact tests/Feature/TaskTest.php`

## Done criteria

- [ ] `TaskController::index` paginates task queries at 25 items per page.
- [ ] Frontend displays pagination controls when multiple pages exist.
- [ ] Inertia test asserts `tasks.data` correctly.
- [ ] `npm run types` exits 0.
- [ ] `npm run lint` exits 0.
- [ ] `vendor/bin/pint --test` exits 0.
- [ ] `php artisan test --compact` exits 0.
- [ ] `plans/README.md` status row updated to `DONE`.

## STOP conditions

- If pagination disrupts `TaskSummaryCards`, pass separate aggregate counts or ensure metrics calculate from user statistics directly.
