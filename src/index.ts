import axios, { AxiosInstance, AxiosError } from 'axios'
import createAuthRefreshInterceptor from 'axios-auth-refresh'
import FormData from 'form-data'
import { rateLimit } from 'express-rate-limit'
import { logger } from './utils/logger'
import { env } from './config/environment'
import {
  ServiceTradeConfig,
  AuthResponse,
  ApiResponse,
  AttachmentParams,
  AttachmentFile,
} from './types'
import { ServiceTradeClient } from './api/client'

export class ServiceTradeError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ServiceTradeError'
  }
}

export class ServiceTrade {
  private request: AxiosInstance
  private rateLimiter: ReturnType<typeof rateLimit>

  constructor(private config: ServiceTradeConfig) {
    this.request = axios.create({
      baseURL: `${config.baseUrl || env.API_BASE_URL}/api`,
      maxBodyLength: Infinity,
      headers: {
        'User-Agent': config.userAgent || 'ServiceTrade-Node-SDK',
      },
    })

    this.setupInterceptors()
    this.setupRateLimiting()
  }

  private setupInterceptors(): void {
    // Response interceptor
    this.request.interceptors.response.use(
      (response) => {
        this.handleCookies(response)
        return response?.data?.data || null
      },
      (error: AxiosError) => {
        logger.error({
          error: error.message,
          status: error.response?.status,
          path: error.config?.url,
        })

        throw new ServiceTradeError(
          error.message,
          error.response?.status,
          error.code
        )
      }
    )

    // Auth refresh interceptor
    if (!this.config.disableRefreshAuth) {
      const refreshAuthLogic = async (failedRequest: any) => {
        logger.debug('Refreshing authentication...')
        await this.resetAuth()
        return this.login()
      }

      createAuthRefreshInterceptor(this.request, refreshAuthLogic)
    }
  }

  private setupRateLimiting(): void {
    this.rateLimiter = rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX_REQUESTS,
      message: 'Too many requests from this client',
    })
  }

  private async handleCookies(response: any): Promise<void> {
    if (
      !this.request.defaults.headers.Cookie ||
      !Object.keys(this.request.defaults.headers.Cookie).length
    ) {
      if (response.headers?.['set-cookie']) {
        const [cookie] = response.headers['set-cookie']
        this.request.defaults.headers.Cookie = cookie
      }
    }
  }

  private async resetAuth(): Promise<void> {
    this.request.defaults.headers.Cookie = null
    if (this.config.onResetCookie) {
      await this.config.onResetCookie()
    }
  }

  public async login(
    username?: string,
    password?: string
  ): Promise<AuthResponse> {
    try {
      const auth = {
        username: username || this.config.username || env.API_USERNAME,
        password: password || this.config.password || env.API_PASSWORD,
      }

      const result = await this.request.post<ApiResponse<AuthResponse>>(
        '/auth',
        auth
      )

      if (this.config.onSetCookie) {
        await this.config.onSetCookie(result)
      }

      return result
    } catch (error) {
      await this.resetAuth()
      throw error
    }
  }

  public async logout(): Promise<void> {
    await this.request.delete('/auth')
    await this.resetAuth()
  }

  public async get<T>(path: string): Promise<T> {
    await this.rateLimiter(null as any, null as any, () => {})
    return this.request.get<ApiResponse<T>>(path)
  }

  public async put<T>(path: string, data: any): Promise<T> {
    await this.rateLimiter(null as any, null as any, () => {})
    return this.request.put<ApiResponse<T>>(path, data)
  }

  public async post<T>(path: string, data: any): Promise<T> {
    await this.rateLimiter(null as any, null as any, () => {})
    return this.request.post<ApiResponse<T>>(path, data)
  }

  public async delete(path: string): Promise<void> {
    await this.rateLimiter(null as any, null as any, () => {})
    return this.request.delete(path)
  }

  public async attach(
    params: AttachmentParams,
    file: AttachmentFile
  ): Promise<any> {
    const formData = new FormData()
    
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value)
    })
    
    formData.append('uploadedFile', file.value, file.options)

    return this.request.post('/attachment', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...formData.getHeaders(),
      },
    })
  }
}

const client = new ServiceTradeClient({
  baseUrl: `https://${env.ST_HOST}`,
  username: env.ST_USERNAME,
  password: env.ST_PASSWORD
})

export default client 