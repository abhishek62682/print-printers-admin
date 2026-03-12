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
import {  LayoutDashboard, Mail, MessageSquare, Newspaper } from "lucide-react"

const data = {
  user: {
    name: "Print Printers",
    email: "print@printprinters.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard/home",
      icon: LayoutDashboard,
    },
    {
      title: "Testimonials",
      url: "/dashboard/testimonials",
      icon: MessageSquare,
    },
    {
      title: "Blogs",
      url: "/dashboard/blogs",
      icon: Newspaper,
    },
    {
      title: "Inquiries",
      url: "/dashboard/enquiries",
      icon: Mail,
    },
  ],
}

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
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
