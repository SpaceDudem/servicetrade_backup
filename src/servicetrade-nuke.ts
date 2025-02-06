import { initializeDatabase } from './db'
import { ServiceTradeClient } from './api/client'
import { BackupService } from './services/backup'
import { ProgressReporter } from './utils/progress'
import { logger } from './utils/logger'
import { env } from './config/environment'

interface BackupOptions {
  entity?: string
  fromId?: number
  resume?: boolean
}

/**
 * Main entry point for the ServiceTrade backup tool
 * Handles initialization and orchestrates the backup process
 */
async function main(options: BackupOptions = {}): Promise<void> {
  try {
    const { models } = await initializeDatabase()
    
    const client = new ServiceTradeClient({
      username: env.ST_USERNAME,
      password: env.ST_PASSWORD,
      baseUrl: env.ST_HOST
    })

    const progress = new ProgressReporter()
    const backupService = new BackupService(client, models, progress)

    await backupService.runBackup(options)
  } catch (error) {
    logger.error('Fatal error:', error)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { main } 