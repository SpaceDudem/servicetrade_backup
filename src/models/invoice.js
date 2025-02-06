import { Model, DataTypes } from 'sequelize';

export class Invoice extends Model {
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
      balanceDue: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        validate: {
          isDecimal: { msg: 'Balance due must be a decimal number' },
          min: {
            args: [0],
            msg: 'Balance due cannot be negative'
          }
        }
      }
    }, { 
      sequelize,
      modelName: 'Invoice',
      indexes: [
        {
          name: 'invoice_stid_idx',
          unique: true,
          fields: ['stId']
        },
        {
          name: 'invoice_job_idx',
          fields: ['JobId']
        },
        {
          name: 'invoice_company_idx',
          fields: ['CompanyId']
        },
        {
          name: 'invoice_balance_idx',
          fields: ['balanceDue']
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