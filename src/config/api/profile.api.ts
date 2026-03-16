import httpClient from "@/config/http/httpClient";

export interface Profile {
  id:           string;
  username:     string;
  email:        string;
  profileImage: string | null;
  isVerified:   boolean;
  role: "SUPER_ADMIN" | "BLOG_MANAGER"
}

export interface UpdateProfilePayload {
  username?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword:     string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data:    T;
}


export const getProfile = async (): Promise<Profile> => {
  const response = await httpClient.get<ApiResponse<Profile>>("profile");
  return response.data.data;
};


export const updateProfile = async (
  payload: UpdateProfilePayload,
  imageFile?: File | null
): Promise<Profile> => {
  const formData = new FormData();
  if (payload.username)  formData.append("username",     payload.username);
  if (imageFile)         formData.append("profileImage", imageFile);

  const response = await httpClient.patch<ApiResponse<Profile>>("profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};


export const changePassword = async (
  payload: ChangePasswordPayload
): Promise<void> => {
  await httpClient.patch<ApiResponse<null>>("profile/change-password", payload);
};