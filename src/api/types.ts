export interface AuthConfig {
  username: string
  password: string
  baseUrl?: string
}

export interface AuthResponse {
  authenticated: boolean
  authToken: string
  user?: {
    id: number
    username: string
  }
}

export interface ApiResponse<T> {
  data: T
  meta?: {
    total: number
    totalPages: number
    currentPage: number
  }
}

export interface AttachmentParams {
  purposeId: number
  entityId: number
  entityType: number
  description?: string
}

export interface AttachmentFile {
  value: Buffer
  options: {
    filename: string
    contentType: string
  }
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  include?: string[]
}

export type ApiError = {
  code: string
  message: string
  originalError?: Error
} 