import { useProfileStore } from "@/config/store/profile";
import type { Profile } from "@/config/api/profile.api";
import { Navigate } from "react-router-dom";

type Role = Profile["role"];

type RoleGuardProps =
  | {
      allowedRoles: readonly Role[];
      children: React.ReactNode;
      behavior: "redirect";      
      redirectTo?: string;
      fallback?: never;
    }
  | {
      allowedRoles: readonly Role[];
      children: React.ReactNode;
      behavior: "hide";          
      fallback?: React.ReactNode;
      redirectTo?: never;
    };

export const RoleGuard = ({
  allowedRoles,
  children,
  behavior,
  redirectTo = "/dashboard/home",
  fallback = null,
}: RoleGuardProps) => {
  const profile = useProfileStore((state) => state.profile);

  // not logged in
  if (!profile) {
    return behavior === "redirect"
      ? <Navigate to="/auth/login" replace />
      : null;
  }

  const isAllowed = allowedRoles.includes(profile.role);

  if (!isAllowed) {
    return behavior === "redirect"
      ? <Navigate to={redirectTo} replace />
      : <>{fallback}</>;
  }

  return <>{children}</>;
};