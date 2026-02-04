/**
 * Layout constants - spacing, dimensions, industry standard
 */

import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const Layout = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,

  /** Base spacing scale (4px grid) */
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  } as const,

  /** Border radius */
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  } as const,

  /** Card dimensions */
  card: {
    imageHeight: 180,
    imageHeightCompact: 120,
  } as const,
} as const;
