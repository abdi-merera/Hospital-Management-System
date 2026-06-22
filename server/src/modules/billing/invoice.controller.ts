import fs from 'fs';
import path from 'path';
import type { Request, Response } from 'express';
import { writeAuditLog } from '../audit-logs/audit-log.service';
import {
  authorizeManualTreatmentRecord,
  createInvoiceItemRecord,
  createInvoiceRecord,
  deleteInvoiceItemRecord,
  findInvoiceById,
  generateInvoicePdf,
  listInvoices,
  listPayments,
  receivePaymentRecord,
  updateInvoiceItemRecord,
  updateInvoiceRecord,
} from './invoice.service';
import type { AuthSender, BillingFilters } from './invoice.types';
import { validateInvoiceItemPayload, validateInvoicePayload, validatePaymentPayload } from './invoice.validation';

type AuthenticatedRequest = Request & {
  sender?: AuthSender;
};

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value || '';
}

function getQuery(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : undefined;
  }

  return typeof value === 'string' ? value : undefined;
}

function getBillingFilters(req: Request): BillingFilters {
  return {
    patientId: getQuery(req.query.patientId),
    encounterId: getQuery(req.query.encounterId),
    admissionId: getQuery(req.query.admissionId),
    invoiceId: getQuery(req.query.invoiceId),
    status: getQuery(req.query.status) as BillingFilters['status'],
  };
}

export async function getInvoices(req: Request, res: Response) {
  try {
    const invoices = await listInvoices(getBillingFilters(req));
    return res.json({ message: 'success', invoices });
  } catch (error: any) {
    return res.status(500).json({ message: 'error', errors: [error.message] });
  }
}

export async function getInvoiceById(req: Request, res: Response) {
  try {
    const invoice = await findInvoiceById(getParam(req.params.id));

    if (!invoice) {
      return res.status(404).json({ message: 'error', errors: ['Invoice not found'] });
    }

    return res.json({ message: 'success', invoice });
  } catch (error: any) {
    return res.status(404).json({ message: 'error', errors: [error.message] });
  }
}

export async function createInvoice(req: AuthenticatedRequest, res: Response) {
  const validation = validateInvoicePayload(req.body);
  if (!validation.status) return res.status(400).json({ message: 'error', errors: validation.errors });

  try {
    const invoice = await createInvoiceRecord(req.body, req.sender);
    void writeAuditLog({
      req,
      action: 'CREATE_INVOICE',
      entity: 'Invoice',
      entityId: String(invoice?._id),
      metadata: {
        patientId: String(invoice?.patientId),
        total: invoice?.total,
        balance: invoice?.balance,
      },
    });
    return res.status(201).json({ message: 'success', invoice });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function updateInvoice(req: AuthenticatedRequest, res: Response) {
  try {
    const invoice = await updateInvoiceRecord(getParam(req.params.id), req.body);

    if (!invoice) {
      return res.status(404).json({ message: 'error', errors: ['Invoice not found'] });
    }

    void writeAuditLog({
      req,
      action: 'UPDATE_INVOICE',
      entity: 'Invoice',
      entityId: getParam(req.params.id),
      metadata: {
        status: invoice.status,
        total: invoice.total,
        balance: invoice.balance,
      },
    });
    return res.json({ message: 'success', invoice });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function createInvoiceItem(req: AuthenticatedRequest, res: Response) {
  const validation = validateInvoiceItemPayload(req.body);
  if (!validation.status) return res.status(400).json({ message: 'error', errors: validation.errors });

  try {
    const invoiceItem = await createInvoiceItemRecord(req.body);
    void writeAuditLog({
      req,
      action: 'CREATE_INVOICE_ITEM',
      entity: 'InvoiceItem',
      entityId: String(invoiceItem._id),
      metadata: { invoiceId: String(invoiceItem.invoiceId), total: invoiceItem.total },
    });
    return res.status(201).json({ message: 'success', invoiceItem });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function updateInvoiceItem(req: AuthenticatedRequest, res: Response) {
  try {
    const invoiceItem = await updateInvoiceItemRecord(getParam(req.params.id), req.body);

    if (!invoiceItem) {
      return res.status(404).json({ message: 'error', errors: ['Invoice item not found'] });
    }

    void writeAuditLog({
      req,
      action: 'UPDATE_INVOICE_ITEM',
      entity: 'InvoiceItem',
      entityId: getParam(req.params.id),
      metadata: { invoiceId: String(invoiceItem.invoiceId), total: invoiceItem.total },
    });
    return res.json({ message: 'success', invoiceItem });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function deleteInvoiceItem(req: AuthenticatedRequest, res: Response) {
  try {
    const invoiceItem = await deleteInvoiceItemRecord(getParam(req.params.id));

    if (!invoiceItem) {
      return res.status(404).json({ message: 'error', errors: ['Invoice item not found'] });
    }

    void writeAuditLog({
      req,
      action: 'DELETE_INVOICE_ITEM',
      entity: 'InvoiceItem',
      entityId: getParam(req.params.id),
      metadata: { invoiceId: String(invoiceItem.invoiceId) },
    });
    return res.json({ message: 'success', invoiceItem });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function getPayments(req: Request, res: Response) {
  try {
    const payments = await listPayments(getBillingFilters(req));
    return res.json({ message: 'success', payments });
  } catch (error: any) {
    return res.status(500).json({ message: 'error', errors: [error.message] });
  }
}

export async function receivePayment(req: AuthenticatedRequest, res: Response) {
  const validation = validatePaymentPayload(req.body);
  if (!validation.status) return res.status(400).json({ message: 'error', errors: validation.errors });

  try {
    const payment = await receivePaymentRecord(req.body, req.sender);
    void writeAuditLog({
      req,
      action: 'RECEIVE_PAYMENT',
      entity: 'Payment',
      entityId: String(payment._id),
      metadata: {
        invoiceId: String(payment.invoiceId),
        amount: payment.amount,
        method: payment.method,
      },
    });
    return res.status(201).json({ message: 'success', payment });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function authorizeManualTreatment(req: AuthenticatedRequest, res: Response) {
  try {
    const invoice = await authorizeManualTreatmentRecord(getParam(req.params.id), req.body.reason, req.sender);
    void writeAuditLog({
      req,
      action: 'AUTHORIZE_MANUAL_TREATMENT',
      entity: 'Invoice',
      entityId: getParam(req.params.id),
      metadata: {
        reason: req.body.reason,
        encounterId: String(invoice?.encounterId?._id || invoice?.encounterId || ''),
      },
    });
    return res.json({ message: 'success', invoice });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function getInvoice(req: Request, res: Response) {
  try {
    const prescriptionId = getParam(req.params.id);
    const filePath = await generateInvoicePdf(prescriptionId);

    if (!filePath) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${path.basename(filePath)}`);
    return fs.createReadStream(filePath).pipe(res);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}
