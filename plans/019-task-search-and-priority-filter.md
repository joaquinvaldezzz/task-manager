# Plan 019: Add keyword search and priority filter to tasks dashboard

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 7481977..HEAD -- resources/js/pages/dashboard/tasks-table.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/011-fix-eslint-nested-ternary-and-clean-nav-user.md, plans/014-contextual-task-table-empty-states.md
- **Category**: direction
- **Planned at**: commit `7481977`, 2026-09-25

## Why this matters

The dashboard currently only allows filtering tasks by completion status (`all`, `active`, `completed`). As tasks accumulate, users cannot search for specific keywords in titles or descriptions, nor can they filter by task urgency (`high`, `medium`, `low`), even though priority badges are prominently displayed on each row. Introducing a responsive search input and priority filter directly above the table enables users to immediately find relevant tasks and focus on high-priority items.

## Current state

- `resources/js/pages/dashboard/tasks-table.tsx` (lines 28–51):

  ```tsx
  export function TasksTable({ tasks }: TasksTableProps) {
    const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
    const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);
    const { toggleTask, deleteTask } = useTaskOperations();

    const filteredTasks = tasks.filter((task) => {
      if (filter === "active") return !task.completed;
      if (filter === "completed") return task.completed;
      return true;
    });

    return (
      <div className="flex flex-col gap-4">
        <Tabs
          value={filter}
          onValueChange={(val) => setFilter(val as "all" | "active" | "completed")}
        >
          <TabsList>
            <TabsTab value="all">All</TabsTab>
            <TabsTab value="active">Active</TabsTab>
            <TabsTab value="completed">Completed</TabsTab>
          </TabsList>
        </Tabs>
  ```

- Filtering is client-side. The UI has reusable components: `Input` from `@/components/ui/input`, `Select` from `@/components/ui/select`, and Lucide icons.

## Commands you will need

| Purpose   | Command                                                 | Expected on success |
| --------- | ------------------------------------------------------- | ------------------- |
| Typecheck | `npm run types`                                         | exit 0, no errors   |
| Lint      | `npm run lint`                                          | exit 0              |
| Format    | `npm run format:check`                                  | exit 0              |
| Tests     | `php artisan test --compact tests/Feature/TaskTest.php` | all pass            |

## Scope

**In scope**:

- `resources/js/pages/dashboard/tasks-table.tsx`

**Out of scope**:

- Do NOT change backend database columns or controller methods.
- Do NOT touch `task-form.tsx` or `task-edit-dialog.tsx`.

## Git workflow

- Branch: `advisor/019-task-search-and-priority-filter`
- Commit message: `feat(dashboard): add search input and priority filter controls`

## Steps

### Step 1: Add search and priority state to `tasks-table.tsx`

In `resources/js/pages/dashboard/tasks-table.tsx`:

1. Import `Search as SearchIcon` from `lucide-react`.
2. Import `Input` from `@/components/ui/input`.
3. Import `Select, SelectContent, SelectItem, SelectTrigger, SelectValue` from `@/components/ui/select`.
4. Add state hooks for `search` and `priorityFilter`:
   ```tsx
   const [search, setSearch] = useState<string>("");
   const [priorityFilter, setPriorityFilter] = useState<"all" | "high" | "medium" | "low">("all");
   ```
5. Update `filteredTasks` computation:

   ```tsx
   const filteredTasks = tasks.filter((task) => {
     if (filter === "active" && task.completed) return false;
     if (filter === "completed" && !task.completed) return false;

     if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;

     if (search.trim()) {
       const query = search.toLowerCase();
       const titleMatches = task.title.toLowerCase().includes(query);
       const descMatches = task.description?.toLowerCase().includes(query) ?? false;
       if (!titleMatches && !descMatches) return false;
     }

     return true;
   });
   ```

**Verify**: `npm run types` → exit 0.

### Step 2: Add search bar and priority filter toolbar UI

In `resources/js/pages/dashboard/tasks-table.tsx`, render the controls above the `<Frame>` table:

```tsx
<div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
  <Tabs value={filter} onValueChange={(val) => setFilter(val as "all" | "active" | "completed")}>
    <TabsList>
      <TabsTab value="all">All</TabsTab>
      <TabsTab value="active">Active</TabsTab>
      <TabsTab value="completed">Completed</TabsTab>
    </TabsList>
  </Tabs>

  <div className="flex items-center gap-2">
    <div className="relative flex-1 sm:w-48">
      <Input
        type="search"
        placeholder="Search tasks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-9 text-sm"
      />
    </div>

    <Select
      value={priorityFilter}
      onValueChange={(val) => setPriorityFilter(val as "all" | "high" | "medium" | "low")}
    >
      <SelectTrigger className="h-9 w-32 text-sm">
        <SelectValue placeholder="Priority" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Priority</SelectItem>
        <SelectItem value="high">High</SelectItem>
        <SelectItem value="medium">Medium</SelectItem>
        <SelectItem value="low">Low</SelectItem>
      </SelectContent>
    </Select>
  </div>
</div>
```

**Verify**: `npm run types && npm run lint` → exit 0.

### Step 3: Run formatting check and verify

Run Prettier formatting:

```bash
npm run format:check
```

If formatting needed, run `npx prettier --write resources/js/pages/dashboard/tasks-table.tsx`.

Run test suite:

```bash
php artisan test --compact tests/Feature/TaskTest.php
```

**Verify**: All checks exit 0.

## Test plan

- Automated tests:
  - `npm run types` → exit 0
  - `npm run lint` → exit 0
  - `php artisan test --compact` → all pass
- Manual verification:
  - Typing in search filters table rows in real-time matching either title or description.
  - Selecting "High" priority shows only high-priority tasks.
  - Combining status "Active" + priority "High" + search "budget" correctly compounds all three filters.
  - Clearing search and setting priority to "All" restores the full list.

## Done criteria

- [ ] Search input allows real-time text matching on task title and description.
- [ ] Priority select allows filtering by `all`, `high`, `medium`, or `low`.
- [ ] Filters compose cleanly with existing `all`/`active`/`completed` tabs.
- [ ] `npm run types` exits 0.
- [ ] `npm run lint` exits 0.
- [ ] `php artisan test --compact` exits 0.
- [ ] `plans/README.md` status row updated to `DONE`.

## STOP conditions

- If `SelectTrigger` or `SelectContent` from `@/components/ui/select` has differing prop requirements, inspect `resources/js/components/ui/select.tsx` and sibling forms (`task-form.tsx`).
