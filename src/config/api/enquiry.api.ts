import httpClient from "@/config/http/httpClient";

export type QuoteStatus = "new" | "contacted" | "quoted" | "converted" | "closed";

export interface RequestQuote {
  _id: string;
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  country: string;
  stateProvince: string;
  city: string;
  zipCode: string;

  bookTitle: string;
  bookCategory?: string;
  trimSize: string;
  orientation: "Portrait" | "Landscape" | "Square";
  proofType: "Epsons" | "PDFs" | "Full Book Digitally Printed";

  bindingType: string;
  bindingNotes?: string;
  coverStock: string;
  coverInk: "4/0 CMYK" | "1/0 Black" | "4/0 CMYK + Varnish" | "PMS" | "Custom";
  coverLamination: string;
  boardCalliper?: string;
  specialtyFinishes?: string;

  dustJacket: "No" | "Yes";
  dustJacketStock?: string;
  dustJacketInk?: string;
  dustJacketLamination?: string;
  dustJacketFinishes?: string;

  endsheetStock?: string;
  endsheetPrinting?: string;

  totalPages: string;
  textPaperStock: string;
  textInk: string;

  quantities: number[];

  packingMethod?: string;
  shippingMethod: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryCountry: string;
  deliveryZip: string;

  specialInstructions?: string;
  howDidYouHear?: string;

  status: QuoteStatus;
  notes?: string;

  createdAt: string;
  updatedAt: string;
}

export type CreateRequestQuotePayload = Omit<RequestQuote, "_id" | "status" | "notes" | "createdAt" | "updatedAt">;

export interface UpdateRequestQuotePayload {
  status?: QuoteStatus;
  notes?: string;
}

// ── Shared date filter params (reused in list + export) ───────────────────
export interface DateRangeParams {
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

export interface GetRequestQuotesParams extends DateRangeParams {
  bookCategory?: string;
  country?: string;
  status?: QuoteStatus;
  page?: number;
  limit?: number;
}

// Export has no page/limit — only filters
export interface ExportRequestQuotesParams extends DateRangeParams {
  bookCategory?: string;
  country?: string;
  status?: QuoteStatus;
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

export interface PaginatedRequestQuotes {
  data: RequestQuote[];
  pagination: PaginationMeta;
}

// POST — create quote request (public)
export const createRequestQuote = async (payload: CreateRequestQuotePayload): Promise<RequestQuote> => {
  const response = await httpClient.post<ApiResponse<RequestQuote>>("request-quotes", payload);
  return response.data.data;
};

// GET — all quote requests paginated (admin protected)
export const getAllRequestQuotes = async (
  params: GetRequestQuotesParams = {}
): Promise<PaginatedRequestQuotes> => {
  const response = await httpClient.get<ApiResponse<RequestQuote[]> & { pagination: PaginationMeta }>(
    "request-quotes",
    { params }
  );
  return {
    data:       response.data.data,
    pagination: response.data.pagination,
  };
};

// GET — export all matching quote requests, no pagination (admin protected)
export const exportRequestQuotes = async (
  params: ExportRequestQuotesParams = {}
): Promise<RequestQuote[]> => {
  const response = await httpClient.get<ApiResponse<RequestQuote[]>>(
    "request-quotes/export",
    { params }
  );
  return response.data.data;
};

// GET — single quote request by id (admin protected)
export const getRequestQuoteById = async (id: string): Promise<RequestQuote> => {
  const response = await httpClient.get<ApiResponse<RequestQuote>>(`request-quotes/${id}`);
  return response.data.data;
};

// PATCH — update quote request status + notes (admin protected)
export const updateRequestQuote = async (id: string, payload: UpdateRequestQuotePayload): Promise<RequestQuote> => {
  const response = await httpClient.patch<ApiResponse<RequestQuote>>(`request-quotes/${id}`, payload);
  return response.data.data;
};

// DELETE — quote request (admin protected)
export const deleteRequestQuote = async (id: string): Promise<void> => {
  await httpClient.delete<ApiResponse<RequestQuote>>(`request-quotes/${id}`);
};


// DELETE — enquiry (admin protected)
export const deleteEnquiry = async (id: string): Promise<void> => {
  await httpClient.delete<ApiResponse<unknown>>(`enquiries/${id}`);
};