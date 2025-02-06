import { z } from 'zod'
import * as dotenv from 'dotenv'

dotenv.config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // Database
  DB_HOST: z.string(),
  DB_PORT: z.string().transform(Number).default('5432'),
  DB_NAME: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_SSL: z.string().transform(val => val === 'true').default('false'),
  
  // ServiceTrade API
  ST_HOST: z.string().default('api.servicetrade.com'),
  ST_USERNAME: z.string(),
  ST_PASSWORD: z.string(),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.number().default(100)
})

export const env = envSchema.parse(process.env) 