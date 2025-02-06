import { ApiError } from '../api/types'
import { logger } from '../lib/logger'

export class ServiceTradeError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'ServiceTradeError'
  }
}

export function handleApiError(error: any): never {
  if (error.response) {
    const status = error.response.status
    const message = error.response.data?.message || error.message
    
    switch (status) {
      case 401:
        logger.error('Authentication failed:', message)
        throw new ServiceTradeError('Authentication failed', 'AUTH_ERROR', error)
      case 403:
        logger.error('Access forbidden:', message)
        throw new ServiceTradeError('Access forbidden', 'FORBIDDEN', error)
      case 429:
        logger.warn('Rate limit exceeded:', message)
        throw new ServiceTradeError('Rate limit exceeded', 'RATE_LIMIT', error)
      case 500:
        logger.error('ServiceTrade server error:', message)
        throw new ServiceTradeError('ServiceTrade server error', 'SERVER_ERROR', error)
      default:
        logger.error(`API error (${status}):`, message)
        throw new ServiceTradeError(`API error: ${message}`, 'API_ERROR', error)
    }
  }
  
  if (error.request) {
    logger.error('No response received:', error.message)
    throw new ServiceTradeError('No response from server', 'NETWORK_ERROR', error)
  }
  
  logger.error('Request setup failed:', error.message)
  throw new ServiceTradeError('Request setup failed', 'REQUEST_ERROR', error)
} 