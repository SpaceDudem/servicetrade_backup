import { Model, DataTypes } from 'sequelize';

export class Location extends Model {
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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Location name cannot be empty' },
          len: {
            args: [1, 255],
            msg: 'Location name must be between 1 and 255 characters'
          }
        }
      },
      address: {
        type: DataTypes.JSON,
        validate: {
          isValidAddress(value) {
            if (value && typeof value !== 'object') {
              throw new Error('Address must be a valid object');
            }
          }
        }
      },
      geo: {
        type: DataTypes.JSON,
        validate: {
          isValidGeo(value) {
            if (value) {
              const { lat, lng } = value;
              if (typeof lat !== 'number' || typeof lng !== 'number') {
                throw new Error('Geo coordinates must be numbers');
              }
              if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                throw new Error('Invalid geo coordinates');
              }
            }
          }
        }
      }
    }, { 
      sequelize,
      modelName: 'Location',
      hooks: {
        afterCreate: async (location, options) => {
          logger.info(`Backed up location: ${location.name} (${location.stId})`);
        },
        afterBulkCreate: async (locations, options) => {
          logger.info(`Backed up ${locations.length} locations`);
        }
      },
      indexes: [
        {
          name: 'location_stid_idx',
          unique: true,
          fields: ['stId']
        },
        {
          name: 'location_company_idx',
          fields: ['CompanyId']
        },
        {
          name: 'location_name_company_idx',
          fields: ['name', 'CompanyId']
        }
      ]
    });
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Company);
    this.hasMany(models.Asset);
    this.hasMany(models.Job);
  }
} 