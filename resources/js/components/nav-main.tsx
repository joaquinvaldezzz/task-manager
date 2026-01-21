import { Link } from "@inertiajs/react";

import { useActiveUrl } from "@/hooks/use-active-url";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import type { NavItem } from "@/types";

export function NavMain({ items }: { items: NavItem[] }) {
  const { urlIsActive } = useActiveUrl();

  return (
    <SidebarGroup className="px-2 py-0">
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              render={<Link href={item.href} prefetch />}
              isActive={urlIsActive(item.href)}
              tooltip={{ children: item.title }}
            >
              {item.icon ? <item.icon /> : null}
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
