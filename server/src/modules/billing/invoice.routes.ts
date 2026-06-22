import { Router } from 'express';
import { requirePermission } from '../../middleware/auth.middleware';
import {
  authorizeManualTreatment,
  createInvoice,
  createInvoiceItem,
  deleteInvoiceItem,
  getInvoice,
  getInvoiceById,
  getInvoices,
  getPayments,
  receivePayment,
  updateInvoice,
  updateInvoiceItem,
} from './invoice.controller';

const router = Router();

router.get('/invoices', requirePermission('view_invoice'), getInvoices);
router.get('/invoices/:id', requirePermission('view_invoice'), getInvoiceById);
router.post('/invoices', requirePermission('create_invoice'), createInvoice);
router.patch('/invoices/:id', requirePermission('update_invoice'), updateInvoice);
router.post('/invoices/:id/manual-treatment', requirePermission('receive_payment'), authorizeManualTreatment);

router.post('/invoice-items', requirePermission('update_invoice'), createInvoiceItem);
router.patch('/invoice-items/:id', requirePermission('update_invoice'), updateInvoiceItem);
router.delete('/invoice-items/:id', requirePermission('update_invoice'), deleteInvoiceItem);

router.get('/payments', requirePermission('view_invoice'), getPayments);
router.post('/payments', requirePermission('receive_payment'), receivePayment);

router.get('/prescription/invoice/:id', getInvoice);

export default router;
