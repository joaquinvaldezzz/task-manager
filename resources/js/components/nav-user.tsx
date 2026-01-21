import { usePage } from "@inertiajs/react";
import { ChevronsUpDown } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, MenuPopup, MenuTrigger } from "@/components/ui/menu";
import {
  SidebarMenu,
  SidebarMenuBadge,
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
          <MenuTrigger>
            {/* <SidebarMenuButton
              size="lg"
              className="group text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent"
              data-test="sidebar-menu-button"
            ></SidebarMenuButton> */}
            <UserInfo user={auth.user} />
            <ChevronsUpDown className="ml-auto size-4" />
          </MenuTrigger>
          <MenuPopup>
            <UserMenuContent user={auth.user} />
          </MenuPopup>
          {/* <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="end"
            side={isMobile ? "bottom" : state === "collapsed" ? "left" : "bottom"}
          ></DropdownMenuContent> */}
        </Menu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
