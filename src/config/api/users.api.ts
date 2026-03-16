import httpClient from "@/config/http/httpClient"



export type UserRole = "SUPER_ADMIN" | "BLOG_MANAGER"

export interface User {
  _id: string
  username: string
  email: string
  role: UserRole
  isVerified: boolean
  authSecret:string
  createdBy: {
    _id: string
    username: string
    email: string
  } | null
  createdAt: string
  updatedAt: string
}

export interface CreateUserPayload {
  username: string
  email: string
  password: string
  role?: UserRole
}

export interface UpdateUserRolePayload {
  role: UserRole
}

export interface UserResponse {
  success: boolean
  message: string
  data: User
}

export interface UsersListResponse {
  success: boolean
  count: number
  data: User[]
}

export interface DeleteUserResponse {
  success: boolean
  message: string
  data: {
    id: string
    username: string
    email: string
  }
}



// GET /api/users — list all users (SUPER_ADMIN only)
export const getAllUsers = async (): Promise<User[]> => {
  const { data } = await httpClient.get<UsersListResponse>("users")
  return data.data
}

// POST /api/users — create a new user (SUPER_ADMIN only)
export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const { data } = await httpClient.post<UserResponse>("users", payload)
  return data.data
}

// PATCH /api/users/:id/role — change a user's role (SUPER_ADMIN only)
export const updateUserRole = async (
  id: string,
  payload: UpdateUserRolePayload
): Promise<User> => {
  const { data } = await httpClient.patch<UserResponse>(`users/${id}/role`, payload)
  return data.data
}

// DELETE /api/users/:id — remove a user (SUPER_ADMIN only)
export const deleteUser = async (id: string): Promise<DeleteUserResponse["data"]> => {
  const { data } = await httpClient.delete<DeleteUserResponse>(`users/${id}`)
  return data.data
}