import { logger } from './logger.js';

export class ServiceTradeError extends Error {
  constructor(message, code, originalError = null) {
    super(message);
    this.name = 'ServiceTradeError';
    this.code = code;
    this.originalError = originalError;
  }
}

export class DatabaseError extends Error {
  constructor(message, operation, originalError = null) {
    super(message);
    this.name = 'DatabaseError';
    this.operation = operation;
    this.originalError = originalError;
  }
}

export function handleApiError(error, context) {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const status = error.response.status;
    const message = error.response.data?.message || error.message;
    
    switch (status) {
      case 401:
        logger.error('Authentication failed:', message);
        throw new ServiceTradeError('Authentication failed', 'AUTH_ERROR', error);
      case 403:
        logger.error('Access forbidden:', message);
        throw new ServiceTradeError('Access forbidden', 'FORBIDDEN', error);
      case 429:
        logger.warn('Rate limit exceeded:', message);
        throw new ServiceTradeError('Rate limit exceeded', 'RATE_LIMIT', error);
      case 500:
        logger.error('ServiceTrade server error:', message);
        throw new ServiceTradeError('ServiceTrade server error', 'SERVER_ERROR', error);
      default:
        logger.error(`API error (${status}):`, message);
        throw new ServiceTradeError(`API error: ${message}`, 'API_ERROR', error);
    }
  } else if (error.request) {
    // The request was made but no response was received
    logger.error('No response received from ServiceTrade:', error.message);
    throw new ServiceTradeError('No response from server', 'NETWORK_ERROR', error);
  } else {
    // Something happened in setting up the request
    logger.error('Error setting up request:', error.message);
    throw new ServiceTradeError('Request setup failed', 'REQUEST_ERROR', error);
  }
}

export function handleDatabaseError(error, operation) {
  if (error.name === 'SequelizeConnectionError') {
    logger.error('Database connection error:', error.message);
    throw new DatabaseError('Failed to connect to database', operation, error);
  } else if (error.name === 'SequelizeValidationError') {
    logger.error('Data validation error:', error.message);
    throw new DatabaseError('Data validation failed', operation, error);
  } else if (error.name === 'SequelizeUniqueConstraintError') {
    logger.warn('Duplicate record found:', error.message);
    throw new DatabaseError('Duplicate record', operation, error);
  } else {
    logger.error('Database error:', error.message);
    throw new DatabaseError('Database operation failed', operation, error);
  }
} 