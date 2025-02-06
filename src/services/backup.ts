import type { ServiceTradeClient } from '@/api/client'
import type { ProgressReporter } from '@/utils/progress'
import { logger } from '@/lib/logger'
import type { Company, Location, Asset, Job } from '@/db/models'

export interface BackupOptions {
  entity?: string
  fromId?: number
  resume?: boolean
}

/**
 * Service for backing up data from ServiceTrade API to local database
 * Handles pagination, error recovery, and progress reporting
 */
export class BackupService {
  constructor(
    private client: ServiceTradeClient,
    private models: {
      Company: typeof Company
      Location: typeof Location
      Asset: typeof Asset
      Job: typeof Job
    },
    private progress: ProgressReporter = new (require('@/utils/progress').ProgressReporter)()
  ) {}

  /**
   * Generic method to fetch paginated data from the API
   * @param endpoint - API endpoint to fetch from
   * @param processItem - Function to process each item
   * @param entityName - Name of the entity for logging
   * @param fromId - Starting ID for pagination
   * @param pageSize - Number of items per page
   */
  private async paginatedFetch<T>(
    endpoint: string,
    processItem: (item: any) => Promise<T>,
    entityName: string,
    fromId?: number,
    pageSize = 100
  ): Promise<void> {
    let page = 1
    let hasMore = true
    let processed = 0
    let succeeded = 0
    let failed = 0
    let skipped = 0

    // Get total count from first page
    const firstPage = await this.client.get<any>(`${endpoint}?page=1&pageSize=1`)
    const total = firstPage.meta?.total || 0
    
    this.progress.startEntity(entityName, total)

    while (hasMore) {
      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
          ...(fromId && { fromId: String(fromId) })
        })

        const response = await this.client.get<any[]>(`${endpoint}?${params}`)
        
        if (!response || response.length === 0) {
          hasMore = false
          continue
        }

        for (const item of response) {
          try {
            await processItem(item)
            succeeded++
          } catch (error: unknown) {
            if (error instanceof Error && error.message.includes('foreign key constraint')) {
              skipped++
            } else {
              failed++
              this.progress.logError(entityName, error instanceof Error ? error : new Error(String(error)))
            }
          }
          processed++
          this.progress.updateProgress(entityName, processed, succeeded, failed, skipped)
        }

        page++
      } catch (error) {
        logger.error(`Error fetching page ${page} from ${endpoint}:`, error)
        throw error
      }
    }

    this.progress.completeEntity(entityName)
  }

  /**
   * Backs up company data from ServiceTrade
   * Companies are the root entities and must be backed up first
   */
  private async backupCompanies(fromId?: number): Promise<void> {
    logger.info('Starting company backup...')
    await this.paginatedFetch('/company', async (company) => {
      await this.models.Company.upsert({
        id: company.id,
        stId: company.id,
        name: company.name,
        street: company.street,
        phone: company.phone
      })
    }, 'Companies', fromId)
  }

  /**
   * Backs up location data from ServiceTrade
   * Locations belong to companies and must be backed up after companies
   */
  private async backupLocations(fromId?: number): Promise<void> {
    logger.info('Starting location backup...')
    await this.paginatedFetch('/location', async (location) => {
      await this.models.Location.upsert({
        id: location.id,
        stId: location.id,
        name: location.name,
        street: location.street,
        city: location.city,
        state: location.state,
        zip: location.zip,
        lat: location.geo?.lat,
        lng: location.geo?.lng,
        CompanyId: location.company?.id
      })
    }, 'Locations', fromId)
  }

  /**
   * Backs up asset data from ServiceTrade
   * Assets belong to locations and must be backed up after locations
   */
  private async backupAssets(fromId?: number): Promise<void> {
    logger.info('Starting asset backup...')
    await this.paginatedFetch('/asset', async (asset) => {
      await this.models.Asset.upsert({
        id: asset.id,
        stId: asset.id,
        tag: asset.tag,
        lastServiced: asset.lastServiced,
        LocationId: asset.location?.id
      })
    }, 'Assets', fromId)
  }

  /**
   * Backs up job data from ServiceTrade
   * Jobs can reference companies and locations
   */
  private async backupJobs(fromId?: number): Promise<void> {
    logger.info('Starting job backup...')
    await this.paginatedFetch('/job', async (job) => {
      await this.models.Job.upsert({
        id: job.id,
        stId: job.id,
        number: job.number,
        dueBy: job.dueBy,
        status: job.status,
        description: job.description,
        customerPo: job.customerPo,
        priority: job.priority,
        CompanyId: job.company?.id,
        LocationId: job.location?.id
      })
    }, 'Jobs', fromId)
  }

  /**
   * Runs a full backup of all entities in the correct order
   * Handles progress reporting and error logging
   */
  async runBackup(options: BackupOptions = {}): Promise<void> {
    const { entity, fromId, resume } = options

    try {
      if (resume) {
        logger.info('Resuming backup from last successful point')
      }

      if (entity) {
        logger.info(`Processing single entity: ${entity}`)
        await this.backupEntity(entity, fromId)
      } else {
        await this.runFullBackup(fromId)
      }

      this.progress.finish()
      logger.info('Backup completed successfully')
    } catch (error) {
      logger.error('Backup failed:', error)
      throw error
    }
  }

  private async backupEntity(entityName: string, fromId?: number): Promise<void> {
    switch (entityName.toLowerCase()) {
      case 'company':
        await this.backupCompanies(fromId)
        break
      case 'location':
        await this.backupLocations(fromId)
        break
      case 'asset':
        await this.backupAssets(fromId)
        break
      case 'job':
        await this.backupJobs(fromId)
        break
      default:
        throw new Error(`Unknown entity type: ${entityName}`)
    }
  }

  private async runFullBackup(fromId?: number): Promise<void> {
    logger.info('Starting full backup...')
    
    // Process in order to maintain referential integrity
    await this.backupCompanies(fromId)
    await this.backupLocations(fromId)
    await this.backupAssets(fromId)
    await this.backupJobs(fromId)
  }
} 