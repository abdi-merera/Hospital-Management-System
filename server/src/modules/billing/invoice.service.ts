import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import mongoose from 'mongoose';
import { Admission, Encounter, Invoice, InvoiceItem, Patient, Payment, Prescription } from './invoice.model';
import type { AuthSender, BillingFilters, InvoiceData, InvoiceItemPayload, InvoiceRecordPayload, PaymentPayload } from './invoice.types';

const serverRoot = path.resolve(__dirname, '../../..');
const invoiceDirectory = path.join(serverRoot, 'public', 'invoice');
const logoPath = path.join(serverRoot, 'public', 'images', 'logo.png');

const populatedInvoiceQuery = [
  {
    path: 'patientId',
    populate: {
      path: 'userId',
    },
  },
  {
    path: 'encounterId',
  },
  {
    path: 'admissionId',
  },
  {
    path: 'createdBy',
    select: 'firstName lastName email userType',
  },
];

const populatedPaymentQuery = [
  {
    path: 'invoiceId',
  },
  {
    path: 'receivedBy',
    select: 'firstName lastName email userType',
  },
];

function objectId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

function amount(value: unknown, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function buildInvoiceQuery(filters: BillingFilters) {
  const query: Record<string, unknown> = {};

  if (filters.patientId) query.patientId = objectId(filters.patientId);
  if (filters.encounterId) query.encounterId = objectId(filters.encounterId);
  if (filters.admissionId) query.admissionId = objectId(filters.admissionId);
  if (filters.status) query.status = filters.status;

  return query;
}

async function recalculateInvoice(invoiceId: string) {
  const invoice = await Invoice.findById(invoiceId);

  if (!invoice) {
    return null;
  }

  const items = await InvoiceItem.find({ invoiceId: invoice._id });
  const payments = await Payment.find({ invoiceId: invoice._id });
  const subtotal = items.reduce((sum: number, item: any) => sum + amount(item.total), 0);
  const discount = amount(invoice.discount);
  const tax = amount(invoice.tax);
  const total = Math.max(subtotal - discount + tax, 0);
  const paid = payments.reduce((sum: number, payment: any) => sum + amount(payment.amount), 0);
  const balance = Math.max(total - paid, 0);

  let status = invoice.status;

  if (status !== 'CANCELLED') {
    if (paid <= 0) {
      status = invoice.status === 'DRAFT' ? 'DRAFT' : 'ISSUED';
    } else if (balance <= 0) {
      status = 'PAID';
    } else {
      status = 'PARTIALLY_PAID';
    }
  }

  return Invoice.findByIdAndUpdate(
    invoiceId,
    {
      subtotal,
      total,
      paid,
      balance,
      status,
    },
    { new: true },
  ).populate(populatedInvoiceQuery);
}

export function listInvoices(filters: BillingFilters) {
  return Invoice.find(buildInvoiceQuery(filters)).populate(populatedInvoiceQuery).sort({ createdAt: -1 });
}

export async function findInvoiceById(id: string) {
  const invoice = await Invoice.findById(id).populate(populatedInvoiceQuery).lean();

  if (!invoice) {
    return null;
  }

  const items = await InvoiceItem.find({ invoiceId: invoice._id }).sort({ createdAt: 1 }).lean();
  const payments = await Payment.find({ invoiceId: invoice._id }).populate(populatedPaymentQuery).sort({ receivedAt: -1 }).lean();

  return {
    ...invoice,
    items,
    payments,
  };
}

export async function createInvoiceRecord(payload: InvoiceRecordPayload, sender?: AuthSender) {
  const patient = await Patient.findById(payload.patientId);
  if (!patient) throw new Error('Patient not found');

  if (payload.encounterId) {
    const encounter = await Encounter.findById(payload.encounterId);
    if (!encounter) throw new Error('Encounter not found');
  }

  if (payload.admissionId) {
    const admission = await Admission.findById(payload.admissionId);
    if (!admission) throw new Error('Admission not found');
  }

  const invoice = await Invoice.create({
    patientId: objectId(payload.patientId as string),
    encounterId: payload.encounterId ? objectId(payload.encounterId) : undefined,
    admissionId: payload.admissionId ? objectId(payload.admissionId) : undefined,
    status: payload.status || 'DRAFT',
    discount: amount(payload.discount),
    tax: amount(payload.tax),
    createdBy: sender?.id ? objectId(sender.id) : undefined,
  });

  for (const item of payload.items || []) {
    await createInvoiceItemRecord({
      ...item,
      invoiceId: String(invoice._id),
    });
  }

  return recalculateInvoice(String(invoice._id));
}

export async function updateInvoiceRecord(id: string, payload: InvoiceRecordPayload) {
  await Invoice.findByIdAndUpdate(id, {
    encounterId: payload.encounterId ? objectId(payload.encounterId) : undefined,
    admissionId: payload.admissionId ? objectId(payload.admissionId) : undefined,
    status: payload.status,
    discount: amount(payload.discount),
    tax: amount(payload.tax),
  });

  return recalculateInvoice(id);
}

export async function createInvoiceItemRecord(payload: InvoiceItemPayload) {
  const invoice = await Invoice.findById(payload.invoiceId);
  if (!invoice) throw new Error('Invoice not found');

  const quantity = amount(payload.quantity, 1);
  const unitPrice = amount(payload.unitPrice);

  const item = await InvoiceItem.create({
    invoiceId: objectId(payload.invoiceId as string),
    description: payload.description,
    quantity,
    unitPrice,
    total: quantity * unitPrice,
    category: payload.category || 'OTHER',
  });

  await recalculateInvoice(payload.invoiceId as string);
  return item;
}

export async function updateInvoiceItemRecord(id: string, payload: InvoiceItemPayload) {
  const quantity = amount(payload.quantity, 1);
  const unitPrice = amount(payload.unitPrice);

  const item = await InvoiceItem.findByIdAndUpdate(
    id,
    {
      description: payload.description,
      quantity,
      unitPrice,
      total: quantity * unitPrice,
      category: payload.category,
    },
    { new: true },
  );

  if (item) {
    await recalculateInvoice(String(item.invoiceId));
  }

  return item;
}

export async function deleteInvoiceItemRecord(id: string) {
  const item = await InvoiceItem.findByIdAndDelete(id);

  if (item) {
    await recalculateInvoice(String(item.invoiceId));
  }

  return item;
}

export function listPayments(filters: BillingFilters) {
  const query: Record<string, unknown> = {};
  if (filters.invoiceId) query.invoiceId = objectId(filters.invoiceId);
  return Payment.find(query).populate(populatedPaymentQuery).sort({ receivedAt: -1 });
}

export async function receivePaymentRecord(payload: PaymentPayload, sender?: AuthSender) {
  const invoice = await Invoice.findById(payload.invoiceId);
  if (!invoice) throw new Error('Invoice not found');
  if (invoice.status === 'CANCELLED') throw new Error('Cannot receive payment for a cancelled invoice');

  const payment = await Payment.create({
    invoiceId: objectId(payload.invoiceId as string),
    amount: amount(payload.amount),
    method: payload.method || 'CASH',
    reference: payload.reference,
    receivedBy: sender?.id ? objectId(sender.id) : undefined,
    receivedAt: payload.receivedAt ? new Date(payload.receivedAt) : new Date(),
  });

  const updatedInvoice = await recalculateInvoice(payload.invoiceId as string);

  if (updatedInvoice?.status === 'PAID' && updatedInvoice.encounterId) {
    await Encounter.findByIdAndUpdate(updatedInvoice.encounterId, {
      status: 'WAITING_TRIAGE',
      paymentException: false,
      paymentExceptionReason: undefined,
      paymentExceptionBy: undefined,
      paymentExceptionAt: undefined,
    });
  }

  return Payment.findById(payment._id).populate(populatedPaymentQuery);
}

export async function authorizeManualTreatmentRecord(invoiceId: string, reason?: string, sender?: AuthSender) {
  const invoice = await Invoice.findById(invoiceId);

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  if (!invoice.encounterId) {
    throw new Error('This invoice is not linked to an encounter');
  }

  if (invoice.status === 'PAID') {
    throw new Error('This invoice is already paid');
  }

  const encounter = await Encounter.findByIdAndUpdate(
    invoice.encounterId,
    {
      status: 'WAITING_TRIAGE',
      paymentException: true,
      paymentExceptionReason: reason || 'Payment not processed; cashier manually allowed treatment.',
      paymentExceptionBy: sender?.id ? objectId(sender.id) : undefined,
      paymentExceptionAt: new Date(),
    },
    { new: true },
  );

  if (!encounter) {
    throw new Error('Encounter not found');
  }

  return findInvoiceById(invoiceId);
}

export async function findPrescriptionForInvoice(prescriptionId: string) {
  return Prescription.findById(prescriptionId)
    .populate({
      path: 'prescribedMed.medicineId',
    })
    .populate({
      path: 'appointmentId',
      populate: [
        {
          path: 'patientId',
          populate: {
            path: 'userId',
          },
        },
        {
          path: 'doctorId',
          populate: {
            path: 'userId',
          },
        },
      ],
    });
}

export function createInvoiceData(prescription: any): InvoiceData {
  const invoice: InvoiceData = {
    shipping: {
      name: `${prescription.appointmentId.patientId.userId.firstName} ${prescription.appointmentId.patientId.userId.lastName}`,
      address: prescription.appointmentId.patientId.address,
      city: 'Cambridge',
      state: 'ON',
      country: 'CA',
      postal_code: 94111,
    },
    items: [
      {
        item: 'Visitation',
        dosage: '',
        quantity: 1,
        amount: 200,
      },
    ],
    subtotal: 0,
    paid: 0,
    invoice_nr: String(prescription._id),
  };

  for (const item of prescription.prescribedMed) {
    invoice.items.push({
      item: item.medicineId.name,
      dosage: item.dosage,
      quantity: item.qty,
      amount: item.medicineId.price * item.qty,
    });
  }

  const total = invoice.items.reduce((sum, item) => sum + item.amount, 0);
  invoice.subtotal = total;
  invoice.paid = total;

  return invoice;
}

export async function generateInvoicePdf(prescriptionId: string) {
  const prescription = await findPrescriptionForInvoice(prescriptionId);

  if (!prescription) {
    return null;
  }

  fs.mkdirSync(invoiceDirectory, { recursive: true });

  const filePath = path.join(invoiceDirectory, `medical_invoice_${prescriptionId}.pdf`);
  const invoice = createInvoiceData(prescription);

  await createInvoice(invoice, filePath);

  return filePath;
}

function createInvoice(invoice: InvoiceData, filePath: string) {
  return new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(filePath);

    stream.on('finish', resolve);
    stream.on('error', reject);
    doc.on('error', reject);

    doc.pipe(stream);
    generateHeader(doc);
    generateCustomerInformation(doc, invoice);
    generateInvoiceTable(doc, invoice);
    generateFooter(doc);
    doc.end();
  });
}

