import { initializeDatabase } from '@/db';
import { ServiceTradeClient } from '@/api/client';
import { BackupService } from '@/services/backup';
import { env } from '@/config/environment';
import { logger } from '@/utils/logger';

export interface BackupOptions {
  entity?: string;
  fromId?: number;
  resume?: boolean;
}

async function main(options: BackupOptions = {}): Promise<void> {
  try {
    const { models } = await initializeDatabase();

    const client = new ServiceTradeClient({
      username: env.ST_USERNAME,
      password: env.ST_PASSWORD,
      baseUrl: env.ST_HOST
    });

    const backupService = new BackupService(client, models);
    await backupService.runBackup(options);
  } catch (error) {
    logger.error('Fatal error:', error);
    process.exit(1);
  }
}

// Node ESM check. In ESM, you can compare import.meta.url.
if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  main();
}

export { main }; 