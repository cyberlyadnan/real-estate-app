/**
 * Properties API - Public endpoints (no auth)
 */

import { API_BASE, getUploadBase } from './config';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop&q=80';

export interface PropertyListItem {
  _id: string;
  slug: string;
  name: string;
  location: string;
  price: string;
  image: string;
  bedrooms: number | string;
  bathrooms: number | string;
  area: string;
  propertyType?: string;
  category?: string;
}

export interface LocationInfo {
  title: string;
  value: string;
  description: string;
  icon?: string;
}

export interface InvestmentHighlight {
  title: string;
  value: string;
  description: string;
  color?: string;
}

export interface PropertyDetail extends PropertyListItem {
  description: string;
  shortDescription?: string;
  images: string[];
  priceAmount?: number;
  priceCurrency?: string;
  pricePerSqft?: number;
  originalPrice?: number;
  discount?: number;
  paymentPlan?: string;
  downPayment?: number;
  monthlyPayment?: number;
  locationFull?: {
    address?: string;
    city?: string;
    area?: string;
    emirate?: string;
    country?: string;
    zipCode?: string;
    landmarks?: string[];
  };
  details?: {
    bedrooms?: number;
    bathrooms?: number;
    parking?: number;
    area?: { builtUp?: number; plot?: number; balcony?: number };
    yearBuilt?: number;
    floorNumber?: number;
    totalFloors?: number;
    furnishing?: string;
    facing?: string;
  };
  features?: string[];
  amenities?: string[];
  locationInfo?: LocationInfo[];
  investmentHighlights?: InvestmentHighlight[];
  developer?: string;
  handoverDate?: string;
  ownershipType?: string;
  titleDeed?: boolean;
  mortgageAvailable?: boolean;
  status?: string;
  propertyType?: string;
  category?: string;
  virtualTour?: string;
  floorPlan?: string;
  videos?: string[];
}

function toImageUrl(src: string | undefined): string {
  if (!src) return PLACEHOLDER;
  if (src.startsWith('http')) return src;
  const base = getUploadBase();
  return `${base}${src.startsWith('/') ? '' : '/'}${src}`;
}

function mapProperty(p: Record<string, any>): PropertyListItem {
  const loc = p.location || {};
  const area = p.details?.area?.builtUp ?? '';
  return {
    _id: p._id,
    slug: p.slug || '',
    name: p.name || '',
    location: [loc.area, loc.city].filter(Boolean).join(', ') || 'Dubai',
    price:
      p.price?.amount != null
        ? `${p.price.currency || 'AED'} ${Number(p.price.amount).toLocaleString()}`
        : 'Price on request',
    image: p.images?.[0] ? toImageUrl(p.images[0]) : PLACEHOLDER,
    bedrooms: p.details?.bedrooms ?? '–',
    bathrooms: p.details?.bathrooms ?? '–',
    area: area ? `${Number(area).toLocaleString()} sqft` : '–',
    propertyType: p.propertyType,
    category: p.category,
  };
}

export async function fetchProperties(params?: {
  limit?: number;
  skip?: number;
  featured?: boolean;
}): Promise<{ data: PropertyListItem[]; pagination: { total: number } }> {
  const q = new URLSearchParams();
  if (params?.limit != null) q.set('limit', String(params.limit));
  if (params?.skip != null) q.set('skip', String(params.skip));
  if (params?.featured === true) q.set('featured', 'true');
  const query = q.toString();
  const url = `${API_BASE}/api/public/properties${query ? `?${query}` : ''}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || json.error || 'Failed to fetch');
  const data = (json.data || []).map(mapProperty);
  return {
    data,
    pagination: json.pagination || { total: data.length },
  };
}

export async function fetchPropertyBySlug(
  slug: string
): Promise<PropertyDetail | null> {
  const url = `${API_BASE}/api/public/properties/slug/${encodeURIComponent(slug)}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.success || !json.data) return null;
  const p = json.data;
  const base = mapProperty(p) as PropertyDetail;
  base.description = p.description || '';
  base.shortDescription = p.shortDescription || '';
  base.images = (p.images || []).map((s: string) => toImageUrl(s));
  base.image = base.images[0] || PLACEHOLDER;
  base.priceAmount = p.price?.amount;
  base.priceCurrency = p.price?.currency || 'AED';
  base.pricePerSqft = p.price?.pricePerSqft;
  base.originalPrice = p.price?.originalPrice;
  base.discount = p.price?.discount;
  base.paymentPlan = p.price?.paymentPlan;
  base.downPayment = p.price?.downPayment;
  base.monthlyPayment = p.price?.monthlyPayment;
  base.locationFull = p.location;
  base.details = p.details;
  base.features = p.features || [];
  base.amenities = p.amenities || [];
  base.locationInfo = p.locationInfo || [];
  base.investmentHighlights = p.investmentHighlights || [];
  base.developer = p.developer;
  base.handoverDate = p.handoverDate ? new Date(p.handoverDate).toLocaleDateString() : undefined;
  base.ownershipType = p.ownershipType;
  base.titleDeed = p.titleDeed;
  base.mortgageAvailable = p.mortgageAvailable;
  base.status = p.status;
  base.propertyType = p.propertyType;
  base.category = p.category;
  base.virtualTour = p.virtualTour;
  base.floorPlan = p.floorPlan;
  base.videos = (p.videos || []).map((s: string) =>
    s.startsWith('http') ? s : `${getUploadBase()}${s.startsWith('/') ? '' : '/'}${s}`
  );
  return base;
}
