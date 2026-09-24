# Plan 006: Restore AppLayout Shell with Navigation Sidebar and Breadcrumbs Support

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 0b9ec9c..HEAD -- resources/js/layouts/app-layout.tsx resources/js/layouts/app/app-sidebar-layout.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: plans/001-fix-two-factor-type-error.md
- **Category**: tech-debt
- **Planned at**: commit `0b9ec9c`, 2026-09-24

## Why this matters

In commit `a3692f8` ("feat: cleanup app-layout temporarily"), `AppLayout` was stripped down to a bare `<div>{children}</div>`. This orphaned the entire layout infrastructure:

- `AppSidebarLayout` (`resources/js/layouts/app/app-sidebar-layout.tsx`)
- `AppSidebar` (`resources/js/components/app-sidebar.tsx`)
- `NavMain` (`resources/js/components/nav-main.tsx`)
- `NavUser` (`resources/js/components/nav-user.tsx`)
- `AppHeader` (`resources/js/components/app-header.tsx`)

Because of this temporary change, when logged-in users visit `/dashboard` or `/settings/profile`, they have no navigation bar, no sidebar, no user profile avatar/dropdown, and no way to navigate between the task dashboard and account settings other than manually modifying the browser URL. Restoring `AppLayout` to wrap pages with `AppSidebarLayout` (while supporting optional breadcrumbs) reconnects the application UI.

## Current state

- In `resources/js/layouts/app-layout.tsx:1-10`:

  ```tsx
  import type { ReactNode } from "react";

  interface AppLayoutProps {
    children: ReactNode;
  }

  export default function AppLayout({ children, ...props }: AppLayoutProps) {
    return <div {...props}>{children}</div>;
  }
  ```

- In `resources/js/layouts/app/app-sidebar-layout.tsx:1-23`:

  ```tsx
  import { AppContent } from "@/components/app-content";
  import { AppShell } from "@/components/app-shell";
  import { AppSidebar } from "@/components/app-sidebar";
  import { AppSidebarHeader } from "@/components/app-sidebar-header";

  import type { BreadcrumbItem } from "@/types";
  import type { PropsWithChildren } from "react";

  export default function AppSidebarLayout({
    children = undefined,
    breadcrumbs = [],
  }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
      <AppShell variant="sidebar">
        <AppSidebar />
        <AppContent variant="sidebar" className="overflow-x-hidden">
          <AppSidebarHeader breadcrumbs={breadcrumbs} />
          {children}
        </AppContent>
      </AppShell>
    );
  }
  ```

- Pre-strip commit `bdbd15a` shows how `AppLayout` previously used `AppSidebarLayout`:
  ```tsx
  export default function AppLayout({
    children,
    breadcrumbs = undefined,
    ...props
  }: AppLayoutProps) {
    return (
      <AppSidebarLayout breadcrumbs={breadcrumbs} {...props}>
        {children}
      </AppSidebarLayout>
    );
  }
  ```

## Commands you will need

| Purpose   | Command         | Expected on success |
| --------- | --------------- | ------------------- |
| Typecheck | `bun run types` | exit 0, no errors   |
| Lint      | `bun run lint`  | exit 0              |
| Build     | `bun run build` | exit 0              |

## Scope

**In scope**:

- `resources/js/layouts/app-layout.tsx`
- `resources/js/components/nav-main.tsx` (verify links include Dashboard)
- `resources/js/pages/dashboard/index.tsx` (add breadcrumbs if appropriate)

**Out of scope**:

- Do not modify authentication layouts (`auth-simple-layout.tsx`, etc.).
- Do not alter settings layout inner sidebar (`layouts/settings/layout.tsx`).

## Git workflow

- Branch: `advisor/006-restore-app-layout-shell`
- Commit message: `feat(layout): restore AppSidebarLayout in AppLayout`

## Steps

### Step 1: Reconnect AppSidebarLayout in AppLayout

In `resources/js/layouts/app-layout.tsx`:

1. Import `AppSidebarLayout` from `@/layouts/app/app-sidebar-layout`.
2. Import `type { BreadcrumbItem }` from `@/types`.
3. Wrap `children` with `<AppSidebarLayout breadcrumbs={breadcrumbs} {...props}>{children}</AppSidebarLayout>`.

Target implementation in `resources/js/layouts/app-layout.tsx`:

```tsx
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";

import type { BreadcrumbItem } from "@/types";
import type { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs = undefined, ...props }: AppLayoutProps) {
  return (
    <AppSidebarLayout breadcrumbs={breadcrumbs} {...props}>
      {children}
    </AppSidebarLayout>
  );
}
```

**Verify**: `bun run types` → exit 0.

### Step 2: Check NavMain links

In `resources/js/components/nav-main.tsx`:
Check that the navigation links properly point to Dashboard (`/dashboard`).
Inspect `nav-main.tsx` items:
Ensure the item for Dashboard has `title: "Dashboard"` and points to route `dashboard`.

**Verify**: View `resources/js/components/app-sidebar.tsx` and ensure `NavMain` items render correctly.

### Step 3: Add breadcrumbs to Dashboard index page

In `resources/js/pages/dashboard/index.tsx`:
Add a breadcrumbs constant:

```tsx
const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Dashboard",
    href: route("dashboard"),
  },
];
```

Pass `breadcrumbs={breadcrumbs}` to `<AppLayout breadcrumbs={breadcrumbs}>`.

**Verify**: `bun run types` → exit 0.

### Step 4: Verify build and lint

Run full frontend validation:

- `bun run lint`
- `bun run types`
- `bun run build`

**Verify**: All exit 0.

## Test plan

- Verify via `bun run types` that all pages using `AppLayout` compile without type errors.
- Verify via `bun run build` that Vite bundles without errors.
- Run `php artisan test --compact` to ensure server-side Inertia response tests pass.

## Done criteria

- [ ] `AppLayout` renders `AppSidebarLayout` with `breadcrumbs` passed through
- [ ] `Dashboard` passes breadcrumbs to `AppLayout`
- [ ] `bun run types` exits 0
- [ ] `bun run build` exits 0
- [ ] `plans/README.md` status row updated

## STOP conditions

- If the user explicitly requested a minimalist distraction-free layout without a sidebar, STOP and report.
- If `AppSidebar` crashes during SSR due to `window` or `document` access, wrap client-specific logic in check.

## Maintenance notes

- Any new authenticated pages should import `AppLayout` and pass a page-specific `breadcrumbs` array.
