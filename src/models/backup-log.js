import { Model, DataTypes } from 'sequelize';

export class BackupLog extends Model {
  static init(sequelize) {
    super.init({
      entityType: {
        type: DataTypes.STRING,
        allowNull: false
      },
      startTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      endTime: {
        type: DataTypes.DATE
      },
      totalRecords: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      successCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      errorCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      lastStId: {
        type: DataTypes.INTEGER,
        comment: 'Last successfully processed ServiceTrade ID'
      },
      error: {
        type: DataTypes.TEXT
      },
      status: {
        type: DataTypes.ENUM('running', 'completed', 'failed'),
        defaultValue: 'running'
      }
    }, {
      sequelize,
      modelName: 'BackupLog',
      indexes: [
        {
          name: 'backup_log_entity_time_idx',
          fields: ['entityType', 'startTime']
        },
        {
          name: 'backup_log_status_idx',
          fields: ['status']
        }
      ]
    });
    return this;
  }
} 