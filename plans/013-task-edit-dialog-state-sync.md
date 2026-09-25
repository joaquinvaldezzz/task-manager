# Plan 013: Synchronize form state in TaskEditDialog on open and submission

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 7481977..HEAD -- resources/js/pages/dashboard/task-edit-dialog.tsx resources/js/hooks/use-task-operations.ts resources/js/hooks/use-task-form.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/011-fix-eslint-nested-ternary-and-clean-nav-user.md
- **Category**: bug
- **Planned at**: commit `7481977`, 2026-09-25

## Why this matters

In `resources/js/pages/dashboard/task-edit-dialog.tsx`, `useTaskForm` initializes form fields once when the component mounts. Because each row in `TasksTable` continuously renders a `<TaskEditDialog task={task} />`, the form state does not re-sync when task properties change or when the dialog is re-opened after prior edits. If a user modifies fields, cancels/discards, or re-opens the dialog after another operation, `data` can retain stale inputs or reset to initial mount values instead of the latest server properties. Ensuring the edit form state resets to current task attributes on open guarantees consistent data editing.

## Current state

- `resources/js/pages/dashboard/task-edit-dialog.tsx` (lines 50–59):

  ```tsx
  export function TaskEditDialog({ task }: TaskEditDialogProps) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
    const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState<boolean>(false);
    const { data, setData, submit, processing, errors, reset, isDirty } = useTaskForm({
      initialTitle: task.title,
      initialDescription: task.description,
      initialDeadline: task.deadline,
      initialPriority: task.priority,
    });
    const { updateTask } = useTaskOperations();

    const handleTaskUpdate = updateTask(task, submit, () => setIsEditDialogOpen(false));
  ```

- `resources/js/hooks/use-task-operations.ts` (lines 46–61):

  ```ts
  const updateTask =
    (task: Task, submit: InertiaFormProps<Task>["submit"], onSuccess: () => void) =>
    (e: FormEvent) => {
      e.preventDefault();

      submit(update(task), {
        preserveScroll: true,
        onSuccess: () => {
          notifyTaskUpdated();
          onSuccess();
        },
        onError: () => {
          notifyUpdateFailed();
        },
      });
    };
  ```

- If a user cancels and clicks "Discard", `reset()` restores values from the initial render, ignoring changes that may have occurred to `task` in parent props.

## Commands you will need

| Purpose   | Command                                                 | Expected on success |
| --------- | ------------------------------------------------------- | ------------------- |
| Typecheck | `npm run types`                                         | exit 0, no errors   |
| Lint      | `npm run lint`                                          | exit 0              |
| Format    | `npm run format:check`                                  | exit 0              |
| Tests     | `php artisan test --compact tests/Feature/TaskTest.php` | all pass            |

## Scope

**In scope**:

- `resources/js/pages/dashboard/task-edit-dialog.tsx`
- `resources/js/hooks/use-task-operations.ts`

**Out of scope**:

- Do NOT change backend controller or request classes (`TaskController.php`, `UpdateTaskRequest.php`).
- Do NOT alter `DiscardChangesDialog` contract.

## Git workflow

- Branch: `advisor/013-task-edit-dialog-state-sync`
- Commit message: `fix(dashboard): synchronize task edit form state when dialog opens and on save`

## Steps

### Step 1: Add state synchronization on dialog open in `task-edit-dialog.tsx`

In `resources/js/pages/dashboard/task-edit-dialog.tsx`:

1. Import `useEffect` from `"react"`.
2. Add an effect that resets/syncs form data whenever `isEditDialogOpen` transitions to `true` or when the `task` prop updates:
   ```tsx
   useEffect(() => {
     if (isEditDialogOpen) {
       setData({
         title: task.title,
         description: task.description ?? "",
         deadline: task.deadline ?? null,
         priority: task.priority ?? "medium",
       });
     }
   }, [isEditDialogOpen, task, setData]);
   ```
3. In `DiscardChangesDialog`'s `onDiscard` handler, ensure the form resets back to the current `task` props:
   ```tsx
   onDiscard={() => {
     setIsDiscardConfirmOpen(false);
     setIsEditDialogOpen(false);
     setData({
       title: task.title,
       description: task.description ?? "",
       deadline: task.deadline ?? null,
       priority: task.priority ?? "medium",
     });
   }}
   ```

**Verify**: `npm run types` → exit 0.

### Step 2: Ensure `useTaskOperations` invokes `onReset` if provided

In `resources/js/hooks/use-task-operations.ts`:

1. In `updateTask`, support an optional `onReset?: () => void` callback or execute it inside `onSuccess`:

   ```ts
   const updateTask =
     (
       task: Task,
       submit: InertiaFormProps<Task>["submit"],
       onSuccess: () => void,
       onReset?: () => void,
     ) =>
     (e: FormEvent) => {
       e.preventDefault();

       submit(update(task), {
         preserveScroll: true,
         onSuccess: () => {
           notifyTaskUpdated();
           onSuccess();
           onReset?.();
         },
         onError: () => {
           notifyUpdateFailed();
         },
       });
     };
   ```

2. In `task-edit-dialog.tsx`, pass `reset` or synchronization callback to `updateTask`:
   ```tsx
   const handleTaskUpdate = updateTask(task, submit, () => setIsEditDialogOpen(false), reset);
   ```

**Verify**: `npm run types && npm run lint` → exit 0.

### Step 3: Verify formatting and tests

Run code formatting check and tests:

```bash
npm run format:check
php artisan test --compact tests/Feature/TaskTest.php
```

**Verify**: Tests pass and formatting check passes.

## Test plan

- Feature tests in `tests/Feature/TaskTest.php` must continue to pass:
  - `php artisan test --compact tests/Feature/TaskTest.php`
- Manual/Browser verification:
  - Open edit dialog for Task A, edit title without saving, click Cancel -> Discard -> dialog closes.
  - Re-open edit dialog -> fields display current task data, not discarded draft.
  - Edit Task A, click Save -> updates successfully and subsequent dialog re-open shows updated data.

## Done criteria

- [ ] `TaskEditDialog` updates form state to match `task` props when dialog opens.
- [ ] `DiscardChangesDialog` discards changes and resets to current `task` props.
- [ ] `npm run types` exits 0.
- [ ] `npm run lint` exits 0.
- [ ] `php artisan test --compact` exits 0.
- [ ] `plans/README.md` status row updated to `DONE`.

## STOP conditions

- If `useTaskForm` does not expose `setData` or has a conflicting signature, inspect `resources/js/hooks/use-task-form.ts`.
- If `InertiaFormProps` causes type issues with `onReset`, use `() => void`.
