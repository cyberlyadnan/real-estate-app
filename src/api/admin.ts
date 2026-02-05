/**
 * Admin API - Authenticated endpoints (properties, leads, queries, stats)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from './config';

const ACCESS_TOKEN_KEY = '@auth_access_token';

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<{ success: boolean; data?: T; message?: string }> {
  const token = await getToken();
  const url = `${API_BASE}/api${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers as Record<string, string>),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, message: json.message || json.error || 'Request failed' };
  return json;
}

export interface LeadStats {
  total: number;
  byStatus: Record<string, number>;
  overdueFollowUps: number;
  dueToday: number;
}

export async function getLeadStats(): Promise<{ success: boolean; data?: LeadStats; message?: string }> {
  return request<LeadStats>('/leads/stats');
}

export interface LeadItem {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  source: string;
  status: string;
  priority?: string;
  propertyName?: string;
  propertySlug?: string;
  nextFollowUpAt?: string | null;
  assignedTo?: { name: string; email: string } | null;
  createdAt: string;
  updatedAt?: string;
}

export interface FollowUpItem {
  _id: string;
  leadId: string;
  dueAt: string;
  type: string;
  title: string;
  notes?: string;
  completedAt?: string | null;
  completedBy?: { name: string } | null;
  createdAt: string;
}

export async function getLeads(params?: {
  limit?: number;
  page?: number;
  search?: string;
  status?: string;
  overdue?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<{ success: boolean; data?: LeadItem[]; pagination?: { page: number; limit: number; total: number; pages: number }; message?: string }> {
  const q = new URLSearchParams();
  if (params?.limit != null) q.set('limit', String(params.limit));
  if (params?.page != null) q.set('page', String(params.page));
  if (params?.search) q.set('search', params.search);
  if (params?.status) q.set('status', params.status);
  if (params?.overdue) q.set('overdue', 'true');
  if (params?.sortBy) q.set('sortBy', params.sortBy);
  if (params?.sortOrder) q.set('sortOrder', params.sortOrder);
  return request<any>(`/leads?${q.toString()}`);
}

export async function getLead(id: string): Promise<{ success: boolean; data?: LeadItem & { followUps?: FollowUpItem[] }; message?: string }> {
  return request<any>(`/leads/${id}`);
}

export async function createLead(data: {
  name: string;
  email: string;
  phone: string;
  message?: string;
  source?: string;
  propertySlug?: string;
  propertyName?: string;
  budget?: number;
  budgetMax?: number;
  preferredArea?: string;
  address?: string;
}): Promise<{ success: boolean; data?: LeadItem; message?: string }> {
  return request<LeadItem>('/leads', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateLead(id: string, data: {
  status?: string;
  priority?: string;
  notes?: string;
  nextFollowUpAt?: string | null;
  budget?: number | null;
  budgetMax?: number | null;
  preferredArea?: string | null;
  address?: string | null;
  lastContactMode?: string | null;
  contactHistory?: string | null;
}): Promise<{ success: boolean; data?: LeadItem; message?: string }> {
  return request<LeadItem>(`/leads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteLead(id: string): Promise<{ success: boolean; message?: string }> {
  return request<void>(`/leads/${id}`, { method: 'DELETE' });
}

export async function addLeadFollowUp(leadId: string, data: { dueAt: string; type?: string; title: string; notes?: string }): Promise<{ success: boolean; data?: FollowUpItem; message?: string }> {
  return request<FollowUpItem>(`/leads/${leadId}/follow-ups`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function completeLeadFollowUp(leadId: string, followUpId: string): Promise<{ success: boolean; data?: FollowUpItem; message?: string }> {
  return request<FollowUpItem>(`/leads/${leadId}/follow-ups/${followUpId}/complete`, {
    method: 'PATCH',
  });
}

export async function getLeadAlerts(): Promise<{
  success: boolean;
  data?: { overdueLeads: LeadItem[]; upcomingLeads: LeadItem[]; followUpsDue: FollowUpItem[] };
  message?: string;
}> {
  return request<any>('/leads/alerts');
}

export async function getProperties(params?: { limit?: number; page?: number; propertyType?: string; status?: string; search?: string }): Promise<{ success: boolean; data?: any[]; pagination?: any; message?: string }> {
  const q = new URLSearchParams();
  if (params?.limit != null) q.set('limit', String(params.limit));
  if (params?.page != null) q.set('page', String(params.page));
  if (params?.propertyType) q.set('propertyType', params.propertyType);
  if (params?.status) q.set('status', params.status);
  if (params?.search) q.set('search', params.search);
  return request<any>(`/properties?${q.toString()}`);
}

export async function getProperty(id: string): Promise<{ success: boolean; data?: any; message?: string }> {
  return request<any>(`/properties/${id}`);
}

export async function deleteProperty(id: string): Promise<{ success: boolean; message?: string }> {
  return request<void>(`/properties/${id}`, { method: 'DELETE' });
}

/** Create/update property - pass FormData. For create, omit id. */
async function propertyFormRequest(formData: FormData, method: 'POST' | 'PUT', id?: string): Promise<{ success: boolean; data?: any; message?: string }> {
  const token = await getToken();
  const url = id ? `${API_BASE}/api/properties/${id}` : `${API_BASE}/api/properties`;
  const headers: Record<string, string> = { ...(token && { Authorization: `Bearer ${token}` }) };
  // Do NOT set Content-Type - FormData sets it with boundary
  const res = await fetch(url, { method, headers, body: formData });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, message: json.message || json.error || 'Request failed' };
  return json;
}

export async function createProperty(formData: FormData): Promise<{ success: boolean; data?: any; message?: string }> {
  return propertyFormRequest(formData, 'POST');
}

export async function updateProperty(id: string, formData: FormData): Promise<{ success: boolean; data?: any; message?: string }> {
  return propertyFormRequest(formData, 'PUT', id);
}

export interface QueryItem {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  subject?: string;
  source: string;
  status: string;
  priority?: string;
  interestedProperty?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export async function getQueries(params?: {
  limit?: number;
  page?: number;
  search?: string;
  status?: string;
  source?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<{ success: boolean; data?: QueryItem[]; pagination?: { page: number; limit: number; total: number; pages: number }; message?: string }> {
  const q = new URLSearchParams();
  if (params?.limit != null) q.set('limit', String(params.limit));
  if (params?.page != null) q.set('page', String(params.page));
  if (params?.search) q.set('search', params.search);
  if (params?.status) q.set('status', params.status);
  if (params?.source) q.set('source', params.source);
  if (params?.sortBy) q.set('sortBy', params.sortBy);
  if (params?.sortOrder) q.set('sortOrder', params.sortOrder);
  return request<any>(`/queries?${q.toString()}`);
}

export async function getQuery(id: string): Promise<{ success: boolean; data?: QueryItem; message?: string }> {
  return request<QueryItem>(`/queries/${id}`);
}

export async function updateQuery(id: string, data: { status?: string; notes?: string; priority?: string }): Promise<{ success: boolean; data?: QueryItem; message?: string }> {
  return request<QueryItem>(`/queries/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteQuery(id: string): Promise<{ success: boolean; message?: string }> {
  return request<void>(`/queries/${id}`, { method: 'DELETE' });
}

export async function bulkUpdateQueryStatus(ids: string[], status: string): Promise<{ success: boolean; message?: string }> {
  return request<any>('/queries/bulk/status', {
    method: 'PATCH',
    body: JSON.stringify({ ids, status }),
  });
}
