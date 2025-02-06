import { logger } from './logger.js';

// Helper functions for data cleanup
function cleanString(value) {
  if (typeof value !== 'string') return value;
  return value.trim().replace(/\s+/g, ' ');
}

function parseDate(value) {
  if (!value) return null;
  try {
    const date = new Date(value);
    return date.toISOString();
  } catch (error) {
    logger.warn(`Invalid date value: ${value}`);
    return null;
  }
}

function parseNumber(value) {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const num = Number(value.replace(/[^0-9.-]+/g, ''));
  return isNaN(num) ? 0 : num;
}

// Entity-specific transformers
export const transformers = {
  company: (data) => ({
    name: cleanString(data.name),
    street: cleanString(data.street),
    phone: cleanString(data.phone)?.replace(/[^0-9+()-]/g, ''),
  }),

  location: (data) => ({
    name: cleanString(data.name),
    geo: data.geo ? {
      lat: parseNumber(data.geo.lat),
      lng: parseNumber(data.geo.lng)
    } : undefined,
    address: data.address ? {
      street: cleanString(data.address.street),
      city: cleanString(data.address.city),
      state: cleanString(data.address.state),
      zip: cleanString(data.address.zip),
      country: cleanString(data.address.country)
    } : undefined,
    CompanyId: data.CompanyId
  }),

  asset: (data) => ({
    tag: cleanString(data.tag),
    lastServiced: parseDate(data.lastServiced),
    LocationId: data.LocationId
  }),

  job: (data) => ({
    stId: data.stId,
    dueBy: parseDate(data.dueBy),
    status: data.status?.toLowerCase?.() || 'open',
    description: cleanString(data.description),
    LocationId: data.LocationId,
    CompanyId: data.CompanyId
  }),

  jobItem: (data) => ({
    code: cleanString(data.code),
    quantity: parseNumber(data.quantity),
    unitCost: parseNumber(data.unitCost),
    JobId: data.JobId
  }),

  appointment: (data) => ({
    scheduledTime: parseDate(data.scheduledTime),
    completedTime: parseDate(data.completedTime),
    JobId: data.JobId
  }),

  quote: (data) => ({
    pdfUrl: data.pdfUrl,
    totalAmount: parseNumber(data.totalAmount),
    JobId: data.JobId,
    CompanyId: data.CompanyId
  }),

  invoice: (data) => ({
    pdfUrl: data.pdfUrl,
    balanceDue: parseNumber(data.balanceDue),
    JobId: data.JobId,
    CompanyId: data.CompanyId
  })
};

// Main transform function
export function transformData(entityType, data) {
  const transformer = transformers[entityType.toLowerCase()];
  if (!transformer) {
    logger.warn(`No transformer found for entity type: ${entityType}`);
    return data;
  }

  try {
    return transformer(data);
  } catch (error) {
    logger.error(`Error transforming ${entityType} data:`, error);
    logger.debug('Problematic data:', data);
    throw error;
  }
}

// Batch transform function
export function transformBatch(entityType, records) {
  return records.map((record, index) => {
    try {
      return transformData(entityType, record);
    } catch (error) {
      logger.error(`Error transforming record at index ${index}:`, error);
      return record; // Return original record on error
    }
  });
} 