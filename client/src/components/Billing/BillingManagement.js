import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import axios from 'axios';

const pageClass = "mt-[50px] min-h-screen w-full p-8";
const pageTitleClass = "mb-4 text-3xl font-bold text-[#31b372]";
const panelClass = "mb-6 rounded border border-[#e0e0e0] bg-white p-5 shadow-sm";
const sectionTitleClass = "mb-4 text-xl font-bold text-[#31b372]";
const labelClass = "mb-1 block font-semibold text-[#333]";
const inputClass = "form-control";
const selectClass = "form-select";
const primaryButtonClass = "btn btn-primary btn-rounded px-4";
const mutedButtonClass = "btn btn-outline-secondary btn-rounded px-4";
const smallMutedTextClass = "text-sm text-[#666]";
const badgeBaseClass = "inline-block rounded px-2 py-1 text-xs font-bold";
const statusClass = {
  DRAFT: `${badgeBaseClass} bg-[#e8edf1] text-[#334155]`,
  ISSUED: `${badgeBaseClass} bg-[#fff4de] text-[#8a5a00]`,
  PARTIALLY_PAID: `${badgeBaseClass} bg-[#fff4de] text-[#8a5a00]`,
  PAID: `${badgeBaseClass} bg-[#e9f8ef] text-[#155734]`,
  CANCELLED: `${badgeBaseClass} bg-[#f9e8e8] text-[#8a1f1f]`,
};
const warningBadgeClass = `${badgeBaseClass} bg-[#fff7df] text-[#8a5a00]`;

function authHeaders() {
  return {
    authorization: `Bearer ${localStorage.getItem('token')}`,
  };
}

function patientName(patient) {
  if (!patient?.userId) return 'Unknown patient';
  return `${patient.userId.firstName || ''} ${patient.userId.lastName || ''}`.trim();
}

function patientPhone(patient) {
  return patient?.phone || '-';
}

function encounterLabel(encounter) {
  if (!encounter) return '-';
  return `${encounter.type || 'Encounter'} - ${formatDate(encounter.startedAt)}`;
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
  });
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

