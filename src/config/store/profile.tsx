import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Profile } from "@/config/api/profile.api";

interface ProfileState {
  profile: Profile | null;

  setProfile:   (profile: Profile) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>()(
  devtools(
    persist(
      (set) => ({
        profile: null,

        setProfile: (profile) =>
          set({ profile }, false, "profile/setProfile"),

        clearProfile: () =>
          set({ profile: null }, false, "profile/clearProfile"),
      }),
      {
        name: "profile-storage",
        partialize: (state) => ({ profile: state.profile }),
      }
    ),
    { name: "ProfileStore" }
  )
);