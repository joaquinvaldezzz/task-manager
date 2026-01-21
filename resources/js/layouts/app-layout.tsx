import type { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children, ...props }: AppLayoutProps) {
  return <div {...props}>{children}</div>;
}
