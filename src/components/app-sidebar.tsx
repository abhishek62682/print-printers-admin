import * as React from "react"


import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {  History, LayoutDashboard, Mail, MessageSquare, Newspaper, ShieldCheck, Users } from "lucide-react"


import { ROLE_GROUPS } from "@/config/roles";

const data = {
  navMain: [
   { title: "Dashboard",    url: "/dashboard/home",         icon: LayoutDashboard, roles: ROLE_GROUPS.SUPER_ADMIN         },
  { title: "Blogs",        url: "/dashboard/blogs",        icon: Newspaper,       roles: ROLE_GROUPS.ALL         },
  { title: "Testimonials", url: "/dashboard/testimonials", icon: MessageSquare,   roles: ROLE_GROUPS.SUPER_ADMIN },
  { title: "Inquiries",    url: "/dashboard/inquiries",    icon: Mail,            roles: ROLE_GROUPS.SUPER_ADMIN },
  { title: "My Activity",  url: "/dashboard/my-activity",  icon: History,         roles: ROLE_GROUPS.ALL         },
  { title: "Audit Logs",   url: "/dashboard/audit-logs",   icon: ShieldCheck,     roles: ROLE_GROUPS.SUPER_ADMIN },
  { title: "Users",        url: "/dashboard/users",        icon: Users,           roles: ROLE_GROUPS.SUPER_ADMIN },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
           
             
              <a  href="/dashboard/home">
              <img className="w-40" src="/logo.png" alt="" />

               
               
              </a>
           
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser  />
      </SidebarFooter>
    </Sidebar>
  )
}
