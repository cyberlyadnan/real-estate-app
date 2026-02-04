/**
 * Theme colors matching website (frontend/globals.css)
 * Gold brand: #D4AF37, #FFD700, #B8860B
 */

export const LightTheme = {
  // Primary brand
  primary: '#D4AF37',
  primaryLight: '#FFD700',
  primaryDark: '#B8860B',

  // Backgrounds
  bg: '#FFFFFF',
  bgSecondary: '#F9FAFB',
  bgTertiary: '#F3F4F6',

  // Card/surface
  card: '#FFFFFF',
  cardHover: '#F9FAFB',

  // Text
  text: '#111827',
  textSecondary: '#4B5563',
  textTertiary: '#6B7280',
  textMuted: '#9CA3AF',

  // Border
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderDark: '#D1D5DB',

  // Accent
  accent: '#D4AF37',
  accentHover: '#B8860B',

  // Status
  success: '#22C55E',
  error: '#EF4444',
  warning: '#EAB308',
  info: '#3B82F6',

  // Overlay
  overlay: '#000000',
  overlayLight: '#FFFFFF',
} as const;

export const DarkTheme = {
  // Primary brand (same gold)
  primary: '#D4AF37',
  primaryLight: '#FFD700',
  primaryDark: '#B8860B',

  // Backgrounds
  bg: '#0A0A0A',
  bgSecondary: '#0F0F0F',
  bgTertiary: '#1A1A1A',

  // Card/surface
  card: '#1A1A1A',
  cardHover: '#1F1F1F',

  // Text
  text: '#F3F4F6',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',
  textMuted: '#4B5563',

  // Border
  border: '#1F2937',
  borderLight: '#374151',
  borderDark: '#111827',

  // Accent
  accent: '#D4AF37',
  accentHover: '#FFD700',

  // Status
  success: '#22C55E',
  error: '#EF4444',
  warning: '#EAB308',
  info: '#3B82F6',

  // Overlay
  overlay: '#000000',
  overlayLight: '#FFFFFF',
} as const;
