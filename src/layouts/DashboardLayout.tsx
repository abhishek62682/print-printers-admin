import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import "../theme.css";
import { useAuthStore } from "@/config/store/auth";
import { useProfileStore } from "@/config/store/profile";
import { getProfile } from "@/config/api/profile.api";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getPageTitle } from "@/Utils/constant";

export default function DashboardLayout() {
  const location = useLocation();

  const { isAuthenticated, email } = useAuthStore((store) => store?.user);
  const { setProfile } = useProfileStore();

  const { data } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data) setProfile(data);
  }, [data, setProfile]);

  if (!isAuthenticated && !email) {
    return <Navigate to="/auth/login" />;
  }

 

  const title = getPageTitle(location.pathname);

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
        <SiteHeader title={title} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2 p-2 lg:p-6">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}