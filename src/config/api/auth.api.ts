import httpClient from "@/config/http/httpClient"



export interface RegisterPayload {
  username: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

// VerifyOtp is shared — login OTP and reset OTP have the same shape
export interface VerifyOtpPayload {
  email: string
  otp: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  email: string
  newPassword: string
}

/* ================================
   Response Types (matches backend exactly)
================================ */

// POST /auth/register
export interface RegisterResponse {
  success: boolean
  message: string
  data: {
    id: string
    username: string
    email: string
    isVerified: boolean
    role: "SUPER_ADMIN" | "BLOG_MANAGER"
  }
}

// POST /auth/login → data is null, just triggers OTP
export interface LoginResponse {
  success: boolean
  message: string
  data: null
}

// POST /auth/verify-otp → returns JWT + role
export interface VerifyOtpResponse {
  success: boolean
  message: string
  data: {
    token: string
    role: "SUPER_ADMIN" | "BLOG_MANAGER"
  }
}

// POST /auth/forgot-password → data is null (generic message for security)
export interface ForgotPasswordResponse {
  success: boolean
  message: string
  data: null
}

// POST /auth/verify-reset-otp → returns email to carry into reset step
export interface VerifyResetOtpResponse {
  success: boolean
  message: string
  data: {
    email: string
  }
}

// POST /auth/reset-password → data is null
export interface ResetPasswordResponse {
  success: boolean
  message: string
  data: null
}

/* ================================
   Auth API Calls
================================ */

// Register a new user
export const registerUser = async (payload: RegisterPayload) => {
  const { data } = await httpClient.post<RegisterResponse>("auth/register", payload)
  return data
}

// Step 1 of login: verify credentials, triggers OTP generation
export const loginUser = async (payload: LoginPayload) => {
  const { data } = await httpClient.post<LoginResponse>("auth/login", payload)
  return data
}

// Step 2 of login: verify OTP → receive JWT token + role
export const verifyOtp = async (payload: VerifyOtpPayload) => {
  const { data } = await httpClient.post<VerifyOtpResponse>("auth/verify-otp", payload)
  return data
}

// Step 1 of forgot password: verify email exists, triggers OTP generation
export const forgotPassword = async (payload: ForgotPasswordPayload) => {
  const { data } = await httpClient.post<ForgotPasswordResponse>("auth/forgot-password", payload)
  return data
}

// Step 2 of forgot password: verify OTP → unlocks password reset
export const verifyResetOtp = async (payload: VerifyOtpPayload) => {
  const { data } = await httpClient.post<VerifyResetOtpResponse>("auth/verify-reset-otp", payload)
  return data
}

// Step 3 of forgot password: submit new password
export const resetPassword = async (payload: ResetPasswordPayload) => {
  const { data } = await httpClient.post<ResetPasswordResponse>("auth/reset-password", payload)
  return data
}