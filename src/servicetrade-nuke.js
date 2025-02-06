const axios = require('axios');
const { Sequelize, DataTypes } = require('sequelize');
const { createWriteStream } = require('fs');
const { mkdir } = require('fs/promises');
const path = require('path');
require('dotenv').config();

// ServiceTrade client setup
class ServiceTradeClient {
  constructor(config) {
    this.baseUrl = config.baseUrl || 'https://api.servicetrade.com';
    this.auth = {
      username: config.username,
      password: config.password
    };
    this.authToken = null;
  }

  async authenticate() {
    try {
      const response = await axios.post(`${this.baseUrl}/api/auth`, this.auth);
      this.authToken = response.data?.data?.authToken;
      if (!this.authToken) throw new Error('No auth token received');
      console.log('Successfully authenticated');
    } catch (error) {
      console.error('Authentication failed:', error.message);
      throw error;
    }
  }

  async get(endpoint, config = {}) {
    if (!this.authToken) {
      await this.authenticate();
    }

    try {
      const response = await axios.get(`${this.baseUrl}/api${endpoint}`, {
        ...config,
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        await this.authenticate();
        return this.get(endpoint, config);
      }
      throw error;
    }
  }
}

// Database setup
const sequelize = new Sequelize(
  process.env.DB_NAME || 'servicetrade',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: msg => process.env.NODE_ENV === 'warroom' && console.log(msg)
  }
);

// Model definitions
const Job = sequelize.define('Job', {
  stId: { type: DataTypes.INTEGER, unique: true },
  number: DataTypes.STRING,
  dueBy: DataTypes.DATE,
  status: DataTypes.ENUM('OPEN', 'COMPLETED', 'CANCELED'),
  description: DataTypes.TEXT('long'),
  customerPo: DataTypes.STRING,
  priority: DataTypes.INTEGER
});

const Company = sequelize.define('Company', {
  name: DataTypes.STRING,
  phone: DataTypes.STRING,
  email: DataTypes.STRING,
  website: DataTypes.STRING,
  address1: DataTypes.STRING,
  address2: DataTypes.STRING,
  city: DataTypes.STRING,
  state: DataTypes.STRING,
  postalCode: DataTypes.STRING
});

// Initialize client
const stClient = new ServiceTradeClient({
  username: process.env.ST_USERNAME,
  password: process.env.ST_PASSWORD
});

// Data harvesting function
async function paginatedHarvest(endpoint, Model, options = {}) {
  const { include, transform } = options;
  let page = 1;
  
  while (true) {
    try {
      const response = await stClient.get(`/${endpoint}`, {
        params: {
          page,
          pageSize: 100,
          ...(include && { include: include.join(',') })
        }
      });

      if (!response?.data?.data) {
        console.warn(`No data returned for ${endpoint} page ${page}`);
        break;
      }

      const records = response.data.data.map(transform || (x => x));
      await Model.bulkCreate(records, { 
        ignoreDuplicates: true,
        logging: false
      });

      if (page >= response.data.meta.totalPages) break;
      page++;
      
      await new Promise(resolve => setTimeout(resolve, 250));
    } catch (error) {
      console.error(`Error harvesting ${endpoint} page ${page}:`, error.message);
      throw error;
    }
  }
}

// Main sync function
async function thermonuclearSync() {
  try {
    console.log('Starting database sync...');
    await sequelize.sync({ force: true });
    
    console.log('Phase 1: Harvesting companies...');
    await paginatedHarvest('company', Company);
    
    console.log('Phase 2: Harvesting jobs...');
    await paginatedHarvest('job', Job, {
      include: ['company'],
      transform: job => ({
        stId: job.id,
        number: job.number,
        dueBy: job.dueBy,
        status: job.status,
        description: job.description,
        customerPo: job.customerPo,
        priority: job.priority,
        CompanyId: job.company?.id
      })
    });
    
    console.log('Sync completed successfully!');
  } catch (error) {
    console.error('Sync failed:', error.message);
    throw error;
  }
}

// Execute
thermonuclearSync()
  .then(() => {
    console.log('Operation completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }); 