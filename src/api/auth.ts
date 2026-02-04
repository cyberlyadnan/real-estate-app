/**
 * Auth API - login, logout, refresh, getMe (matches backend /api/auth)
 */

import { API_BASE } from './config';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  lastLogin?: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: string }> {
  const { token, ...init } = options;
  const url = `${API_BASE}/api${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(init.headers as Record<string, string>),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, message: json.message || json.error || 'Request failed' };
  }
  return json;
}

export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; data?: AuthResponse; message?: string }> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function refreshToken(
  refreshToken: string
): Promise<{ success: boolean; data?: { accessToken: string }; message?: string }> {
  return request<{ accessToken: string }>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export async function logout(accessToken: string): Promise<{ success: boolean; message?: string }> {
  return request('/auth/logout', {
    method: 'POST',
    token: accessToken,
  });
}

export async function getMe(
  accessToken: string
): Promise<{ success: boolean; data?: { user: AuthUser }; message?: string }> {
  return request<{ user: AuthUser }>('/auth/me', { token: accessToken });
}
