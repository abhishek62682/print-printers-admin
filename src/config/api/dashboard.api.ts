import httpClient from '../http/httpClient';

export interface BlogStats {
  total:    number;
  active:   number;
  inactive: number;
}

export interface EnquiryStats {
  total:     number;
  new:       number;
  contacted: number;
  quoted:    number;
  converted: number;
  closed:    number;
}

export interface TestimonialStats {
  total:    number;
  active:   number;
  inactive: number;
}

export interface RecentEnquiry {
  _id:                  string;
  fullName:             string;
  companyName:          string;
  email:                string;
  phone:                string;
  country:              string;
  stateProvince:        string;
  city:                 string;
  zipCode:              string;
  bookTitle:            string;
  bookCategory?:        string;
  trimSize:             string;
  orientation:          string;
  proofType:            string;
  bindingType:          string;
  bindingNotes?:        string;
  coverStock:           string;
  coverInk:             string;
  coverLamination:      string;
  boardCalliper?:       string;
  specialtyFinishes?:   string;
  dustJacket:           string;
  dustJacketStock?:     string;
  dustJacketInk?:       string;
  dustJacketLamination?: string;
  dustJacketFinishes?:  string;
  endsheetStock?:       string;
  endsheetPrinting?:    string;
  totalPages:           string;
  textPaperStock:       string;
  textInk:              string;
  quantities:           number[];
  packingMethod?:       string;
  shippingMethod:       string;
  deliveryAddress:      string;
  deliveryCity:         string;
  deliveryCountry:      string;
  deliveryZip:          string;
  specialInstructions?: string;
  howDidYouHear?:       string;
  status:               string;
  notes?:               string;
  createdAt:            string;
  updatedAt:            string;
}

export interface CreatedBy {
  username: string;
}

export interface RecentBlog {
  _id:        string;
  title:      string;
  authorName:string;
  coverImage?: string | null;
  isActive:   boolean;
  createdAt:  string;
  tags?:      string[];
  createdBy?: CreatedBy;
}

export interface StatsData {
  blogs:           BlogStats;
  enquiries:       EnquiryStats;
  testimonials:    TestimonialStats;
  recentEnquiries: RecentEnquiry[];
  recentBlogs:     RecentBlog[];
}

export const getStats = async (): Promise<StatsData> => {
  const res = await httpClient.get('/dashboard');
  return res.data.data;
};