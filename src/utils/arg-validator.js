import { logger } from './logger.js';

const VALID_ENTITIES = ['company', 'location', 'asset', 'job', 'quote', 'invoice'];

export class ArgValidator {
  static validateArgs(args) {
    const validatedArgs = { ...args };
    const errors = [];

    // Validate entity name if provided
    if (args.entity) {
      if (!VALID_ENTITIES.includes(args.entity.toLowerCase())) {
        errors.push(`Invalid entity: ${args.entity}. Valid entities are: ${VALID_ENTITIES.join(', ')}`);
      }
      validatedArgs.entity = args.entity.toLowerCase();
    }

    // Validate fromId if provided
    if (args['from-id']) {
      const fromId = parseInt(args['from-id'], 10);
      if (isNaN(fromId) || fromId < 0) {
        errors.push('from-id must be a positive integer');
      }
      validatedArgs.fromId = fromId;
    }

    // Validate resume flag with other args
    if (args.resume && args['from-id']) {
      errors.push('Cannot use --resume with --from-id');
    }

    if (errors.length > 0) {
      logger.error('Invalid arguments:');
      errors.forEach(error => logger.error(`- ${error}`));
      throw new Error('Invalid command line arguments');
    }

    return validatedArgs;
  }

  static printUsage() {
    console.log(`
Usage: node servicetrade-nuke.js [options]

Options:
  --resume              Resume from last successful backup point
  --entity <name>       Process specific entity type
  --from-id <id>       Start processing from specific ID

Valid entities:
  ${VALID_ENTITIES.join(', ')}

Examples:
  # Resume all backups from last successful points
  node servicetrade-nuke.js --resume

  # Backup specific entity
  node servicetrade-nuke.js --entity company

  # Resume from specific ID
  node servicetrade-nuke.js --entity company --from-id 12345
    `);
  }
} 