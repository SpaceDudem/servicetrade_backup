import pino from 'pino'
import { env } from '@/config/environment'

export const logger = pino({
  level: env.LOG_LEVEL,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
}) 