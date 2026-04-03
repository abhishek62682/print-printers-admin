import httpClient from "@/config/http/httpClient";

export interface BlogCreatedBy {
  _id: string;
  username: string;
  email: string;
}

export interface BlogSEO {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
}

export interface Blog {
  _id: string;
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string | null;
  coverImageAlt?: string;
  bannerImage?: string | null;
  bannerImageAlt?: string;
  authorName:string | ""
  tags?: string[];
  seo?: BlogSEO;
  createdBy?: BlogCreatedBy;
  isActive?: boolean;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
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
    `/blogs?${query.toString()}`
  );

  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination ?? {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
  };
};

export const getBlogById = async (id: string): Promise<Blog> => {
  const response = await httpClient.get<ApiResponse<Blog>>(`/blogs/${id}`);
  return response.data.data ?? {};
};

export const createBlog = async (formData: FormData): Promise<Blog> => {
  const response = await httpClient.post<ApiResponse<Blog>>("/blogs", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data ?? {};
};

export const updateBlog = async (id: string, formData: FormData): Promise<Blog> => {
  const response = await httpClient.patch<ApiResponse<Blog>>(`/blogs/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data ?? {};
};

export const deleteBlog = async (id: string): Promise<Blog> => {
  const response = await httpClient.delete<ApiResponse<Blog>>(`/blogs/${id}`);
  return response.data.data ?? {};
};