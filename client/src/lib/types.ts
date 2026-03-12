export interface CompanionImage {
  id: string;
  position: number;
  thumbUrl: string;
  mediumUrl: string;
  fullUrl: string;
  width: number;
  height: number;
  blurHash: string | null;
  isPrimary: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  count?: number;
}

export interface Companion {
  id: string;
  name: string;
  age: number;
  bio: string | null;
  tagline: string | null;
  ethnicity: string | null;
  bodyType: string | null;
  hairColor: string | null;
  eyeColor: string | null;
  height: number | null;
  languages: string[];
  services: string[];
  availability: string | null;
  city: string;
  region: string | null;
  country: string;
  pricePerHour: number | null;
  currency: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  featured: boolean;
  primaryImage: CompanionImage | null;
  images: CompanionImage[];
  categories: Category[];
  createdAt: string;
}

export interface CompanionConnection {
  edges: Companion[];
  nextCursor: string | null;
  hasMore: boolean;
  totalCount: number;
}

export interface GetCompanionsData {
  companions: CompanionConnection;
}

export interface GetCompanionDetailData {
  companion: Companion | null;
}

export interface GetCategoriesData {
  categories: Category[];
}

export interface GetFeaturedData {
  featuredCompanions: Companion[];
}
