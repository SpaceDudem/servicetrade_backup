import { Sequelize } from 'sequelize';
import { logger } from '../utils/logger.js';
import { handleDatabaseError } from '../utils/error-handler.js';
import { databaseConfig } from '../config/database.js';

export async function initializeDatabase() {
  const config = databaseConfig[process.env.NODE_ENV || 'development'];
  const sequelize = new Sequelize(config.database, config.username, config.password, {
    ...config,
    retry: {
      max: 3,
      timeout: 3000,
      match: [
        /ConnectionError/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SASL: SCRAM-SERVER-FIRST-MESSAGE/
      ]
    }
  });

  // Test connection with retries
  let retries = 3;
  while (retries > 0) {
    try {
      await sequelize.authenticate();
      logger.info('Database connection established successfully.');
      return sequelize;
    } catch (error) {
      retries--;
      if (retries === 0) {
        handleDatabaseError(error, 'connection');
      }
      logger.warn(`Database connection failed, retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
} 