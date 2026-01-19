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
