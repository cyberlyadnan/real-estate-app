/**
 * Public queries/lead form API
 */

import { API_BASE } from './config';

export async function submitQuery(data: {
  name: string;
  email: string;
  phone: string;
  message: string;
  subject?: string;
  source?: string;
  propertySlug?: string;
  propertyId?: string;
  propertyName?: string;
}): Promise<{ success: boolean; message?: string }> {
  const url = `${API_BASE}/api/public/queries`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || json.error || 'Failed to submit');
  return json;
}
