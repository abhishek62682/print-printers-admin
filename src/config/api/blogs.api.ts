import httpClient from "@/config/http/httpClient";

export interface BlogCreatedBy {
  _id: string;
  username: string;
  email: string;
}

export interface Blog {
  _id: string;
  title: string;
  content: string;
  coverImage: string | null;
  bannerImage: string | null;
  tags: string[];
  createdBy: BlogCreatedBy;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GetBlogsParams {
  page?: number;
  limit?: number;
  status?: 'active' | 'inactive';
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface PaginatedBlogs {
  data: Blog[];
  pagination: PaginationMeta;
}

// GET all blogs with pagination + status filter
export const getAllBlogs = async (
  params: GetBlogsParams = {}
): Promise<PaginatedBlogs> => {
  const { page = 1, limit = 10, status } = params;

  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(status ? { status } : {}),
  });

  const response = await httpClient.get<ApiResponse<Blog[]>>(
    `/admin/blogs?${query.toString()}`
  );

  return {
    data: response.data.data,
    pagination: response.data.pagination!,
  };
};

// GET single blog by id (public)
export const getBlogById = async (id: string): Promise<Blog> => {
  const response = await httpClient.get<ApiResponse<Blog>>(`/admin/blogs/${id}`);
  return response.data.data;
};

// POST create blog (protected, with coverImage + bannerImage)
export const createBlog = async (formData: FormData): Promise<Blog> => {
  const response = await httpClient.post<ApiResponse<Blog>>("/admin/blogs", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

// PATCH update blog (protected, with optional coverImage + bannerImage)
export const updateBlog = async (id: string, formData: FormData): Promise<Blog> => {
  const response = await httpClient.patch<ApiResponse<Blog>>(`/admin/blogs/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

// DELETE blog (protected)
export const deleteBlog = async (id: string): Promise<Blog> => {
  const response = await httpClient.delete<ApiResponse<Blog>>(`blogs/${id}`);
  return response.data.data;
};