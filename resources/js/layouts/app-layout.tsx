import type { BreadcrumbItem } from "@/types";
import type { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({
  children,
  breadcrumbs: _breadcrumbs = undefined,
  ...props
}: AppLayoutProps) {
  return <div {...props}>{children}</div>;
}
