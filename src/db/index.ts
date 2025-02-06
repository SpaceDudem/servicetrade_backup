import { Sequelize } from 'sequelize'
import { env } from '@/config/environment'
import { logger } from '@/utils/logger'
import { initializeModels } from './models'

export async function initializeDatabase() {
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    dialectOptions: { ssl: env.DB_SSL },
    logging: (msg: string) => logger.debug(msg),
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  })

  try {
    await sequelize.authenticate()
    logger.info('Database connection established successfully')
    
    const models = initializeModels(sequelize)
    return { sequelize, models }
  } catch (error) {
    logger.error('Unable to connect to the database:', error)
    throw error
  }
} 