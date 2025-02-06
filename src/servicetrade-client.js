import axios from 'axios';

export class ServiceTradeClient {
  constructor(config) {
    this.baseUrl = `https://${config.hostname || 'api.servicetrade.com'}`;
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