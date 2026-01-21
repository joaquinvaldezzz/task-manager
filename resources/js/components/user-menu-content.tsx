import { Fragment } from "react";
import { Link, router } from "@inertiajs/react";
import { logout } from "@/routes";
import { edit } from "@/routes/profile";
import { LogOut, Settings } from "lucide-react";

import { useMobileNavigation } from "@/hooks/use-mobile-navigation";
import { MenuGroup, MenuGroupLabel, MenuItem, MenuSeparator } from "@/components/ui/menu";
import { UserInfo } from "@/components/user-info";

import type { User } from "@/types";

interface UserMenuContentProps {
  user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
  const cleanup = useMobileNavigation();

  const handleLogout = () => {
    cleanup();
    router.flushAll();
  };

  return (
    <Fragment>
      <MenuGroupLabel className="p-0 font-normal">
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <UserInfo user={user} showEmail />
        </div>
      </MenuGroupLabel>
      <MenuSeparator />
      <MenuGroup>
        <MenuItem
          render={
            <Link
              className="block w-full cursor-pointer"
              href={edit()}
              prefetch
              onClick={cleanup}
            />
          }
        >
          <Settings className="mr-2" />
          Settings
        </MenuItem>
      </MenuGroup>
      <MenuSeparator />
      <MenuItem
        render={
          <Link
            className="block w-full cursor-pointer"
            href={logout()}
            as="button"
            onClick={handleLogout}
            data-test="logout-button"
          />
        }
      >
        <LogOut className="mr-2" />
        Log out
      </MenuItem>
    </Fragment>
  );
}
