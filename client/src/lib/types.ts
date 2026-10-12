import type { StageKey, RevenueRangeKey } from './constants';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'owner' | 'investor';
  createdAt: string;
}

export interface ListingOwner {
  _id: string;
  name: string;
  /**
   * Email is NEVER present on a listing response.
   * It is only included when an investor fetches their interest requests
   * and the status is 'accepted' — the server injects it at that point.
   * Never render this field on a listing card or detail page.
   */
  email?: string;
}

export interface Listing {
  _id: string;
  businessName: string;
  industry: string;
  location: { city: string; state: string };
  stage: StageKey;
  revenueRange: RevenueRangeKey;
  fundingGoal: number;
  fundingPurpose: string;
  description?: string;
  isActive: boolean;
  isSampleData?: boolean;
  owner: ListingOwner;
  savedByMe?: boolean;
  createdAt: string;
}

export interface BrowseResponse {
  data: Listing[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// API error shape thrown by the client
export interface ApiError extends Error {
  status: number;
  issues?: { path: string; message: string }[];
}
