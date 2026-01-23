import { usePage } from "@inertiajs/react";
import { ChevronsUpDown } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, MenuPopup, MenuTrigger } from "@/components/ui/menu";
import {
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { UserInfo } from "@/components/user-info";
import { UserMenuContent } from "@/components/user-menu-content";

import type { SharedData } from "@/types";

export function NavUser() {
  const { auth } = usePage<SharedData>().props;
  const { state } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Menu>
          <MenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="group text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent"
                data-test="sidebar-menu-button"
              >
                <UserInfo user={auth.user} />
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            }
          />
          <MenuPopup>
            <UserMenuContent user={auth.user} />
          </MenuPopup>
        </Menu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
