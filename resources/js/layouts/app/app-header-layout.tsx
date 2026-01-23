import { AppContent } from "@/components/app-content";
import { AppHeader } from "@/components/app-header";
import { AppShell } from "@/components/app-shell";

import type { BreadcrumbItem } from "@/types";
import type { PropsWithChildren } from "react";

export default function AppHeaderLayout({
  children = undefined,
  breadcrumbs = undefined,
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
  return (
    <AppShell>
      <AppHeader breadcrumbs={breadcrumbs} />
      <AppContent>{children}</AppContent>
    </AppShell>
  );
}
