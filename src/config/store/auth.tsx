import { create } from "zustand"
import { persist, devtools } from "zustand/middleware"
import Cookies from "js-cookie"

interface AuthState {
  user: {
    email: string | null
    isAuthenticated: boolean
  }
  isHydrated: boolean

  setEmail: (email: string) => void
  setAuth: (email: string, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: {
          email: null,
          isAuthenticated: false,
        },
        isHydrated: false,

        // Called after /login — carry email into verify-otp step
        setEmail: (email) =>
          set(
            (state) => ({
              user: {
                ...state.user,
                email,
                isAuthenticated: false,
              },
            }),
            false,
            "auth/setEmail"
          ),

        // Called after /verify-otp — store token in cookie, mark user as authenticated
        setAuth: (email, token) => {
          Cookies.set("accessToken", token, {
            expires: 7,
            secure: true,
            sameSite: "Strict",
          })

          set(
            {
              user: {
                email,
                isAuthenticated: true,
              },
            },
            false,
            "auth/setAuth"
          )
        },

        logout: () => {
          Cookies.remove("accessToken")

          set(
            {
              user: {
                email: null,
                isAuthenticated: false,
              },
            },
            false,
            "auth/logout"
          )
        },
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({
          user: state.user,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) state.isHydrated = true
        },
      }
    ),
    {
      name: "AuthStore",
    }
  )
)