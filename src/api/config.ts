/**
 * API Configuration
 * - Android emulator: 10.0.2.2 (alias to host)
 * - iOS simulator: localhost
 * - Physical device: use your machine's LAN IP (e.g. 192.168.1.x)
 */

import { Platform } from 'react-native';

const LOCAL_IP = '10.0.2.2'; // Android emulator → host; use 192.168.x.x for physical device
const DEV_PORT = 5000;

export const API_BASE =
  __DEV__
    ? `http://${Platform.OS === 'android' ? LOCAL_IP : 'localhost'}:${DEV_PORT}`
    : 'https://your-production-api.com';

export const getUploadBase = (): string => API_BASE;
