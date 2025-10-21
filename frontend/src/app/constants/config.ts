export const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  ORDERS: '/api/v1/orders',
  MASTERS: '/api/v1/masters',
} as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

export const ADL_FILE_TYPES = {
  PHOTO: 'photo',
  VIDEO: 'video',
} as const;

export const MAX_FILE_SIZE = parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '10485760'); // 10MB

export const ALLOWED_FILE_TYPES = (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'image/jpeg,image/png,video/mp4,video/quicktime').split(',');

export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'Nexa Order Flow MVP',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  MOCK_DATA: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
} as const;
