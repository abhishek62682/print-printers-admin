import { create } from "zustand"
import { persist, devtools } from "zustand/middleware"
import Cookies from "js-cookie"

interface AuthState {
  user: {
    email: string | null
    isAuthenticated: boolean
  }
  accessToken: string | null

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
        accessToken: null,

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

        setAuth: (email, token) => {
          console.log(token)
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
              accessToken: token,
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
              accessToken: null,
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
      }
    ),
    {
      name: "AuthStore", // 👈 Redux DevTools me ye naam dikhega
    }
  )
)