import { z } from 'zod'
import * as dotenv from 'dotenv'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_BASE_URL: z.string().url().default('https://api.servicetrade.com'),
  API_USERNAME: z.string().min(1),
  API_PASSWORD: z.string().min(1),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  RATE_LIMIT_WINDOW_MS: z.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.number().default(100),
})

dotenv.config()

export const env = envSchema.parse(process.env) 