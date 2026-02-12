/**
 * Analytics tracking - property views for admin dashboard stats
 */

import { API_BASE } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VISITOR_ID_KEY = '@analytics_visitor_id';

async function getVisitorId(): Promise<string> {
  let id = await AsyncStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = `app_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    await AsyncStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

/**
 * Track a property view so it appears in admin analytics.
 * Call once when the user views a property detail screen.
 */
export async function trackPropertyView(propertyId: string, propertySlug: string): Promise<void> {
  try {
    const visitorId = await getVisitorId();
    const sessionId = `session_${Date.now()}`;
    await fetch(`${API_BASE}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        visitorId,
        page: `/properties/${propertySlug}`,
        propertyId,
        propertySlug,
        device: 'mobile',
        browser: 'Mobile App',
        os: 'React Native',
      }),
    });
  } catch (e) {
    if (__DEV__) {
      console.warn('Analytics trackPropertyView failed:', e);
    }
  }
}
