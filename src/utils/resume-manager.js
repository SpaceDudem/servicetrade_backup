import { BackupLog } from '../models/backup-log.js';
import { logger } from './logger.js';

export class ResumeManager {
  async getLastSuccessfulBackup(entityType) {
    const lastBackup = await BackupLog.findOne({
      where: {
        entityType,
        status: 'completed'
      },
      order: [['endTime', 'DESC']]
    });
    
    return lastBackup?.lastStId || 0;
  }

  async shouldResume(entityType) {
    const runningBackup = await BackupLog.findOne({
      where: {
        entityType,
        status: 'running'
      }
    });

    if (runningBackup) {
      logger.warn(`Found interrupted backup for ${entityType}`);
      return true;
    }
    return false;
  }
} 