export default function BillingManagement() {
  const [patients, setPatients] = useState([]);
  const [encounters, setEncounters] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceForm, setInvoiceForm] = useState({
    patientId: '',
    encounterId: '',
    admissionId: '',
    status: 'ISSUED',
    discount: '',
    tax: '',
  });
  const [itemForm, setItemForm] = useState({
    description: '',
    quantity: '1',
    unitPrice: '',
    category: 'CONSULTATION',
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: 'CASH',
    reference: '',
  });
  const [manualReason, setManualReason] = useState('Payment could not be processed because of network or processing issue.');
  const [filters, setFilters] = useState({
    patientId: '',
    status: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getPatients = async () => {
    const response = await axios.get('http://localhost:3001/patients', { headers: authHeaders() });
    setPatients(response.data || []);
  };

  const getEncounters = async () => {
    try {
      const response = await axios.get('http://localhost:3001/encounters', { headers: authHeaders() });
      setEncounters(response.data.encounters || []);
    } catch (_requestError) {
      setEncounters([]);
    }
  };

  const getAdmissions = async () => {
    try {
      const response = await axios.get('http://localhost:3001/admissions', { headers: authHeaders() });
      setAdmissions(response.data.admissions || []);
    } catch (_requestError) {
      setAdmissions([]);
    }
  };

  const getInvoices = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get('http://localhost:3001/invoices', {
        headers: authHeaders(),
        params: {
          patientId: filters.patientId || undefined,
          status: filters.status || undefined,
        },
      });
      setInvoices(response.data.invoices || []);
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not load invoices');
    } finally {
      setLoading(false);
    }
  };

  const getInvoiceDetails = async (invoiceId) => {
    if (!invoiceId) return;

    try {
      const response = await axios.get(`http://localhost:3001/invoices/${invoiceId}`, {
        headers: authHeaders(),
      });
      setSelectedInvoice(response.data.invoice);
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not load invoice details');
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    Promise.all([getPatients(), getEncounters(), getAdmissions(), getInvoices()]).catch((requestError) => {
      setError(requestError.response?.data?.errors?.[0] || 'Could not load billing data');
    });
    // Run once on mount; invoice searches are triggered explicitly by the Search button.
  }, []);

  const handleInvoiceChange = (event) => {
    setInvoiceForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleItemChange = (event) => {
    setItemForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handlePaymentChange = (event) => {
    setPaymentForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleFilterChange = (event) => {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const selectInvoice = async (invoice) => {
    setSelectedInvoice(null);
    setItemForm({ description: '', quantity: '1', unitPrice: '', category: 'CONSULTATION' });
    setPaymentForm({ amount: '', method: 'CASH', reference: '' });
    setManualReason('Payment could not be processed because of network or processing issue.');
    await getInvoiceDetails(invoice._id);
  };

  const handleCreateInvoice = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:3001/invoices', {
        patientId: invoiceForm.patientId,
        encounterId: invoiceForm.encounterId || undefined,
        admissionId: invoiceForm.admissionId || undefined,
        status: invoiceForm.status,
        discount: invoiceForm.discount ? Number(invoiceForm.discount) : 0,
        tax: invoiceForm.tax ? Number(invoiceForm.tax) : 0,
      }, {
        headers: authHeaders(),
      });
      setInvoiceForm({ patientId: '', encounterId: '', admissionId: '', status: 'ISSUED', discount: '', tax: '' });
      await getInvoices();
      if (response.data.invoice?._id) await getInvoiceDetails(response.data.invoice._id);
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not create invoice');
    }
  };

  const handleAddInvoiceItem = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await axios.post('http://localhost:3001/invoice-items', {
        invoiceId: selectedInvoice?._id,
        description: itemForm.description,
        quantity: Number(itemForm.quantity || 1),
        unitPrice: Number(itemForm.unitPrice || 0),
        category: itemForm.category,
      }, {
        headers: authHeaders(),
      });
      setItemForm({ description: '', quantity: '1', unitPrice: '', category: 'CONSULTATION' });
      await getInvoiceDetails(selectedInvoice._id);
      await getInvoices();
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not add invoice item');
    }
  };

  const handleReceivePayment = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await axios.post('http://localhost:3001/payments', {
        invoiceId: selectedInvoice?._id,
        amount: Number(paymentForm.amount || 0),
        method: paymentForm.method,
        reference: paymentForm.reference,
      }, {
        headers: authHeaders(),
      });
      setPaymentForm({ amount: '', method: 'CASH', reference: '' });
      await getInvoiceDetails(selectedInvoice._id);
      await getInvoices();
      await getEncounters();
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not receive payment');
    }
  };

  const handleManualTreatment = async (invoiceId = selectedInvoice?._id) => {
    if (!invoiceId) return;
    setError('');

    try {
      const response = await axios.post(`http://localhost:3001/invoices/${invoiceId}/manual-treatment`, {
        reason: manualReason,
      }, {
        headers: authHeaders(),
      });
      await getInvoices();
      await getEncounters();
      if (selectedInvoice?._id === invoiceId || response.data.invoice?._id) {
        await getInvoiceDetails(invoiceId);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not manually allow treatment');
    }
  };

  const handleIssueInvoice = async () => {
    if (!selectedInvoice?._id) return;
    setError('');

    try {
      await axios.patch(`http://localhost:3001/invoices/${selectedInvoice._id}`, {
        status: 'ISSUED',
        discount: selectedInvoice.discount || 0,
        tax: selectedInvoice.tax || 0,
      }, {
        headers: authHeaders(),
      });
      await getInvoiceDetails(selectedInvoice._id);
      await getInvoices();
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not issue invoice');
    }
  };

  const patientEncounters = invoiceForm.patientId
    ? encounters.filter((encounter) => encounter.patientId?._id === invoiceForm.patientId || encounter.patientId === invoiceForm.patientId)
    : encounters;
  const patientAdmissions = invoiceForm.patientId
    ? admissions.filter((admission) => admission.patientId?._id === invoiceForm.patientId || admission.patientId === invoiceForm.patientId)
    : admissions;
  const pendingEncounterInvoices = invoices.filter((invoice) => (
    invoice.encounterId
    && invoice.status !== 'PAID'
    && invoice.status !== 'CANCELLED'
  ));

  return (
    <Box className={pageClass} component="main" sx={{ flexGrow: 1 }}>
      <h1 className={pageTitleClass}>Billing</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className={panelClass}>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <div>
            <h2 className={sectionTitleClass}>Cashier Work Queue</h2>
            <p className={smallMutedTextClass}>Pending encounter invoices must be paid or manually allowed before the patient reaches triage.</p>
          </div>
          <button className={mutedButtonClass} type="button" onClick={getInvoices}>Refresh</button>
        </div>

        <div className="table-responsive">
          <table className="table table-striped custom-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Phone</th>
                <th>Encounter</th>
                <th>Status</th>
                <th>Balance</th>
                <th>Payment Flag</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingEncounterInvoices.length === 0 && (
                <tr>
                  <td colSpan="7">No pending encounter payment requests.</td>
                </tr>
              )}
              {pendingEncounterInvoices.map((invoice) => (
                <tr key={invoice._id}>
                  <td>{patientName(invoice.patientId)}</td>
                  <td>{patientPhone(invoice.patientId)}</td>
                  <td>{encounterLabel(invoice.encounterId)}</td>
                  <td><span className={statusClass[invoice.status] || badgeBaseClass}>{invoice.status}</span></td>
                  <td>{formatCurrency(invoice.balance)}</td>
                  <td>
                    {invoice.encounterId?.paymentException ? (
                      <span className={warningBadgeClass}>! Payment Pending</span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="text-right">
                    <button className={mutedButtonClass} type="button" onClick={() => selectInvoice(invoice)}>View / Pay</button>
                    {!invoice.encounterId?.paymentException && (
                      <button className={`${primaryButtonClass} ms-2`} type="button" onClick={() => handleManualTreatment(invoice._id)}>
                        Manual Allow
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={panelClass}>
        <h2 className={sectionTitleClass}>Create Invoice</h2>
        <form onSubmit={handleCreateInvoice}>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className={labelClass} htmlFor="patientId">Patient</label>
              <select id="patientId" name="patientId" className={selectClass} value={invoiceForm.patientId} onChange={handleInvoiceChange} required>
                <option value="">Choose Patient</option>
                {patients.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.medicalRecordNo ? `${patient.medicalRecordNo} - ` : ''}{patientName(patient)}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3 mb-3">
              <label className={labelClass} htmlFor="encounterId">Encounter</label>
              <select id="encounterId" name="encounterId" className={selectClass} value={invoiceForm.encounterId} onChange={handleInvoiceChange}>
                <option value="">Optional</option>
                {patientEncounters.map((encounter) => (
                  <option key={encounter._id} value={encounter._id}>{encounter.type} - {formatDate(encounter.startedAt)}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3 mb-3">
              <label className={labelClass} htmlFor="admissionId">Admission</label>
              <select id="admissionId" name="admissionId" className={selectClass} value={invoiceForm.admissionId} onChange={handleInvoiceChange}>
                <option value="">Optional</option>
                {patientAdmissions.map((admission) => (
                  <option key={admission._id} value={admission._id}>{admission.status} - {formatDate(admission.admittedAt)}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2 mb-3">
              <label className={labelClass} htmlFor="invoiceStatus">Status</label>
              <select id="invoiceStatus" name="status" className={selectClass} value={invoiceForm.status} onChange={handleInvoiceChange}>
                <option value="DRAFT">Draft</option>
                <option value="ISSUED">Issued</option>
              </select>
            </div>
            <div className="col-md-2 mb-3">
              <label className={labelClass} htmlFor="discount">Discount</label>
              <input id="discount" name="discount" type="number" min="0" className={inputClass} value={invoiceForm.discount} onChange={handleInvoiceChange} />
            </div>
            <div className="col-md-2 mb-3">
              <label className={labelClass} htmlFor="tax">Tax</label>
              <input id="tax" name="tax" type="number" min="0" className={inputClass} value={invoiceForm.tax} onChange={handleInvoiceChange} />
            </div>
          </div>
          <button className={primaryButtonClass} type="submit">Create Invoice</button>
        </form>
      </div>

      <div className={panelClass}>
        <h2 className={sectionTitleClass}>Find Invoices</h2>
        <div className="row align-items-end">
          <div className="col-md-4 mb-3">
            <label className={labelClass} htmlFor="filterPatientId">Patient</label>
            <select id="filterPatientId" name="patientId" className={selectClass} value={filters.patientId} onChange={handleFilterChange}>
              <option value="">All Patients</option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.medicalRecordNo ? `${patient.medicalRecordNo} - ` : ''}{patientName(patient)}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3 mb-3">
            <label className={labelClass} htmlFor="filterStatus">Status</label>
            <select id="filterStatus" name="status" className={selectClass} value={filters.status} onChange={handleFilterChange}>
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="ISSUED">Issued</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PAID">Paid</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="col-md-2 mb-3">
            <button className={mutedButtonClass} type="button" onClick={getInvoices}>Search</button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-striped custom-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Status</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Created</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="7">Loading invoices...</td>
                </tr>
              )}
              {!loading && invoices.length === 0 && (
                <tr>
                  <td colSpan="7">No invoices found.</td>
                </tr>
              )}
              {!loading && invoices.map((invoice) => (
                <tr key={invoice._id}>
                  <td>{patientName(invoice.patientId)}</td>
                  <td><span className={statusClass[invoice.status] || badgeBaseClass}>{invoice.status}</span></td>
                  <td>{formatCurrency(invoice.total)}</td>
                  <td>{formatCurrency(invoice.paid)}</td>
                  <td>{formatCurrency(invoice.balance)}</td>
                  <td>{formatDate(invoice.createdAt)}</td>
                  <td className="text-right">
                    <button className={mutedButtonClass} type="button" onClick={() => selectInvoice(invoice)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedInvoice && (
        <div className={panelClass}>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <h2 className={sectionTitleClass}>Invoice Details</h2>
            <button className={mutedButtonClass} type="button" onClick={() => setSelectedInvoice(null)}>Close</button>
          </div>

          <div className="row">
            <div className="col-md-3 mb-3">
              <strong>Patient</strong>
              <div>{patientName(selectedInvoice.patientId)}</div>
            </div>
            <div className="col-md-2 mb-3">
              <strong>Status</strong>
              <div><span className={statusClass[selectedInvoice.status] || badgeBaseClass}>{selectedInvoice.status}</span></div>
            </div>
            <div className="col-md-2 mb-3">
              <strong>Total</strong>
              <div>{formatCurrency(selectedInvoice.total)}</div>
            </div>
            <div className="col-md-2 mb-3">
              <strong>Paid</strong>
              <div>{formatCurrency(selectedInvoice.paid)}</div>
            </div>
            <div className="col-md-2 mb-3">
              <strong>Balance</strong>
              <div>{formatCurrency(selectedInvoice.balance)}</div>
            </div>
            <div className="col-md-3 mb-3">
              <strong>Payment Flag</strong>
              <div>
                {selectedInvoice.encounterId?.paymentException ? (
                  <span className={warningBadgeClass}>! Treatment Allowed, Payment Pending</span>
                ) : (
                  '-'
                )}
              </div>
            </div>
            <div className="col-md-1 mb-3">
              {selectedInvoice.status === 'DRAFT' && (
                <button className={primaryButtonClass} type="button" onClick={handleIssueInvoice}>Issue</button>
              )}
            </div>
          </div>
          {selectedInvoice.encounterId?.paymentException && (
            <div className="alert alert-warning" role="alert">
              Payment has not been fully processed. Patient was manually allowed to continue for treatment.
              {selectedInvoice.encounterId?.paymentExceptionReason ? ` Reason: ${selectedInvoice.encounterId.paymentExceptionReason}` : ''}
            </div>
          )}

          <hr className="my-4" />

          <h3 className={sectionTitleClass}>Add Charge</h3>
          <form onSubmit={handleAddInvoiceItem}>
            <div className="row align-items-end">
              <div className="col-md-4 mb-3">
                <label className={labelClass} htmlFor="description">Description</label>
                <input id="description" name="description" className={inputClass} value={itemForm.description} onChange={handleItemChange} required />
              </div>
              <div className="col-md-2 mb-3">
                <label className={labelClass} htmlFor="category">Category</label>
                <select id="category" name="category" className={selectClass} value={itemForm.category} onChange={handleItemChange}>
                  <option value="CONSULTATION">Consultation</option>
                  <option value="LAB">Lab</option>
                  <option value="RADIOLOGY">Radiology</option>
                  <option value="PHARMACY">Pharmacy</option>
                  <option value="WARD">Ward</option>
                  <option value="PROCEDURE">Procedure</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="col-md-2 mb-3">
                <label className={labelClass} htmlFor="quantity">Quantity</label>
                <input id="quantity" name="quantity" type="number" min="1" className={inputClass} value={itemForm.quantity} onChange={handleItemChange} />
              </div>
              <div className="col-md-2 mb-3">
                <label className={labelClass} htmlFor="unitPrice">Unit Price</label>
                <input id="unitPrice" name="unitPrice" type="number" min="0" className={inputClass} value={itemForm.unitPrice} onChange={handleItemChange} required />
              </div>
              <div className="col-md-2 mb-3">
                <button className={primaryButtonClass} type="submit">Add Item</button>
              </div>
            </div>
          </form>

          <div className="table-responsive mt-3">
            <table className="table table-striped custom-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {(!selectedInvoice.items || selectedInvoice.items.length === 0) && (
                  <tr>
                    <td colSpan="5">No invoice items yet.</td>
                  </tr>
                )}
                {selectedInvoice.items?.map((item) => (
                  <tr key={item._id}>
                    <td>{item.description}</td>
                    <td>{item.category}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.unitPrice)}</td>
                    <td>{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <hr className="my-4" />

          <h3 className={sectionTitleClass}>Receive Payment</h3>
          <form onSubmit={handleReceivePayment}>
            <div className="row align-items-end">
              <div className="col-md-3 mb-3">
                <label className={labelClass} htmlFor="paymentAmount">Amount</label>
                <input id="paymentAmount" name="amount" type="number" min="1" className={inputClass} value={paymentForm.amount} onChange={handlePaymentChange} required />
              </div>
              <div className="col-md-3 mb-3">
                <label className={labelClass} htmlFor="paymentMethod">Method</label>
                <select id="paymentMethod" name="method" className={selectClass} value={paymentForm.method} onChange={handlePaymentChange}>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                  <option value="INSURANCE">Insurance</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>
              <div className="col-md-4 mb-3">
                <label className={labelClass} htmlFor="paymentReference">Reference</label>
                <input id="paymentReference" name="reference" className={inputClass} value={paymentForm.reference} onChange={handlePaymentChange} />
              </div>
              <div className="col-md-2 mb-3">
                <button className={primaryButtonClass} type="submit" disabled={selectedInvoice.status === 'PAID' || selectedInvoice.status === 'CANCELLED'}>
                  Receive
                </button>
              </div>
            </div>
          </form>

          {selectedInvoice.encounterId && selectedInvoice.status !== 'PAID' && selectedInvoice.status !== 'CANCELLED' && !selectedInvoice.encounterId?.paymentException && (
            <div className="mt-4 rounded border border-[#ffe2a8] bg-[#fffaf0] p-4">
              <h4 className="mb-2 font-bold text-[#8a5a00]">Manual Treatment Allowance</h4>
              <p className={smallMutedTextClass}>Use this only when payment cannot be processed, but the patient must continue to triage. The invoice remains unpaid.</p>
              <div className="row align-items-end">
                <div className="col-md-9 mb-3">
                  <label className={labelClass} htmlFor="manualReason">Reason</label>
                  <input id="manualReason" className={inputClass} value={manualReason} onChange={(event) => setManualReason(event.target.value)} />
                </div>
                <div className="col-md-3 mb-3">
                  <button className={primaryButtonClass} type="button" onClick={() => handleManualTreatment(selectedInvoice._id)}>
                    Manual Allow
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-3">
            <h4 className="mb-3 font-bold text-[#31b372]">Payments</h4>
            {(!selectedInvoice.payments || selectedInvoice.payments.length === 0) && <p className={smallMutedTextClass}>No payments recorded yet.</p>}
            {selectedInvoice.payments?.length > 0 && (
              <div className="table-responsive">
                <table className="table table-striped custom-table">
                  <thead>
                    <tr>
                      <th>Received</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.payments.map((payment) => (
                      <tr key={payment._id}>
                        <td>{formatDate(payment.receivedAt)}</td>
                        <td>{formatCurrency(payment.amount)}</td>
                        <td>{payment.method}</td>
                        <td>{payment.reference || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </Box>
  );
}
