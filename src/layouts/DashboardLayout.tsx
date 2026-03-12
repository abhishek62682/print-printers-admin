import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Navigate, Outlet } from "react-router-dom";
import "../theme.css";
import { useAuthStore } from "@/config/store/auth";
import { useProfileStore } from "@/config/store/profile";
import { getMe } from "@/config/api/auth.api";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function DashboardLayout() {
  const { isAuthenticated, email } = useAuthStore((store) => store?.user);
  const { setProfile } = useProfileStore();

  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    enabled: isAuthenticated, 
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data) setProfile(data);
  }, [data]);

  if (!isAuthenticated && !email) {
    return <Navigate to="/auth/login" />;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 p-2 lg:p-6 flex-col gap-2">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}