# Plan 020: Add task summary metric cards to dashboard

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 7481977..HEAD -- resources/js/pages/dashboard/index.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/011-fix-eslint-nested-ternary-and-clean-nav-user.md
- **Category**: direction
- **Planned at**: commit `7481977`, 2026-09-25

## Why this matters

The `/dashboard` route is titled "Dashboard" but currently displays only an "Add task" trigger and the tasks table. Users must manually scan the table to gauge their current workload, overdue deadlines, and high-priority items. Presenting a concise summary metric section (Active, Completed, High Priority, and Overdue) at the top of the dashboard gives users immediate clarity on their tasks and workload upon logging in.

## Current state

- `resources/js/pages/dashboard/index.tsx` (lines 22–33):

  ```tsx
  export default function Dashboard({ tasks }: DashboardProps) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Dashboard" />

        <div className="mx-auto max-w-prose space-y-8 p-4">
          <TaskForm />
          <TasksTable tasks={tasks} />
        </div>
      </AppLayout>
    );
  }
  ```

- Component primitives: `Card, CardContent, CardHeader, CardTitle` in `@/components/ui/card`.
- Date utilities: `date-fns` (`isPast`, `isToday`, `parseISO`) are already installed and in use.

## Commands you will need

| Purpose   | Command                                                      | Expected on success |
| --------- | ------------------------------------------------------------ | ------------------- |
| Typecheck | `npm run types`                                              | exit 0, no errors   |
| Lint      | `npm run lint`                                               | exit 0              |
| Format    | `npm run format:check`                                       | exit 0              |
| Tests     | `php artisan test --compact tests/Feature/DashboardTest.php` | all pass            |

## Scope

**In scope**:

- Create `resources/js/pages/dashboard/task-summary-cards.tsx`
- Update `resources/js/pages/dashboard/index.tsx` to render `<TaskSummaryCards tasks={tasks} />`

**Out of scope**:

- Do NOT alter backend controller endpoints or response props.
- Do NOT touch `task-form.tsx` or `tasks-table.tsx`.

## Git workflow

- Branch: `advisor/020-dashboard-summary-cards`
- Commit message: `feat(dashboard): add task metric summary cards`

## Steps

### Step 1: Create `task-summary-cards.tsx`

Create `resources/js/pages/dashboard/task-summary-cards.tsx`:

```tsx
import { isPast, isToday, parseISO } from "date-fns";
import { AlertCircle, CheckCircle2, Clock, Flame } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import type { Task } from "@/types/task";

interface TaskSummaryCardsProps {
  tasks: Task[];
}

export function TaskSummaryCards({ tasks }: TaskSummaryCardsProps) {
  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const highPriorityCount = tasks.filter((t) => !t.completed && t.priority === "high").length;
  const overdueCount = tasks.filter((t) => {
    if (t.completed || !t.deadline) return false;
    const date = parseISO(t.deadline);
    return isPast(date) && !isToday(date);
  }).length;

  const stats = [
    {
      title: "Active",
      value: activeCount,
      icon: Clock,
      color: "text-blue-500",
    },
    {
      title: "Completed",
      value: completedCount,
      icon: CheckCircle2,
      color: "text-emerald-500",
    },
    {
      title: "High Priority",
      value: highPriorityCount,
      icon: Flame,
      color: "text-amber-500",
    },
    {
      title: "Overdue",
      value: overdueCount,
      icon: AlertCircle,
      color: overdueCount > 0 ? "text-destructive" : "text-muted-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="p-3">
            <CardContent className="flex items-center justify-between p-0">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-xl font-bold tracking-tight">{stat.value}</p>
              </div>
              <Icon className={`size-5 ${stat.color}`} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
```

**Verify**: `npm run types` → exit 0.

### Step 2: Render summary cards in `index.tsx`

In `resources/js/pages/dashboard/index.tsx`:

1. Import `TaskSummaryCards`:
   ```tsx
   import { TaskSummaryCards } from "./task-summary-cards";
   ```
2. Render `<TaskSummaryCards tasks={tasks} />` right above `<TaskForm />`:

   ```tsx
   export default function Dashboard({ tasks }: DashboardProps) {
     return (
       <AppLayout breadcrumbs={breadcrumbs}>
         <Head title="Dashboard" />

         <div className="mx-auto max-w-prose space-y-6 p-4">
           <TaskSummaryCards tasks={tasks} />
           <TaskForm />
           <TasksTable tasks={tasks} />
         </div>
       </AppLayout>
     );
   }
   ```

**Verify**: `npm run types && npm run lint` → exit 0.

### Step 3: Run formatting check and tests

```bash
npm run format:check
php artisan test --compact tests/Feature/DashboardTest.php
```

If formatting issues exist, run `npx prettier --write resources/js/pages/dashboard/task-summary-cards.tsx resources/js/pages/dashboard/index.tsx`.

**Verify**: All checks exit 0.

## Test plan

- Automated tests:
  - `npm run types` → exit 0
  - `npm run lint` → exit 0
  - `php artisan test --compact tests/Feature/DashboardTest.php` → pass
- Manual verification:
  - When loading the dashboard with 6 seeded tasks:
    - Active count displays incomplete task total.
    - Completed count displays finished task total.
    - Overdue count reflects incomplete tasks past due.
    - High priority count matches active high priority tasks.
  - Toggling or adding a task immediately updates the cards.

## Done criteria

- [ ] `TaskSummaryCards` component created and rendered on `Dashboard`.
- [ ] Shows Active, Completed, High Priority, and Overdue metrics.
- [ ] Responsive grid layout (2 columns on mobile, 4 columns on desktop).
- [ ] `npm run types` exits 0.
- [ ] `npm run lint` exits 0.
- [ ] `php artisan test --compact` exits 0.
- [ ] `plans/README.md` status row updated to `DONE`.

## STOP conditions

- If `Card` component props from `@/components/ui/card` differ, inspect `resources/js/components/ui/card.tsx`.
