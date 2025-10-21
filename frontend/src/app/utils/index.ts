import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@constants';

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString();
};

export const formatCoordinates = (lat: number, lng: number, precision: number = 6): string => {
  return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending': return '#f59e0b';
    case 'assigned': return '#3b82f6';
    case 'in_progress': return '#8b5cf6';
    case 'completed': return '#10b981';
    default: return '#6b7280';
  }
};

export const validateFileType = (file: File): boolean => {
  return ALLOWED_FILE_TYPES.includes(file.type);
};

export const validateFileSize = (file: File): boolean => {
  return file.size <= MAX_FILE_SIZE;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileTypeIcon = (fileType: string): string => {
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType.startsWith('video/')) return '🎥';
  return '📄';
};
