import axios from 'axios';
import { BACKEND_BASE_URL, API_ENDPOINTS } from '@/app/constants/config';
import type { 
  Order, 
  Master, 
  CreateOrderRequest, 
  AssignMasterRequest,
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

// Order API methods
export const orderService = {
  // Create a new order
  createOrder: (orderData: CreateOrderRequest): Promise<OrderResponse> => {
    return apiService.post<OrderResponse>(API_ENDPOINTS.ORDERS, orderData);
  },

  // Get all orders
  getAllOrders: (): Promise<OrdersResponse> => {
    return apiService.get<OrdersResponse>(API_ENDPOINTS.ORDERS);
  },

  // Get order by ID
  getOrder: (id: string): Promise<OrderResponse> => {
    return apiService.get<OrderResponse>(`${API_ENDPOINTS.ORDERS}/${id}`);
  },

  // Assign master to order
  assignMaster: (id: string, assignmentData: AssignMasterRequest): Promise<OrderResponse> => {
    return apiService.post<OrderResponse>(`${API_ENDPOINTS.ORDERS}/${id}/assign`, assignmentData);
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
    return apiService.get<MastersResponse>(API_ENDPOINTS.MASTERS);
  },

  // Get master by ID
  getMaster: (id: string): Promise<MasterResponse> => {
    return apiService.get<MasterResponse>(`${API_ENDPOINTS.MASTERS}/${id}`);
  },
};

// Health check
export const healthService = {
  checkHealth: (): Promise<{ status: string; timestamp: string }> => {
    return apiService.get<{ status: string; timestamp: string }>(API_ENDPOINTS.HEALTH);
  },
};
