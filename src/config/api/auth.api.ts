import httpClient from "@/config/http/httpClient"

/* ================================
   Types
================================ */

export interface RegisterPayload {
  username: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface VerifyOtpPayload {
  email: string
  otp: string
}

export interface AuthUser {
  id: string
  username: string
  email: string
  isVerified: boolean
}

export interface AuthResponse {
  success: boolean
  message: string
  data: any
}

interface MeResponse {
  success: boolean
  message: string
  data: AuthUser
}

/* ================================
   Auth API Calls
================================ */

export const registerUser = async (payload: RegisterPayload) => {
  const { data } = await httpClient.post<AuthResponse>("auth/register", payload)
  return data
}

export const loginUser = async (payload: LoginPayload) => {
  const { data } = await httpClient.post<AuthResponse>("auth/login", payload)
  return data
}

export const verifyOtp = async (payload: VerifyOtpPayload) => {
  const { data } = await httpClient.post<AuthResponse>("auth/verify-otp", payload)
  return data
}

// GET /api/auth/me — fetch logged-in user details (protected)
export const getMe = async (): Promise<AuthUser> => {
  const { data } = await httpClient.get<MeResponse>("auth/me")
  return data.data
}