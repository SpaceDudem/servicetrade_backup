import { Model, DataTypes } from 'sequelize';

export class Quote extends Model {
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
      pdfUrl: {
        type: DataTypes.STRING,
        validate: {
          isUrl: {
            msg: 'Invalid PDF URL format'
          },
          len: {
            args: [0, 2048],
            msg: 'URL must be less than 2048 characters'
          }
        }
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        validate: {
          isDecimal: { msg: 'Total amount must be a decimal number' },
          min: {
            args: [0],
            msg: 'Total amount cannot be negative'
          }
        }
      }
    }, { 
      sequelize,
      modelName: 'Quote',
      indexes: [
        {
          name: 'quote_stid_idx',
          unique: true,
          fields: ['stId']
        },
        {
          name: 'quote_job_idx',
          fields: ['JobId']
        },
        {
          name: 'quote_company_idx',
          fields: ['CompanyId']
        },
        {
          name: 'quote_amount_idx',
          fields: ['totalAmount']
        }
      ]
    });
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Job);
    this.belongsTo(models.Company);
  }
} 