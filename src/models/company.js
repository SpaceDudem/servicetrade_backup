import { Model, DataTypes } from 'sequelize';

export class Company extends Model {
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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Company name cannot be empty' },
          len: {
            args: [1, 255],
            msg: 'Company name must be between 1 and 255 characters'
          }
        }
      },
      street: {
        type: DataTypes.STRING,
        validate: {
          len: {
            args: [0, 255],
            msg: 'Street address must be less than 255 characters'
          }
        }
      },
      phone: {
        type: DataTypes.STRING,
        validate: {
          is: {
            args: /^[\d\s+()-]*$/,
            msg: 'Invalid phone number format'
          }
        }
      }
    }, { 
      sequelize,
      modelName: 'Company',
      hooks: {
        afterCreate: async (company, options) => {
          logger.info(`Backed up company: ${company.name} (${company.stId})`);
        },
        afterBulkCreate: async (companies, options) => {
          logger.info(`Backed up ${companies.length} companies`);
        }
      },
      indexes: [
        {
          name: 'company_stid_idx',
          unique: true,
          fields: ['stId']
        },
        {
          name: 'company_name_idx',
          fields: ['name']
        }
      ]
    });
    return this;
  }

  static associate(models) {
    this.hasMany(models.Location);
    this.hasMany(models.Job);
    this.hasMany(models.Quote);
    this.hasMany(models.Invoice);
  }
} 