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
  _id:         string;
  fullName:    string;
  companyName: string;
  email:       string;
  status:      'new' | 'contacted' | 'quoted' | 'converted' | 'closed';
  productType: string;
  createdAt:   string;
}

export interface CreatedBy {
  username: string;
}

export interface RecentBlog {
  _id:        string;
  title:      string;
  coverImage?: string | null;
  isActive:   boolean;
  createdAt:  string;
  tags?:      string[];
  createdBy?: CreatedBy;
  author?:    string;
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