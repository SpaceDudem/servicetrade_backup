import { Model, DataTypes } from 'sequelize';

export class Job extends Model {
  static init(sequelize) {
    super.init({
      stId: { 
        type: DataTypes.INTEGER, 
        unique: true,
        allowNull: false,
        comment: 'ServiceTrade unique identifier',
        validate: {
          notNull: { msg: 'ServiceTrade ID is required' },
          isInt: { msg: 'ServiceTrade ID must be an integer' }
        }
      },
      CompanyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Companies',
          key: 'id',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        }
      },
      LocationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Locations',
          key: 'id',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        }
      },
      dueBy: {
        type: DataTypes.DATE,
        validate: {
          isDate: { msg: 'Invalid date format for dueBy' }
        }
      },
      status: {
        type: DataTypes.ENUM('open', 'completed', 'canceled'),
        defaultValue: 'open',
        validate: {
          isIn: {
            args: [['open', 'completed', 'canceled']],
            msg: 'Invalid status value'
          }
        }
      },
      description: {
        type: DataTypes.TEXT('long'),
        validate: {
          len: {
            args: [0, 10000],
            msg: 'Description must be less than 10000 characters'
          }
        }
      }
    }, { 
      sequelize,
      modelName: 'Job',
      hooks: {
        beforeBulkCreate: async (jobs, options) => {
          // Ensure all jobs have valid company and location references
          const companyIds = new Set(jobs.map(job => job.CompanyId));
          const locationIds = new Set(jobs.map(job => job.LocationId));
          
          const companies = await sequelize.models.Company.findAll({
            where: { id: Array.from(companyIds) }
          });
          const locations = await sequelize.models.Location.findAll({
            where: { id: Array.from(locationIds) }
          });
          
          if (companies.length !== companyIds.size || locations.length !== locationIds.size) {
            throw new Error('Some jobs reference non-existent companies or locations');
          }
        },
        afterBulkCreate: async (jobs, options) => {
          logger.info(`Backed up ${jobs.length} jobs`);
        }
      },
      indexes: [
        {
          name: 'job_stid_idx',
          unique: true,
          fields: ['stId']
        },
        {
          name: 'job_company_idx',
          fields: ['CompanyId']
        },
        {
          name: 'job_location_idx',
          fields: ['LocationId']
        },
        {
          name: 'job_status_dueby_idx',
          fields: ['status', 'dueBy']
        }
      ]
    });
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Company);
    this.belongsTo(models.Location);
    this.hasMany(models.Quote);
    this.hasMany(models.Invoice);
  }
} 