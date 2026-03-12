import httpClient from "@/config/http/httpClient";

export interface Testimonial {
  _id: string;
  name: string;
  designation: string;
  content: string;
  imageUrl: string | null;
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

export interface GetTestimonialsParams {
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

export interface PaginatedTestimonials {
  data: Testimonial[];
  pagination: PaginationMeta;
}

// GET all testimonials with pagination + status filter
export const getAllTestimonials = async (
  params: GetTestimonialsParams = {}
): Promise<PaginatedTestimonials> => {
  const { page = 1, limit = 10, status } = params;

  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(status ? { status } : {}),
  });

  const response = await httpClient.get<ApiResponse<Testimonial[]>>(
    `testimonials?${query.toString()}`
  );

  return {
    data: response.data.data,
    pagination: response.data.pagination!,
  };
};

// POST create testimonial (protected, with image)
export const createTestimonial = async (formData: FormData): Promise<Testimonial> => {
  const response = await httpClient.post<ApiResponse<Testimonial>>("testimonials", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

// PATCH update testimonial (protected, with optional image)
export const updateTestimonial = async (id: string, formData: FormData): Promise<Testimonial> => {
  const response = await httpClient.patch<ApiResponse<Testimonial>>(`testimonials/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

// DELETE testimonial (protected)
export const deleteTestimonial = async (id: string): Promise<Testimonial> => {
  const response = await httpClient.delete<ApiResponse<Testimonial>>(`testimonials/${id}`);
  return response.data.data;
};