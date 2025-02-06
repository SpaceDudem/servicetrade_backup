export interface ServiceTradeConfig {
  baseUrl?: string
  username?: string
  password?: string
  cookie?: string
  userAgent?: string
  disableRefreshAuth?: boolean
  onSetCookie?: (value: AuthResponse) => Promise<void>
  onResetCookie?: () => Promise<void>
}

export interface AuthResponse {
  authenticated: boolean
  authToken: string
}

export interface ApiResponse<T> {
  data: T
  meta?: {
    totalPages: number
    currentPage: number
  }
}

export interface AttachmentParams {
  entityId: number
  entityType: number
  purposeId: number
  description?: string
}

export interface AttachmentFile {
  value: Buffer
  options: {
    filename: string
    contentType: string
  }
} 