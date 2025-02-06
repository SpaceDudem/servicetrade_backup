export const apiConfig = {
  baseUrl: process.env.SERVICE_TRADE_HOSTNAME || 'api.servicetrade.com',
  retryAttempts: 3,
  retryDelay: 1000,
  timeout: 30000,
  rateLimit: {
    maxRequests: 100,
    perMinute: 1
  }
}; 