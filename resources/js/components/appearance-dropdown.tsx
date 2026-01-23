import { Monitor, Moon, Sun } from "lucide-react";

import { useAppearance } from "@/hooks/use-appearance";
import { Button } from "@/components/ui/button";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@/components/ui/menu";

import type { HTMLAttributes } from "react";

export default function AppearanceToggleDropdown({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const { appearance, updateAppearance } = useAppearance();

  const getCurrentIcon = () => {
    switch (appearance) {
      case "dark":
        return <Moon className="h-5 w-5" />;
      case "light":
        return <Sun className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  return (
    <div className={className} {...props}>
      <Menu>
        <MenuTrigger
          render={
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md">
              {getCurrentIcon()}
              <span className="sr-only">Toggle theme</span>
            </Button>
          }
        />
        <MenuPopup align="end">
          <MenuItem onClick={() => updateAppearance("light")}>
            <span className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              Light
            </span>
          </MenuItem>
          <MenuItem onClick={() => updateAppearance("dark")}>
            <span className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Dark
            </span>
          </MenuItem>
          <MenuItem onClick={() => updateAppearance("system")}>
            <span className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              System
            </span>
          </MenuItem>
        </MenuPopup>
      </Menu>
    </div>
  );
}
