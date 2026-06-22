import type { InvoiceItemPayload, InvoiceRecordPayload, PaymentPayload } from './invoice.types';

export interface ValidationResult {
  status: boolean;
  errors?: string[];
}

const invoiceStatuses = ['DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED'];
const itemCategories = ['CONSULTATION', 'LAB', 'RADIOLOGY', 'PHARMACY', 'WARD', 'PROCEDURE', 'OTHER'];
const paymentMethods = ['CASH', 'CARD', 'MOBILE_MONEY', 'INSURANCE', 'BANK_TRANSFER'];

function isValidNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value);
}

export function validateInvoicePayload(payload: InvoiceRecordPayload): ValidationResult {
  const errors: string[] = [];

  if (!payload.patientId) errors.push('Please choose a patient');
  if (payload.status && !invoiceStatuses.includes(payload.status)) errors.push('Invalid invoice status');
  if (payload.items && !Array.isArray(payload.items)) errors.push('Invoice items must be an array');

  return errors.length > 0 ? { status: false, errors } : { status: true };
}

export function validateInvoiceItemPayload(payload: InvoiceItemPayload): ValidationResult {
  const errors: string[] = [];

  if (!payload.invoiceId) errors.push('Please choose an invoice');
  if (!payload.description) errors.push('Please enter item description');
  if (payload.quantity !== undefined && (!isValidNumber(payload.quantity) || payload.quantity <= 0)) errors.push('Quantity must be greater than 0');
  if (payload.unitPrice !== undefined && (!isValidNumber(payload.unitPrice) || payload.unitPrice < 0)) errors.push('Unit price cannot be negative');
  if (payload.category && !itemCategories.includes(payload.category)) errors.push('Invalid invoice item category');

  return errors.length > 0 ? { status: false, errors } : { status: true };
}

export function validatePaymentPayload(payload: PaymentPayload): ValidationResult {
  const errors: string[] = [];

  if (!payload.invoiceId) errors.push('Please choose an invoice');
  if (payload.amount === undefined || !isValidNumber(payload.amount) || payload.amount <= 0) errors.push('Payment amount must be greater than 0');
  if (payload.method && !paymentMethods.includes(payload.method)) errors.push('Invalid payment method');

  return errors.length > 0 ? { status: false, errors } : { status: true };
}