function generateHeader(doc: any) {
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 45, { width: 50 });
  }

  doc
    .fillColor('#444444')
    .fontSize(20)
    .text('GreenHll Hospital', 110, 57)
    .fontSize(10)
    .text('GreenHll Hospital', 200, 50, { align: 'right' })
    .text('123 Main Street', 200, 65, { align: 'right' })
    .text('Kitchener, ON, N7T 9U7', 200, 80, { align: 'right' })
    .moveDown();
}

function generateCustomerInformation(doc: any, invoice: InvoiceData) {
  doc.fillColor('#444444').fontSize(20).text('Invoice', 50, 160);

  generateHr(doc, 185);

  const customerInformationTop = 200;

  doc
    .fontSize(10)
    .text('Invoice Number:', 50, customerInformationTop)
    .font('Helvetica-Bold')
    .text(invoice.invoice_nr, 150, customerInformationTop)
    .font('Helvetica')
    .text('Invoice Date:', 50, customerInformationTop + 15)
    .text(formatDate(new Date()), 150, customerInformationTop + 15)
    .text('Balance Due:', 50, customerInformationTop + 30)
    .text(formatCurrency(invoice.subtotal - invoice.paid), 150, customerInformationTop + 30)
    .font('Helvetica-Bold')
    .text(invoice.shipping.name, 300, customerInformationTop)
    .font('Helvetica')
    .text(invoice.shipping.address || '', 300, customerInformationTop + 15)
    .text(`${invoice.shipping.city}, ${invoice.shipping.state}, ${invoice.shipping.country}`, 300, customerInformationTop + 30)
    .moveDown();

  generateHr(doc, 252);
}

