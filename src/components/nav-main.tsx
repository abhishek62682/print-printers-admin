import { NavLink, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { RoleGuard } from "@/components/RoleGuard";
import type { Profile } from "@/config/api/profile.api";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type Role = Profile["role"];

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    roles: readonly Role[];
  }[];
}) {
  const { pathname } = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url;

            return (
              <RoleGuard key={item.title} behavior="hide" allowedRoles={item.roles}>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive}
                    className={
                      isActive
                        ? "bg-(--color-blue)! text-white! rounded-md!"
                        : ""
                    }
                  >
                    <NavLink className="flex gap-2" to={item.url}>
                      {item.icon && <item.icon className="w-4! h-4!" />}
                      <span className="text-[14px]">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </RoleGuard>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}