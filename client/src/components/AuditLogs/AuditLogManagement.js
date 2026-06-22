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
const badgeBaseClass = "inline-block rounded px-2 py-1 text-xs font-bold bg-[#e9f8ef] text-[#155734]";

function authHeaders() {
  return {
    authorization: `Bearer ${localStorage.getItem('token')}`,
  };
}

function userName(user) {
  if (!user) return 'System';
  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown user';
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

function formatMetadata(metadata) {
  if (!metadata) return '-';
  return JSON.stringify(metadata, null, 2);
}

export default function AuditLogManagement() {
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    entity: '',
    entityId: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getUsers = async () => {
    const response = await axios.get('http://localhost:3001/users', { headers: authHeaders() });
    setUsers(response.data || []);
  };

  const getAuditLogs = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get('http://localhost:3001/audit-logs', {
        headers: authHeaders(),
        params: {
          userId: filters.userId || undefined,
          action: filters.action || undefined,
          entity: filters.entity || undefined,
          entityId: filters.entityId || undefined,
        },
      });
      setAuditLogs(response.data.auditLogs || []);
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getAuditLogDetails = async (auditLogId) => {
    if (!auditLogId) return;

    try {
      const response = await axios.get(`http://localhost:3001/audit-logs/${auditLogId}`, {
        headers: authHeaders(),
      });
      setSelectedAuditLog(response.data.auditLog);
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not load audit log details');
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    Promise.all([getUsers(), getAuditLogs()]).catch((requestError) => {
      setError(requestError.response?.data?.errors?.[0] || 'Could not load audit data');
    });
    // Run once on mount; audit searches are triggered explicitly by the Search button.
  }, []);

  const handleFilterChange = (event) => {
    setFilters((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleResetFilters = async () => {
    setFilters({ userId: '', action: '', entity: '', entityId: '' });
    setSelectedAuditLog(null);
    setLoading(true);
    setError('');

    try {
      const response = await axios.get('http://localhost:3001/audit-logs', {
        headers: authHeaders(),
      });
      setAuditLogs(response.data.auditLogs || []);
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const actionOptions = [...new Set(auditLogs.map((log) => log.action).filter(Boolean))].sort();
  const entityOptions = [...new Set(auditLogs.map((log) => log.entity).filter(Boolean))].sort();

  return (
    <Box className={pageClass} component="main" sx={{ flexGrow: 1 }}>
      <h1 className={pageTitleClass}>Audit Logs</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className={panelClass}>
        <h2 className={sectionTitleClass}>Find Audit Logs</h2>
        <div className="row align-items-end">
          <div className="col-md-3 mb-3">
            <label className={labelClass} htmlFor="userId">User</label>
            <select id="userId" name="userId" className={selectClass} value={filters.userId} onChange={handleFilterChange}>
              <option value="">All Users</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {userName(user)}{user.userType ? ` - ${user.userType}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3 mb-3">
            <label className={labelClass} htmlFor="action">Action</label>
            <input
              id="action"
              name="action"
              className={inputClass}
              list="audit-actions"
              value={filters.action}
              onChange={handleFilterChange}
              placeholder="CREATE_INVOICE"
            />
            <datalist id="audit-actions">
              {actionOptions.map((action) => <option key={action} value={action} />)}
            </datalist>
          </div>
          <div className="col-md-2 mb-3">
            <label className={labelClass} htmlFor="entity">Entity</label>
            <input
              id="entity"
              name="entity"
              className={inputClass}
              list="audit-entities"
              value={filters.entity}
              onChange={handleFilterChange}
              placeholder="Invoice"
            />
            <datalist id="audit-entities">
              {entityOptions.map((entity) => <option key={entity} value={entity} />)}
            </datalist>
          </div>
          <div className="col-md-2 mb-3">
            <label className={labelClass} htmlFor="entityId">Entity ID</label>
            <input id="entityId" name="entityId" className={inputClass} value={filters.entityId} onChange={handleFilterChange} />
          </div>
          <div className="col-md-2 mb-3 d-flex gap-2">
            <button className={primaryButtonClass} type="button" onClick={getAuditLogs}>Search</button>
            <button className={mutedButtonClass} type="button" onClick={handleResetFilters}>Reset</button>
          </div>
        </div>
      </div>

      <div className={panelClass}>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <div>
            <h2 className={sectionTitleClass}>Recent Activity</h2>
            <p className={smallMutedTextClass}>Showing up to the latest 500 matching events.</p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-striped custom-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Entity ID</th>
                <th>IP Address</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="7">Loading audit logs...</td>
                </tr>
              )}
              {!loading && auditLogs.length === 0 && (
                <tr>
                  <td colSpan="7">No audit logs found.</td>
                </tr>
              )}
              {!loading && auditLogs.map((auditLog) => (
                <tr key={auditLog._id}>
                  <td>{formatDate(auditLog.createdAt)}</td>
                  <td>{userName(auditLog.userId)}</td>
                  <td><span className={badgeBaseClass}>{auditLog.action}</span></td>
                  <td>{auditLog.entity}</td>
                  <td>{auditLog.entityId || '-'}</td>
                  <td>{auditLog.ipAddress || '-'}</td>
                  <td className="text-right">
                    <button className={mutedButtonClass} type="button" onClick={() => getAuditLogDetails(auditLog._id)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAuditLog && (
        <div className={panelClass}>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <h2 className={sectionTitleClass}>Audit Log Details</h2>
            <button className={mutedButtonClass} type="button" onClick={() => setSelectedAuditLog(null)}>Close</button>
          </div>

          <div className="row">
            <div className="col-md-3 mb-3">
              <strong>Time</strong>
              <div>{formatDate(selectedAuditLog.createdAt)}</div>
            </div>
            <div className="col-md-3 mb-3">
              <strong>User</strong>
              <div>{userName(selectedAuditLog.userId)}</div>
            </div>
            <div className="col-md-3 mb-3">
              <strong>Action</strong>
              <div>{selectedAuditLog.action}</div>
            </div>
            <div className="col-md-3 mb-3">
              <strong>Entity</strong>
              <div>{selectedAuditLog.entity}</div>
            </div>
            <div className="col-md-6 mb-3">
              <strong>Entity ID</strong>
              <div>{selectedAuditLog.entityId || '-'}</div>
            </div>
            <div className="col-md-3 mb-3">
              <strong>IP Address</strong>
              <div>{selectedAuditLog.ipAddress || '-'}</div>
            </div>
            <div className="col-md-3 mb-3">
              <strong>User Agent</strong>
              <div className="break-words">{selectedAuditLog.userAgent || '-'}</div>
            </div>
          </div>

          <h3 className="mb-3 font-bold text-[#31b372]">Metadata</h3>
          <pre className="rounded border border-[#e0e0e0] bg-[#f8faf9] p-3 text-sm text-[#333]">
            {formatMetadata(selectedAuditLog.metadata)}
          </pre>
        </div>
      )}
    </Box>
  );
}