function generateInvoiceTable(doc: any, invoice: InvoiceData) {
  const invoiceTableTop = 330;

  doc.font('Helvetica-Bold');
  generateTableRow(doc, invoiceTableTop, 'Item', 'Dosage', 'Unit Cost', 'Quantity', 'Total');
  generateHr(doc, invoiceTableTop + 20);
  doc.font('Helvetica');

  for (let i = 0; i < invoice.items.length; i += 1) {
    const item = invoice.items[i];
    const position = invoiceTableTop + (i + 1) * 30;

    generateTableRow(
      doc,
      position,
      item.item,
      item.dosage,
      formatCurrency(item.amount / item.quantity),
      String(item.quantity),
      formatCurrency(item.amount),
    );

    generateHr(doc, position + 20);
  }

  const subtotalPosition = invoiceTableTop + (invoice.items.length + 1) * 30;
  generateTableRow(doc, subtotalPosition, '', '', 'Subtotal', '', formatCurrency(invoice.subtotal));

  const paidToDatePosition = subtotalPosition + 20;
  generateTableRow(doc, paidToDatePosition, '', '', 'Paid To Date', '', formatCurrency(invoice.paid));

  const duePosition = paidToDatePosition + 25;
  doc.font('Helvetica-Bold');
  generateTableRow(doc, duePosition, '', '', 'Balance Due', '', formatCurrency(invoice.subtotal - invoice.paid));
  doc.font('Helvetica');
}

function generateFooter(doc: any) {
  doc.fontSize(10).text('', 50, 780, { align: 'center', width: 500 });
}

function generateTableRow(
  doc: any,
  y: number,
  item: string,
  dosage: string,
  unitCost: string,
  quantity: string,
  lineTotal: string,
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(dosage, 150, y)
    .text(unitCost, 280, y, { width: 90, align: 'right' })
    .text(quantity, 370, y, { width: 90, align: 'right' })
    .text(lineTotal, 0, y, { align: 'right' });
}

function generateHr(doc: any, y: number) {
  doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

function formatCurrency(amount: number) {
  return `$${amount.toFixed(2)}`;
}

function formatDate(date: Date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${year}/${month}/${day}`;
}
