import { Model, DataTypes, Sequelize } from 'sequelize';

export interface JobAttributes {
  id?: number;
  stId: number;
  number?: string;
  dueBy?: Date;
  status: 'open' | 'completed' | 'canceled';
  description?: string;
  customerPo?: string;
  priority?: number;
  CompanyId: number;
  LocationId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Job extends Model<JobAttributes> implements JobAttributes {
  public id!: number;
  public stId!: number;
  public number?: string;
  public dueBy?: Date;
  public status!: 'open' | 'completed' | 'canceled';
  public description?: string;
  public customerPo?: string;
  public priority?: number;
  public CompanyId!: number;
  public LocationId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize): typeof Job {
    Job.init({
      stId: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false
      },
      number: DataTypes.STRING,
      dueBy: DataTypes.DATE,
      status: {
        type: DataTypes.ENUM('open', 'completed', 'canceled'),
        allowNull: false,
        defaultValue: 'open'
      },
      description: DataTypes.TEXT,
      customerPo: DataTypes.STRING,
      priority: DataTypes.INTEGER,
      CompanyId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      LocationId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }, {
      sequelize,
      modelName: 'Job',
      tableName: 'jobs'
    });
    return Job;
  }

  static associate(models: any) {
    Job.belongsTo(models.Company, { foreignKey: 'CompanyId' });
    Job.belongsTo(models.Location, { foreignKey: 'LocationId' });
  }
} 