import { Model, DataTypes, Sequelize } from 'sequelize';

export interface LocationAttributes {
  id?: number;
  stId: number;
  name: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  lat?: number;
  lng?: number;
  CompanyId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Location extends Model<LocationAttributes> implements LocationAttributes {
  public id!: number;
  public stId!: number;
  public name!: string;
  public street?: string;
  public city?: string;
  public state?: string;
  public zip?: string;
  public lat?: number;
  public lng?: number;
  public CompanyId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize): typeof Location {
    Location.init({
      stId: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      street: DataTypes.STRING,
      city: DataTypes.STRING,
      state: DataTypes.STRING,
      zip: DataTypes.STRING,
      lat: DataTypes.FLOAT,
      lng: DataTypes.FLOAT,
      CompanyId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }, {
      sequelize,
      modelName: 'Location',
      tableName: 'locations'
    });
    return Location;
  }

  static associate(models: any) {
    Location.belongsTo(models.Company, { foreignKey: 'CompanyId' });
    Location.hasMany(models.Asset, { foreignKey: 'LocationId' });
    Location.hasMany(models.Job, { foreignKey: 'LocationId' });
  }
} 