import axios from 'axios';
import { BACKEND_BASE_URL, API_ENDPOINTS } from '@/app/constants/config';
import type { 
  Order, 
  Master, 
  CreateOrderRequest, 
  OrderResponse,
  OrdersResponse,
  MastersResponse,
  MasterResponse
} from '@/types';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BACKEND_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(
      `🔄 ${config.method?.toUpperCase()} ${config.url}`,
      config.data || ''
    );
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    const errorMessage =
      error.response?.data?.error || error.message || 'Unknown error';
    console.error('❌ Response error:', errorMessage);

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

// Generic API methods
export const apiService = {
  // GET request
  get: <T>(url: string, params?: any): Promise<T> => {
    return apiClient.get(url, { params }).then((response) => response.data);
  },

  // POST request
  post: <T>(url: string, data?: any): Promise<T> => {
    return apiClient.post(url, data).then((response) => response.data);
  },

  // PUT request
  put: <T>(url: string, data?: any): Promise<T> => {
    return apiClient.put(url, data).then((response) => response.data);
  },

  // PATCH request
  patch: <T>(url: string, data?: any): Promise<T> => {
    return apiClient.patch(url, data).then((response) => response.data);
  },

  // DELETE request
  delete: <T>(url: string): Promise<T> => {
    return apiClient.delete(url).then((response) => response.data);
  },

  // Upload files
  upload: <T>(url: string, formData: FormData): Promise<T> => {
    return apiClient
      .post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((response) => response.data);
  },
};

// Transform backend snake_case to frontend camelCase
function transformOrderFromBackend(backendOrder: any): Order {
  return {
    id: backendOrder.id,
    customerName: backendOrder.customer_name,
    customerPhone: backendOrder.customer_phone,
    address: backendOrder.address,
    coordinates: {
      lat: backendOrder.latitude,
      lng: backendOrder.longitude
    },
    description: backendOrder.description,
    status: backendOrder.status,
    assignedMasterId: backendOrder.master_id,
    assignedMaster: backendOrder.assigned_master ? transformMasterFromBackend(backendOrder.assigned_master) : undefined,
    adlFiles: backendOrder.adl_files || [],
    createdAt: backendOrder.created_at,
    updatedAt: backendOrder.updated_at || backendOrder.created_at
  };
}

// Transform backend master to frontend format
function transformMasterFromBackend(backendMaster: any): Master {
  return {
    id: backendMaster.id,
    name: backendMaster.name,
    phone: backendMaster.phone,
    email: backendMaster.email || '', // Default empty string if not provided
    specialties: backendMaster.specialties || [], // Default empty array if not provided
    rating: typeof backendMaster.rating === 'number' ? backendMaster.rating : parseFloat(backendMaster.rating) || 0,
    isAvailable: (backendMaster.active_orders || 0) < 10, // Assume max 10 orders if not specified
    currentOrdersCount: backendMaster.active_orders || 0,
    maxOrdersCount: 10, // Default max orders
    location: {
      lat: typeof backendMaster.latitude === 'number' ? backendMaster.latitude : parseFloat(backendMaster.latitude) || 0,
      lng: typeof backendMaster.longitude === 'number' ? backendMaster.longitude : parseFloat(backendMaster.longitude) || 0
    },
    createdAt: backendMaster.created_at,
    updatedAt: backendMaster.updated_at || backendMaster.created_at
  };
}

// Order API methods
export const orderService = {
  // Create a new order
  createOrder: (orderData: CreateOrderRequest): Promise<OrderResponse> => {
    // Transform camelCase to snake_case for backend
    const backendData = {
      customer_name: orderData.customerName,
      customer_phone: orderData.customerPhone,
      address: orderData.address,
      latitude: orderData.coordinates.lat,
      longitude: orderData.coordinates.lng,
      description: orderData.description
    };
    return apiService.post<OrderResponse>(API_ENDPOINTS.ORDERS, backendData);
  },

  // Get all orders
  getAllOrders: (): Promise<OrdersResponse> => {
    return apiService.get<any>(API_ENDPOINTS.ORDERS).then(response => ({
      success: response.success,
      data: response.data.map(transformOrderFromBackend),
      message: response.message
    }));
  },

  // Get order by ID
  getOrder: (id: string): Promise<OrderResponse> => {
    return apiService.get<any>(`${API_ENDPOINTS.ORDERS}/${id}`).then(response => ({
      success: response.success,
      data: transformOrderFromBackend(response.data),
      message: response.message
    }));
  },

  // Assign master to order (automatic)
  assignMaster: (id: string, maxDistance?: number): Promise<OrderResponse> => {
    return apiService.post<OrderResponse>(`${API_ENDPOINTS.ORDERS}/${id}/assign`, { maxDistance });
  },

  // Upload ADL
  uploadADL: (id: string, file: File): Promise<OrderResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiService.upload<OrderResponse>(`${API_ENDPOINTS.ORDERS}/${id}/adl`, formData);
  },

  // Complete order
  completeOrder: (id: string): Promise<OrderResponse> => {
    return apiService.post<OrderResponse>(`${API_ENDPOINTS.ORDERS}/${id}/complete`);
  },
};

// Master API methods
export const masterService = {
  // Get all masters
  getAllMasters: (): Promise<MastersResponse> => {
    return apiService.get<any>(API_ENDPOINTS.MASTERS).then(response => ({
      success: response.success,
      data: response.data.map(transformMasterFromBackend),
      message: response.message
    }));
  },

  // Get master by ID
  getMaster: (id: string): Promise<MasterResponse> => {
    return apiService.get<any>(`${API_ENDPOINTS.MASTERS}/${id}`).then(response => ({
      success: response.success,
      data: transformMasterFromBackend(response.data),
      message: response.message
    }));
  },
};

// Health check
export const healthService = {
  checkHealth: (): Promise<{ status: string; timestamp: string }> => {
    return apiService.get<{ status: string; timestamp: string }>(API_ENDPOINTS.HEALTH);
  },
};
