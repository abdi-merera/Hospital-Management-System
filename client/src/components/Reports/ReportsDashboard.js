import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import axios from 'axios';

const pageClass = "mt-[50px] min-h-screen w-full p-8";
const pageTitleClass = "mb-4 text-3xl font-bold text-[#31b372]";
const panelClass = "mb-6 rounded border border-[#e0e0e0] bg-white p-5 shadow-sm";
const sectionTitleClass = "mb-4 text-xl font-bold text-[#31b372]";
const primaryButtonClass = "btn btn-primary btn-rounded px-4";
const mutedTextClass = "text-sm text-[#666]";
const metricCardClass = "mb-4 rounded border border-[#e0e0e0] bg-white p-4 shadow-sm";
const metricLabelClass = "mb-1 text-sm font-semibold uppercase text-[#666]";
const metricValueClass = "text-3xl font-bold text-[#31b372]";
const badgeClass = "inline-block rounded bg-[#e9f8ef] px-2 py-1 text-xs font-bold text-[#155734]";

function authHeaders() {
  return {
    authorization: `Bearer ${localStorage.getItem('token')}`,
  };
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

function userName(user) {
  if (!user) return 'System';
  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown user';
}

function MetricCard({ label, value, helper }) {
  return (
    <div className={metricCardClass}>
      <div className={metricLabelClass}>{label}</div>
      <div className={metricValueClass}>{value}</div>
      {helper && <div className={mutedTextClass}>{helper}</div>}
    </div>
  );
}

export default function ReportsDashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getSummary = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get('http://localhost:3001/reports/summary', {
        headers: authHeaders(),
      });
      setSummary(response.data.summary);
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not load reports summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSummary();
    // Run once on mount; the Refresh button reloads this report.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const beds = summary?.beds || {};
  const billing = summary?.billing || {};
  const auditLogs = summary?.auditLogs || [];

  return (
    <Box className={pageClass} component="main" sx={{ flexGrow: 1 }}>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h1 className={pageTitleClass}>Reports</h1>
        <button className={primaryButtonClass} type="button" onClick={getSummary} disabled={loading}>
          Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading && !summary && <div className={panelClass}>Loading reports...</div>}

      {summary && (
        <>
          <div className="row">
            <div className="col-md-3">
              <MetricCard label="Patients" value={summary.patients?.total || 0} helper="Registered patient records" />
            </div>
            <div className="col-md-3">
              <MetricCard label="Open Encounters" value={summary.encounters?.open || 0} helper="Visits still in progress" />
            </div>
            <div className="col-md-3">
              <MetricCard label="Active Admissions" value={summary.admissions?.active || 0} helper="Admitted or transferred" />
            </div>
            <div className="col-md-3">
              <MetricCard label="Unpaid Balance" value={formatCurrency(billing.unpaidBalance)} helper={`${billing.unpaidInvoices || 0} unpaid invoices`} />
            </div>
          </div>

          <div className="row">
            <div className="col-lg-6">
              <div className={panelClass}>
                <h2 className={sectionTitleClass}>Bed Status</h2>
                <div className="row">
                  <div className="col-6 mb-3">
                    <MetricCard label="Available" value={beds.available || 0} />
                  </div>
                  <div className="col-6 mb-3">
                    <MetricCard label="Occupied" value={beds.occupied || 0} />
                  </div>
                  <div className="col-6 mb-3">
                    <MetricCard label="Reserved" value={beds.reserved || 0} />
                  </div>
                  <div className="col-6 mb-3">
                    <MetricCard label="Maintenance" value={beds.maintenance || 0} />
                  </div>
                </div>
                <p className={mutedTextClass}>Total configured beds: {beds.total || 0}</p>
              </div>
            </div>

            <div className="col-lg-6">
              <div className={panelClass}>
                <h2 className={sectionTitleClass}>Billing Snapshot</h2>
                <div className="row">
                  <div className="col-6 mb-3">
                    <MetricCard label="Paid Invoices" value={billing.paidInvoices || 0} />
                  </div>
                  <div className="col-6 mb-3">
                    <MetricCard label="Cancelled" value={billing.cancelledInvoices || 0} />
                  </div>
                  <div className="col-6 mb-3">
                    <MetricCard label="Payments Today" value={billing.paymentsToday || 0} />
                  </div>
                  <div className="col-6 mb-3">
                    <MetricCard label="Received Today" value={formatCurrency(billing.paymentsReceivedToday)} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={panelClass}>
            <h2 className={sectionTitleClass}>Recent Audit Activity</h2>
            <div className="table-responsive">
              <table className="table table-striped custom-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Entity ID</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan="5">No recent audit activity.</td>
                    </tr>
                  )}
                  {auditLogs.map((auditLog) => (
                    <tr key={auditLog._id}>
                      <td>{formatDate(auditLog.createdAt)}</td>
                      <td>{userName(auditLog.userId)}</td>
                      <td><span className={badgeClass}>{auditLog.action}</span></td>
                      <td>{auditLog.entity}</td>
                      <td>{auditLog.entityId || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Box>
  );
}
