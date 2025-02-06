import { Model, DataTypes, Sequelize } from 'sequelize';
import { logger } from '@/utils/logger';

export interface CompanyAttributes {
  id?: number;
  stId: number;
  name: string;
  street?: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Company extends Model<CompanyAttributes> implements CompanyAttributes {
  public id!: number;
  public stId!: number;
  public name!: string;
  public street?: string;
  public phone?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static init(sequelize: Sequelize) {
    return Company.init({
      stId: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        unique: true,
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
          len: [1, 255]
        }
      },
      street: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: { len: [0, 255] }
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
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
      tableName: 'companies',
      hooks: {
        afterCreate: (company: Company) => {
          logger.info(`Backed up company: ${company.name} (${company.stId})`);
        }
      }
    });
  }

  static associate(models: any) {
    // A company may have many jobs and locations.
    Company.hasMany(models.Job, { foreignKey: 'CompanyId' });
    Company.hasMany(models.Location, { foreignKey: 'CompanyId' });
  }
} 