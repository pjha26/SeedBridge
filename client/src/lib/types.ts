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
  // email only present in interest/sent when status === 'accepted'
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
