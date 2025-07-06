export interface Property {
  id: string;
  title: string;
  type: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  status: string;
  amenities: string[];
  description: string;
  images: string[];
  agent: string;
  listingDate: string;
}

export interface Match {
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_profile: string;
  match_analysis: string;
  personalized_pitch: string;
  similarity_score: number;
}

export interface PropertyFilters {
  searchTerm: string;
  filterType: string;
  filterStatus: string;
  sortBy: string;
}

export interface MatchState {
  matches: Record<string, Match[]>;
  loadingMatches: Record<string, boolean>;
  matchErrors: Record<string, string>;
}
