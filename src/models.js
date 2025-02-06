import { DataTypes } from 'sequelize';

export function initializeModels(sequelize) {
  // Core entities
  const Company = sequelize.define('Company', {
    stId: { type: DataTypes.INTEGER, unique: true },
    name: DataTypes.STRING,
    street: DataTypes.STRING,
    phone: DataTypes.STRING
  });

  const Location = sequelize.define('Location', {
    stId: { type: DataTypes.INTEGER, unique: true },
    name: DataTypes.STRING,
    address: DataTypes.JSON,
    geo: DataTypes.JSON
  });

  const Asset = sequelize.define('Asset', {
    stId: { type: DataTypes.INTEGER, unique: true },
    tag: DataTypes.STRING,
    lastServiced: DataTypes.DATE
  });

  // Jobs and related entities
  const Job = sequelize.define('Job', {
    stId: { type: DataTypes.INTEGER, unique: true },
    dueBy: DataTypes.DATE,
    status: DataTypes.ENUM('open', 'completed', 'canceled'),
    description: DataTypes.TEXT('long')
  });

  const Quote = sequelize.define('Quote', {
    stId: { type: DataTypes.INTEGER, unique: true },
    pdfUrl: DataTypes.STRING,
    totalAmount: DataTypes.DECIMAL(10, 2)
  });

  const Invoice = sequelize.define('Invoice', {
    stId: { type: DataTypes.INTEGER, unique: true },
    pdfUrl: DataTypes.STRING,
    balanceDue: DataTypes.DECIMAL(10, 2)
  });

  // Define relationships
  Company.hasMany(Location);
  Location.belongsTo(Company);

  Location.hasMany(Asset);
  Asset.belongsTo(Location);

  Company.hasMany(Job);
  Location.hasMany(Job);
  Job.belongsTo(Company);
  Job.belongsTo(Location);

  Job.hasMany(Quote);
  Quote.belongsTo(Job);
  Quote.belongsTo(Company);

  Job.hasMany(Invoice);
  Invoice.belongsTo(Job);
  Invoice.belongsTo(Company);

  return {
    Company,
    Location,
    Asset,
    Job,
    Quote,
    Invoice
  };
} 