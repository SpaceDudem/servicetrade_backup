import { logger } from './logger.js';

export class ErrorRecovery {
  constructor(maxRetries = 3, backoffMs = 1000) {
    this.maxRetries = maxRetries;
    this.backoffMs = backoffMs;
  }

  async withRetry(operation, context) {
    let lastError;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        logger.warn(
          `Attempt ${attempt}/${this.maxRetries} failed for ${context}:`,
          error.message
        );
        if (attempt < this.maxRetries) {
          await this.delay(attempt);
        }
      }
    }
    throw lastError;
  }

  delay(attempt) {
    const ms = this.backoffMs * Math.pow(2, attempt - 1);
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 