import httpClient from "@/config/http/httpClient";

export type EnquiryStatus = "new" | "contacted" | "quoted" | "converted" | "closed";

export interface Enquiry {
  _id: string;
  fullName: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  country: string;
  productType: "Books" | "Board Books" | "Journals/Diaries" | "Greeting Cards" | "Packaging" | "Other";
  bindingType: "Paperback / Perfect Bound" | "Hardcase" | "Board Book" | "Saddle Stitch" | "Spiral/Wiro" | "Not Sure";
  approximateQuantity: string;
  requiredDeliveryDate?: string;
  specialtyFinishing: string;
  projectDescription?: string;
  howDidYouHear?: "Google Search" | "Social Media" | "Referral / Word of Mouth" | "Trade Show / Event" | "Advertisement" | "Email / Newsletter" | "Other";
  status: EnquiryStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateEnquiryPayload = Omit<Enquiry, "_id" | "status" | "notes" | "createdAt" | "updatedAt">;

export interface UpdateEnquiryPayload {
  status?: EnquiryStatus;
  notes?: string;
}

export interface GetEnquiriesParams {
  productType?: string;
  country?: string;
  status?: EnquiryStatus;
  page?: number;
  limit?: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedEnquiries {
  data: Enquiry[];
  pagination: PaginationMeta;
}

// POST create enquiry (public)
export const createEnquiry = async (payload: CreateEnquiryPayload): Promise<Enquiry> => {
  const response = await httpClient.post<ApiResponse<Enquiry>>("enquiries", payload);
  return response.data.data;
};

// GET all enquiries (admin protected)
export const getAllEnquiries = async (
  params: GetEnquiriesParams = {}
): Promise<PaginatedEnquiries> => {
  const response = await httpClient.get<ApiResponse<Enquiry[]> & { pagination: PaginationMeta }>(
    "enquiries",
    { params }
  );
  return {
    data: response.data.data,
    pagination: response.data.pagination,
  };
};

// GET single enquiry by id (admin protected)
export const getEnquiryById = async (id: string): Promise<Enquiry> => {
  const response = await httpClient.get<ApiResponse<Enquiry>>(`enquiries/${id}`);
  return response.data.data;
};

// PATCH update enquiry status + notes (admin protected)
export const updateEnquiry = async (id: string, payload: UpdateEnquiryPayload): Promise<Enquiry> => {
  const response = await httpClient.patch<ApiResponse<Enquiry>>(`enquiries/${id}`, payload);
  return response.data.data;
};

// DELETE enquiry (admin protected)
export const deleteEnquiry = async (id: string): Promise<Enquiry> => {
  const response = await httpClient.delete<ApiResponse<Enquiry>>(`enquiries/${id}`);
  return response.data.data;
};