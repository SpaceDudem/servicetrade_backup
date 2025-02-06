import { Company } from './company.js';
import { Location } from './location.js';
import { Asset } from './asset.js';
import { Job } from './job.js';
import { Quote } from './quote.js';
import { Invoice } from './invoice.js';

export function initializeModels(sequelize) {
  // Initialize models
  const models = {
    Company: Company.init(sequelize),
    Location: Location.init(sequelize),
    Asset: Asset.init(sequelize),
    Job: Job.init(sequelize),
    Quote: Quote.init(sequelize),
    Invoice: Invoice.init(sequelize)
  };

  // Define relationships
  Object.values(models).forEach(model => {
    if (model.associate) {
      model.associate(models);
    }
  });

  return models;
} 