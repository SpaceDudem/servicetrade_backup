import { Model, DataTypes } from 'sequelize';

export class Asset extends Model {
  static init(sequelize) {
    super.init({
      stId: { 
        type: DataTypes.INTEGER, 
        unique: true,
        allowNull: false,
        validate: {
          notNull: { msg: 'ServiceTrade ID is required' },
          isInt: { msg: 'ServiceTrade ID must be an integer' }
        }
      },
      tag: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Asset tag cannot be empty' },
          len: {
            args: [1, 100],
            msg: 'Asset tag must be between 1 and 100 characters'
          }
        }
      },
      lastServiced: {
        type: DataTypes.DATE,
        validate: {
          isDate: { msg: 'Invalid date format for lastServiced' },
          isBefore: {
            args: new Date().toISOString(),
            msg: 'Last service date cannot be in the future'
          }
        }
      }
    }, { 
      sequelize,
      modelName: 'Asset',
      indexes: [
        {
          name: 'asset_stid_idx',
          unique: true,
          fields: ['stId']
        },
        {
          name: 'asset_location_idx',
          fields: ['LocationId']
        },
        {
          name: 'asset_tag_location_idx',
          fields: ['tag', 'LocationId']
        },
        {
          name: 'asset_lastserviced_idx',
          fields: ['lastServiced']
        }
      ]
    });
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Location);
  }
} 