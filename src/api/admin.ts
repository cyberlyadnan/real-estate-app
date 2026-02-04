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

export async function getLeads(params?: { limit?: number; page?: number }): Promise<{ success: boolean; data?: any[]; pagination?: any; message?: string }> {
  const q = new URLSearchParams();
  if (params?.limit != null) q.set('limit', String(params.limit));
  if (params?.page != null) q.set('page', String(params.page));
  q.set('sortBy', 'createdAt');
  q.set('sortOrder', 'desc');
  return request<any>(`/leads?${q.toString()}`);
}

export async function getProperties(params?: { limit?: number; page?: number }): Promise<{ success: boolean; data?: any[]; pagination?: any; message?: string }> {
  const q = new URLSearchParams();
  if (params?.limit != null) q.set('limit', String(params.limit));
  if (params?.page != null) q.set('page', String(params.page));
  return request<any>(`/properties?${q.toString()}`);
}

export async function getQueries(params?: { limit?: number; page?: number }): Promise<{ success: boolean; data?: any[]; pagination?: any; message?: string }> {
  const q = new URLSearchParams();
  if (params?.limit != null) q.set('limit', String(params.limit));
  if (params?.page != null) q.set('page', String(params.page));
  return request<any>(`/queries?${q.toString()}`);
}
