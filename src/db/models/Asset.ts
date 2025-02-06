import { Model, DataTypes, Sequelize } from 'sequelize';

export interface AssetAttributes {
  id?: number;
  stId: number;
  tag: string;
  lastServiced?: Date;
  LocationId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Asset extends Model<AssetAttributes> implements AssetAttributes {
  public id!: number;
  public stId!: number;
  public tag!: string;
  public lastServiced?: Date;
  public LocationId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize): typeof Asset {
    Asset.init({
      stId: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false
      },
      tag: {
        type: DataTypes.STRING,
        allowNull: false
      },
      lastServiced: DataTypes.DATE,
      LocationId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }, {
      sequelize,
      modelName: 'Asset',
      tableName: 'assets'
    });
    return Asset;
  }

  static associate(models: any) {
    Asset.belongsTo(models.Location, { foreignKey: 'LocationId' });
  }
} 