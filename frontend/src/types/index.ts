// Order related types
export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  description: string;
  status: OrderStatus;
  assignedMasterId?: string;
  assignedMaster?: Master;
  adlFiles?: ADLFile[];
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'pending' | 'assigned' | 'in_progress' | 'completed';

export interface CreateOrderRequest {
  customerName: string;
  customerPhone: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  description: string;
}

export interface OrderResponse {
  success: boolean;
  data: Order;
  message?: string;
}

export interface OrdersResponse {
  success: boolean;
  data: Order[];
  message?: string;
}

// Master related types
export interface Master {
  id: string;
  name: string;
  phone: string;
  email: string;
  specialties: string[];
  rating: number;
  isAvailable: boolean;
  currentOrdersCount: number;
  maxOrdersCount: number;
  location?: {
    lat: number;
    lng: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MasterResponse {
  success: boolean;
  data: Master;
  message?: string;
}

export interface MastersResponse {
  success: boolean;
  data: Master[];
  message?: string;
}

// ADL File types
export interface ADLFile {
  id: string;
  orderId: string;
  fileName: string;
  fileType: 'photo' | 'video';
  fileSize: number;
  filePath: string;
  uploadedAt: string;
}

// API Error types
export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

// Form types
export interface OrderFormData {
  customerName: string;
  customerPhone: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  description: string;
}

export interface MasterAssignmentFormData {
  masterId: string;
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Map types
export interface MapMarker {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  title: string;
  description?: string;
  type: 'order' | 'master';
  status?: OrderStatus;
}
