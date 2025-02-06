import { logger } from './logger.js';
import { ZodError } from 'zod';

export class ValidationError extends Error {
  constructor(errors) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export function validateData(schema, data, context = '') {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
        value: err.input
      }));
      
      logger.error('Validation failed for', context, formattedErrors);
      throw new ValidationError(formattedErrors);
    }
    throw error;
  }
}

export function validateBatch(schema, records, context = '') {
  const validRecords = [];
  const errors = [];

  records.forEach((record, index) => {
    try {
      validRecords.push(validateData(schema, record));
    } catch (error) {
      if (error instanceof ValidationError) {
        errors.push({
          index,
          record,
          errors: error.errors
        });
      } else {
        throw error;
      }
    }
  });

  if (errors.length > 0) {
    logger.warn(`Validation failed for ${errors.length} records in ${context}`);
    logger.debug('Validation errors:', errors);
  }

  return {
    validRecords,
    errors,
    totalProcessed: records.length,
    successCount: validRecords.length,
    errorCount: errors.length
  };
} 