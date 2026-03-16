import httpClient from "@/config/http/httpClient";

export interface User {
  _id: string;
  username: string;
  email: string;
}

export interface AuditLog {
  _id: string;
  userId: string | User;
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "PROFILE_UPDATE" | "PASSWORD_CHANGE";
  module: "BLOG" | "TESTIMONIAL" | "ENQUIRY" | "USER" | "PROFILE" | "AUTH" | "SETTINGS";
  targetId: string | null;
  targetLabel: string | null;
  message: string;
  status: "SUCCESS" | "FAILED";
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AuditLogsResponse {
  data: AuditLog[];
  pagination: Pagination;
}

export interface GetMyLogsParams {
  page?: number;
  limit?: number;
  action?: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "PROFILE_UPDATE" | "PASSWORD_CHANGE";
  module?: "BLOG" | "TESTIMONIAL" | "ENQUIRY" | "USER" | "PROFILE" | "AUTH" | "SETTINGS";
  status?: "SUCCESS" | "FAILED";
  search?: string;
}

export interface GetAllLogsParams {
  page?: number;
  limit?: number;
  action?: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "PROFILE_UPDATE" | "PASSWORD_CHANGE";
  module?: "BLOG" | "TESTIMONIAL" | "ENQUIRY" | "USER" | "PROFILE" | "AUTH" | "SETTINGS";
  status?: "SUCCESS" | "FAILED";
  search?: string;
}

export interface AuditLogsApiResponse {
  success: boolean;
  message: string;
  data: AuditLog[];
  pagination: Pagination;
}

/**
 * Get current user's audit logs
 * @param params - Query parameters for filtering and pagination
 */
export const getMyAuditLogs = async (
  params?: GetMyLogsParams
): Promise<AuditLogsResponse> => {
  const response = await httpClient.get<AuditLogsApiResponse>(
    "audit-logs/my-logs",
    { params }
  );
  return {
    data: response.data.data,
    pagination: response.data.pagination,
  };
};

/**
 * Get all audit logs from all users (SUPER_ADMIN only)
 * @param params - Query parameters for filtering and pagination
 */
export const getAllAuditLogs = async (
  params?: GetAllLogsParams
): Promise<AuditLogsResponse> => {
  const response = await httpClient.get<AuditLogsApiResponse>(
    "audit-logs",
    { params }
  );
  return {
    data: response.data.data,
    pagination: response.data.pagination,
  };
};