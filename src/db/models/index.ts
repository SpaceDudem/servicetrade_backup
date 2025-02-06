import { Sequelize } from 'sequelize'
import { Company } from './Company'
import { Location } from './Location'
import { Asset } from './Asset'
import { Job } from './Job'

// Base model interfaces
export interface CompanyAttributes {
  id: number
  stId: number
  name: string
  street?: string
  phone?: string
}

export interface LocationAttributes {
  id: number
  stId: number
  name: string
  street?: string
  city?: string
  state?: string
  zip?: string
  lat?: number
  lng?: number
  CompanyId: number
}

export interface AssetAttributes {
  id: number
  stId: number
  tag: string
  lastServiced?: Date
  LocationId: number
}

export interface JobAttributes {
  id: number
  stId: number
  number?: string
  dueBy?: Date
  status: 'open' | 'completed' | 'canceled'
  description?: string
  customerPo?: string
  priority?: number
  CompanyId: number
  LocationId: number
}

export function initializeModels(sequelize: Sequelize) {
  const CompanyModel = Company.init(sequelize)
  const LocationModel = Location.initModel(sequelize)
  const AssetModel = Asset.initModel(sequelize)
  const JobModel = Job.initModel(sequelize)

  // Run associations
  CompanyModel.associate({ Location: LocationModel, Job: JobModel })
  LocationModel.associate({ Company: CompanyModel, Asset: AssetModel, Job: JobModel })
  AssetModel.associate({ Location: LocationModel })
  JobModel.associate({ Company: CompanyModel, Location: LocationModel })

  return {
    Company: CompanyModel,
    Location: LocationModel,
    Asset: AssetModel,
    Job: JobModel
  }
} 