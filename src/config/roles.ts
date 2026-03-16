import type { Profile } from "@/config/api/profile.api";

export type Role = Profile["role"];

export const ROLES = {
  SUPER_ADMIN:  "SUPER_ADMIN",
  BLOG_MANAGER: "BLOG_MANAGER",
} as const satisfies Record<string, Role>;

export const ROLE_GROUPS = {
  ALL:         ["SUPER_ADMIN", "BLOG_MANAGER"] as const satisfies readonly Role[],
  SUPER_ADMIN: ["SUPER_ADMIN"]                 as const satisfies readonly Role[],
} as const;