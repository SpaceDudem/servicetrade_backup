import { createWriteStream, existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { logger } from './logger.js';

export class StateManager {
  constructor(statePath = '.nuke-state.json') {
    this.statePath = statePath;
    this.state = this.loadState();
  }

  loadState() {
    try {
      return existsSync(this.statePath) 
        ? JSON.parse(readFileSync(this.statePath, 'utf8'))
        : {
            lastRun: null,
            progress: {},
            errors: [],
          };
    } catch (error) {
      logger.error('Failed to load state:', error);
      return {
        lastRun: null,
        progress: {},
        errors: [],
      };
    }
  }

  saveState() {
    try {
      writeFileSync(this.statePath, JSON.stringify(this.state, null, 2));
    } catch (error) {
      logger.error('Failed to save state:', error);
    }
  }

  updateProgress(entity, page, total) {
    this.state.progress[entity] = { page, total };
    this.saveState();
  }

  logError(entity, error) {
    this.state.errors.push({
      timestamp: new Date().toISOString(),
      entity,
      error: error.message,
      stack: error.stack,
    });
    this.saveState();
  }

  getLastSuccessfulPage(entity) {
    return this.state.progress[entity]?.page || 0;
  }
} 