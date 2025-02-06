import { BackupLog } from '../models/backup-log.js';
import { logger } from './logger.js';

export class StatusReporter {
  async getBackupStatus() {
    const status = {
      running: [],
      completed: [],
      failed: []
    };

    const logs = await BackupLog.findAll({
      order: [['startTime', 'DESC']],
      limit: 100
    });

    for (const log of logs) {
      status[log.status].push({
        entity: log.entityType,
        startTime: log.startTime,
        endTime: log.endTime,
        success: log.successCount,
        errors: log.errorCount,
        total: log.totalRecords,
        error: log.error
      });
    }

    return status;
  }

  async printStatus() {
    const status = await this.getBackupStatus();
    
    logger.info('\n=== Backup Status ===');
    
    if (status.running.length > 0) {
      logger.info('\nCurrently Running:');
      status.running.forEach(job => {
        const progress = (job.success / job.total * 100).toFixed(1);
        logger.info(`${job.entity}: ${progress}% (${job.success}/${job.total})`);
      });
    }

    if (status.failed.length > 0) {
      logger.error('\nFailed Jobs:');
      status.failed.forEach(job => {
        logger.error(`${job.entity}: ${job.error}`);
      });
    }

    logger.info('\nCompleted Jobs:');
    status.completed.forEach(job => {
      logger.info(
        `${job.entity}: ${job.success} records (${job.errors} errors)`
      );
    });
  }
} 