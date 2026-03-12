import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { AuthUser } from "@/config/api/auth.api";

interface ProfileState {
  profile: AuthUser | null;

  setProfile: (user: AuthUser) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>()(
  devtools(
    persist(
      (set) => ({
        profile: null,

        
        setProfile: (user) =>
          set({ profile: user }, false, "profile/setProfile"),

        
        clearProfile: () =>
          set({ profile: null }, false, "profile/clearProfile"),
      }),
      {
        name: "profile-storage",
        partialize: (state) => ({
          profile: state.profile,
        }),
      }
    ),
    {
      name: "ProfileStore",
    }
  )
);