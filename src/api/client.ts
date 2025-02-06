import { logger } from '@/utils/logger'
import type { AuthResponse, ServiceTradeConfig, ApiResponse } from '@/types'
import { handleApiError } from '@/utils/error-handler'

interface RequestConfig {
  params?: Record<string, string | number>
  headers?: Record<string, string>
}

export class ServiceTradeClient {
  private authToken: string | null = null
  private readonly baseUrl: string
  private readonly auth: {
    username: string
    password: string
  }

  constructor(config: ServiceTradeConfig) {
    this.baseUrl = config.baseUrl || 'https://api.servicetrade.com'
    this.auth = {
      username: config.username,
      password: config.password
    }
  }

  private async authenticate(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.auth)
      })

      const { data } = await response.json() as { data: AuthResponse }
      if (!data?.authToken) throw new Error('No auth token received')
      
      this.authToken = data.authToken
      logger.info('Successfully authenticated with ServiceTrade')
    } catch (error) {
      logger.error('Authentication failed:', error)
      throw error
    }
  }

  private getAuthHeaders(): Record<string, string> {
    if (!this.authToken) throw new Error('Not authenticated')
    return {
      Authorization: `Bearer ${this.authToken}`,
      'Content-Type': 'application/json'
    }
  }

  async get<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    if (!this.authToken) await this.authenticate()

    try {
      const response = await fetch(`${this.baseUrl}/api${endpoint}`, {
        method: 'GET',
        headers: {
          ...config.headers,
          ...this.getAuthHeaders()
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          await this.authenticate()
          return this.get(endpoint, config)
        }
        throw new Error(`Failed to fetch: ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      logger.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  async post<T>(endpoint: string, body: unknown, config: RequestConfig = {}): Promise<T> {
    if (!this.authToken) await this.authenticate()

    try {
      const response = await fetch(`${this.baseUrl}/api${endpoint}`, {
        method: 'POST',
        headers: {
          ...config.headers,
          ...this.getAuthHeaders()
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        if (response.status === 401) {
          await this.authenticate()
          return this.post(endpoint, body, config)
        }
        throw await handleApiError(response)
      }

      const { data } = await response.json()
      return data
    } catch (error) {
      logger.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    if (!this.authToken) await this.authenticate()
    const response = await fetch(`${this.baseUrl}/api${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      throw new Error(`Failed to update: ${response.statusText}`)
    }
    return response.json()
  }

  // Implement additional methods (delete, attach) as needed.
} 