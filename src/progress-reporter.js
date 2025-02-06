import cliProgress from 'cli-progress';
import colors from 'ansi-colors';
import { logger } from './logger.js';

export class ProgressReporter {
  constructor() {
    this.multibar = new cliProgress.MultiBar({
      format: '{bar} | {percentage}% | {value}/{total} | {entity} | {status}',
      hideCursor: true,
      clearOnComplete: false,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
    });

    this.stats = {
      startTime: null,
      endTime: null,
      entities: {},
      errors: [],
      totals: {
        processed: 0,
        succeeded: 0,
        failed: 0,
        skipped: 0
      }
    };
  }

  startEntity(entityName, total) {
    if (!this.stats.startTime) {
      this.stats.startTime = new Date();
    }

    this.stats.entities[entityName] = {
      total,
      processed: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
      startTime: new Date(),
      endTime: null,
      bar: this.multibar.create(total, 0, {
        entity: entityName,
        status: colors.blue('Processing...')
      })
    };
  }

  updateProgress(entityName, processed, succeeded, failed, skipped) {
    const entity = this.stats.entities[entityName];
    if (!entity) return;

    entity.processed = processed;
    entity.succeeded = succeeded;
    entity.failed = failed;
    entity.skipped = skipped;

    entity.bar.update(processed, {
      status: this.getStatusText(succeeded, failed, skipped)
    });
  }

  finishEntity(entityName) {
    const entity = this.stats.entities[entityName];
    if (!entity) return;

    entity.endTime = new Date();
    entity.bar.update(entity.total, {
      status: colors.green('Complete')
    });

    // Update totals
    this.stats.totals.processed += entity.processed;
    this.stats.totals.succeeded += entity.succeeded;
    this.stats.totals.failed += entity.failed;
    this.stats.totals.skipped += entity.skipped;
  }

  logError(entityName, error) {
    this.stats.errors.push({
      timestamp: new Date(),
      entity: entityName,
      error: error.message,
      stack: error.stack
    });
  }

  finish() {
    this.stats.endTime = new Date();
    this.multibar.stop();
    this.printSummary();
  }

  getStatusText(succeeded, failed, skipped) {
    const parts = [];
    if (succeeded) parts.push(colors.green(`${succeeded} ok`));
    if (failed) parts.push(colors.red(`${failed} failed`));
    if (skipped) parts.push(colors.yellow(`${skipped} skipped`));
    return parts.join(', ') || colors.blue('Processing...');
  }

  printSummary() {
    const duration = (this.stats.endTime - this.stats.startTime) / 1000;
    const errorCount = this.stats.errors.length;

    console.log('\n=== Extraction Summary ===');
    console.log(`Duration: ${duration.toFixed(2)}s`);
    console.log(`Total Processed: ${this.stats.totals.processed}`);
    console.log(`Successfully Processed: ${colors.green(this.stats.totals.succeeded)}`);
    console.log(`Failed: ${colors.red(this.stats.totals.failed)}`);
    console.log(`Skipped: ${colors.yellow(this.stats.totals.skipped)}`);
    console.log(`Errors: ${errorCount ? colors.red(errorCount) : colors.green('None')}`);

    if (errorCount > 0) {
      console.log('\n=== Error Summary ===');
      this.stats.errors.forEach((error, index) => {
        console.log(`\n${index + 1}. ${colors.red(error.entity)} at ${error.timestamp}`);
        console.log(`   ${error.error}`);
      });
    }

    // Write detailed report to file
    this.writeDetailedReport();
  }

  writeDetailedReport() {
    const report = {
      timestamp: new Date().toISOString(),
      duration: (this.stats.endTime - this.stats.startTime) / 1000,
      totals: this.stats.totals,
      entityStats: Object.entries(this.stats.entities).map(([name, stats]) => ({
        name,
        duration: (stats.endTime - stats.startTime) / 1000,
        total: stats.total,
        processed: stats.processed,
        succeeded: stats.succeeded,
        failed: stats.failed,
        skipped: stats.skipped
      })),
      errors: this.stats.errors
    };

    try {
      const fs = require('fs');
      const reportPath = `./nuke_docs/extraction-report-${Date.now()}.json`;
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      logger.info(`Detailed report written to ${reportPath}`);
    } catch (error) {
      logger.error('Failed to write detailed report:', error);
    }
  }
} 