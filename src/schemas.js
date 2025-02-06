import { z } from 'zod';

// Base schemas for common fields
const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
});

const geoSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

// Entity schemas
export const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  street: z.string().optional(),
  phone: z.string().optional(),
});

export const locationSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  geo: geoSchema.optional(),
  address: addressSchema.optional(),
  CompanyId: z.number().positive(),
});

export const assetSchema = z.object({
  tag: z.string().min(1, "Asset tag is required"),
  lastServiced: z.string().datetime().optional(),
  LocationId: z.number().positive(),
});

export const jobSchema = z.object({
  stId: z.number().positive(),
  dueBy: z.string().datetime().optional(),
  status: z.enum(['open', 'completed', 'canceled']),
  description: z.string().optional(),
  LocationId: z.number().positive(),
  CompanyId: z.number().positive(),
});

export const jobItemSchema = z.object({
  code: z.string().min(1, "Item code is required"),
  quantity: z.number().min(0),
  unitCost: z.number().min(0),
  JobId: z.number().positive(),
});

export const appointmentSchema = z.object({
  scheduledTime: z.string().datetime(),
  completedTime: z.string().datetime().optional(),
  JobId: z.number().positive(),
});

export const quoteSchema = z.object({
  pdfUrl: z.string().url().optional(),
  totalAmount: z.number().min(0),
  JobId: z.number().positive(),
  CompanyId: z.number().positive(),
});

export const invoiceSchema = z.object({
  pdfUrl: z.string().url().optional(),
  balanceDue: z.number().min(0),
  JobId: z.number().positive(),
  CompanyId: z.number().positive(),
}); 