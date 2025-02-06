import cliProgress from 'cli-progress'
import colors from 'ansi-colors'
import { logger } from '@/lib/logger'

export interface ProgressStats {
  startTime: Date | null
  endTime: Date | null
  entities: Record<string, EntityProgress>
  errors: Error[]
  totals: {
    processed: number
    succeeded: number
    failed: number
    skipped: number
  }
}

interface EntityProgress {
  total: number
  processed: number
  succeeded: number
  failed: number
  skipped: number
  startTime: Date
  endTime: Date | null
  bar: cliProgress.SingleBar
}

export class ProgressReporter {
  private multibar: cliProgress.MultiBar
  private stats: ProgressStats

  constructor() {
    this.multibar = new cliProgress.MultiBar({
      format: '{bar} | {percentage}% | {value}/{total} | {entity} | {status}',
      hideCursor: true,
      clearOnComplete: false,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591'
    })

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
    }
  }

  startEntity(entityName: string, total: number) {
    if (!this.stats.startTime) {
      this.stats.startTime = new Date()
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
    }
  }

  updateProgress(
    entityName: string, 
    processed: number, 
    succeeded: number, 
    failed: number, 
    skipped: number
  ) {
    const entity = this.stats.entities[entityName]
    if (!entity) return

    entity.processed = processed
    entity.succeeded = succeeded
    entity.failed = failed
    entity.skipped = skipped

    entity.bar.update(processed, {
      status: this.getStatusText(succeeded, failed, skipped)
    })
  }

  private getStatusText(succeeded: number, failed: number, skipped: number): string {
    const parts = []
    if (succeeded) parts.push(colors.green(`${succeeded} ok`))
    if (failed) parts.push(colors.red(`${failed} failed`))
    if (skipped) parts.push(colors.yellow(`${skipped} skipped`))
    return parts.join(', ') || colors.blue('Processing...')
  }

  completeEntity(entityName: string) {
    const entity = this.stats.entities[entityName]
    if (!entity) return

    entity.endTime = new Date()
    entity.bar.stop()

    this.stats.totals.processed += entity.processed
    this.stats.totals.succeeded += entity.succeeded
    this.stats.totals.failed += entity.failed
    this.stats.totals.skipped += entity.skipped
  }

  logError(entityName: string, error: Error) {
    this.stats.errors.push(error)
    logger.error(`Error in ${entityName}:`, error)
  }

  finish() {
    this.stats.endTime = new Date()
    this.multibar.stop()
    this.printSummary()
  }

  private printSummary() {
    const duration = this.stats.endTime!.getTime() - this.stats.startTime!.getTime()
    const minutes = Math.floor(duration / 60000)
    const seconds = ((duration % 60000) / 1000).toFixed(0)

    console.log('\nBackup Summary:')
    console.log('==============')
    console.log(`Duration: ${minutes}m ${seconds}s`)
    console.log(`Total Processed: ${this.stats.totals.processed}`)
    console.log(`Succeeded: ${colors.green(this.stats.totals.succeeded)}`)
    console.log(`Failed: ${colors.red(this.stats.totals.failed)}`)
    console.log(`Skipped: ${colors.yellow(this.stats.totals.skipped)}`)

    if (this.stats.errors.length > 0) {
      console.log('\nErrors:')
      this.stats.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.message}`)
      })
    }
  }

  // Fallback logging functions
  start(entityName: string, total: number) {
    console.log(`Starting backup for ${entityName} with ${total} records...`);
  }

  update(entityName: string, processed: number) {
    console.log(`Processed ${processed} records for ${entityName}`);
  }

  finish(entityName: string) {
    console.log(`Finished processing ${entityName}`);
  }
} 