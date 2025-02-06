export interface ServiceTradeConfig {
  baseUrl?: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  authenticated: boolean;
  authToken: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    totalPages?: number;
    currentPage?: number;
  }
} 