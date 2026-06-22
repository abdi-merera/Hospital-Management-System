export interface InvoiceItem {
  item: string;
  dosage: string;
  quantity: number;
  amount: number;
}

export interface InvoiceData {
  shipping: {
    name: string;
    address?: string;
    city: string;
    state: string;
    country: string;
    postal_code: number;
  };
  items: InvoiceItem[];
  subtotal: number;
  paid: number;
  invoice_nr: string;
}

export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';
export type InvoiceItemCategory = 'CONSULTATION' | 'LAB' | 'RADIOLOGY' | 'PHARMACY' | 'WARD' | 'PROCEDURE' | 'OTHER';
export type PaymentMethod = 'CASH' | 'CARD' | 'MOBILE_MONEY' | 'INSURANCE' | 'BANK_TRANSFER';

export interface AuthSender {
  id: string;
  userType: 'Admin' | 'Staff' | 'Patient';
}

export interface InvoiceRecordPayload {
  patientId?: string;
  encounterId?: string;
  admissionId?: string;
  status?: InvoiceStatus;
  discount?: number;
  tax?: number;
  items?: InvoiceItemPayload[];
}

export interface InvoiceItemPayload {
  invoiceId?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  category?: InvoiceItemCategory;
}

export interface PaymentPayload {
  invoiceId?: string;
  amount?: number;
  method?: PaymentMethod;
  reference?: string;
  receivedAt?: string;
}

export interface BillingFilters {
  patientId?: string;
  encounterId?: string;
  admissionId?: string;
  invoiceId?: string;
  status?: InvoiceStatus;
}
