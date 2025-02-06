import { logger } from './logger.js';

const REQUIRED_ENV_VARS = {
  // Database configuration
  DB_NAME: {
    description: 'Database name',
    validate: value => value && value.length > 0
  },
  DB_USER: {
    description: 'Database username',
    validate: value => value && value.length > 0
  },
  DB_PASSWORD: {
    description: 'Database password',
    validate: value => value !== undefined
  },
  DB_HOST: {
    description: 'Database host',
    validate: value => value && value.length > 0
  },
  DB_SSL: {
    description: 'Database SSL mode',
    validate: value => ['true', 'false', undefined].includes(value),
    default: 'false'
  },

  // ServiceTrade API configuration
  SERVICE_TRADE_USERNAME: {
    description: 'ServiceTrade API username',
    validate: value => value && value.length > 0
  },
  SERVICE_TRADE_PASSWORD: {
    description: 'ServiceTrade API password',
    validate: value => value && value.length > 0
  },
  SERVICE_TRADE_HOSTNAME: {
    description: 'ServiceTrade API hostname',
    validate: value => !value || /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value),
    default: 'api.servicetrade.com'
  },

  // Application configuration
  NODE_ENV: {
    description: 'Node environment',
    validate: value => ['development', 'warroom', 'production'].includes(value),
    default: 'development'
  },
  LOG_LEVEL: {
    description: 'Logging level',
    validate: value => ['error', 'warn', 'info', 'debug'].includes(value),
    default: 'info'
  }
};

export class EnvValidator {
  static validate() {
    const errors = [];
    const warnings = [];
    const config = {};

    // Check for required environment variables
    for (const [key, settings] of Object.entries(REQUIRED_ENV_VARS)) {
      const value = process.env[key] || settings.default;
      
      if (!value && !settings.default) {
        errors.push(`Missing required environment variable: ${key} (${settings.description})`);
        continue;
      }

      if (!settings.validate(value)) {
        errors.push(`Invalid value for ${key}: ${value}`);
        continue;
      }

      // Add validated value to config
      config[key] = value;

      // Check for potential security issues
      if (key.includes('PASSWORD') && value.length < 8) {
        warnings.push(`Weak ${key}: password should be at least 8 characters`);
      }
    }

    // Check for database URL format
    if (config.DB_HOST) {
      try {
        new URL(`postgres://${config.DB_HOST}`);
      } catch {
        warnings.push(`DB_HOST might be invalid: ${config.DB_HOST}`);
      }
    }

    // Log any warnings
    if (warnings.length > 0) {
      logger.warn('Configuration warnings:');
      warnings.forEach(warning => logger.warn(`- ${warning}`));
    }

    // If there are errors, log them and throw
    if (errors.length > 0) {
      logger.error('Configuration errors:');
      errors.forEach(error => logger.error(`- ${error}`));
      throw new Error('Invalid environment configuration');
    }

    return config;
  }

  static printEnvHelp() {
    console.log(`
Environment Variables:

Required:
${Object.entries(REQUIRED_ENV_VARS)
  .filter(([, settings]) => !settings.default)
  .map(([key, settings]) => `  ${key}
    Description: ${settings.description}
    Required: true`)
  .join('\n')}

Optional:
${Object.entries(REQUIRED_ENV_VARS)
  .filter(([, settings]) => settings.default)
  .map(([key, settings]) => `  ${key}
    Description: ${settings.description}
    Default: ${settings.default}`)
  .join('\n')}

Example .env file:
${Object.entries(REQUIRED_ENV_VARS)
  .map(([key, settings]) => `${key}=${settings.default || '<required>'}`)
  .join('\n')}
    `);
  }
} 