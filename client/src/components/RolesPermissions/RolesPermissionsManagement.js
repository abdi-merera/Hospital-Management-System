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
const badgeClass = "mr-2 mb-2 inline-block rounded bg-[#e9f8ef] px-2 py-1 text-xs font-bold text-[#155734]";

function authHeaders() {
  return {
    authorization: `Bearer ${localStorage.getItem('token')}`,
  };
}

function userName(user) {
  if (!user) return 'Unknown user';
  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown user';
}

function permissionCodes(role) {
  return (role?.permissions || []).map((permission) => (
    typeof permission === 'string' ? permission : permission.code
  )).filter(Boolean);
}

export default function RolesPermissionsManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedRolePermissions, setSelectedRolePermissions] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserRoles, setSelectedUserRoles] = useState([]);
  const [effectivePermissions, setEffectivePermissions] = useState([]);
  const [roleForm, setRoleForm] = useState({ name: '', description: '' });
  const [permissionForm, setPermissionForm] = useState({ code: '', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const getUsers = async () => {
    const response = await axios.get('http://localhost:3001/users', { headers: authHeaders() });
    setUsers(response.data || []);
  };

  const getRoles = async () => {
    const response = await axios.get('http://localhost:3001/roles', { headers: authHeaders() });
    setRoles(response.data.roles || []);
  };

  const getPermissions = async () => {
    const response = await axios.get('http://localhost:3001/permissions', { headers: authHeaders() });
    setPermissions(response.data.permissions || []);
  };

  const loadRbacData = async () => {
    setLoading(true);
    setError('');

    try {
      await Promise.all([getUsers(), getRoles(), getPermissions()]);
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not load roles and permissions');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadRbacData();
    // Run once on mount; changes refresh the relevant lists explicitly.
  }, []);

  const handleRoleFormChange = (event) => {
    setRoleForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handlePermissionFormChange = (event) => {
    setPermissionForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSelectedRoleChange = (event) => {
    const roleId = event.target.value;
    const role = roles.find((item) => item._id === roleId);

    setSelectedRoleId(roleId);
    setSelectedRolePermissions(permissionCodes(role));
    setSuccess('');
  };

  const handlePermissionToggle = (permissionCode) => {
    setSelectedRolePermissions((current) => (
      current.includes(permissionCode)
        ? current.filter((code) => code !== permissionCode)
        : [...current, permissionCode]
    ));
  };

  const handleSelectedUserChange = async (event) => {
    const userId = event.target.value;
    const user = users.find((item) => item._id === userId);

    setSelectedUserId(userId);
    setSelectedUserRoles((user?.roles || []).map((role) => (typeof role === 'string' ? role : role._id)));
    setEffectivePermissions([]);
    setSuccess('');

    if (userId) {
      await getEffectivePermissions(userId);
    }
  };

  const handleUserRoleToggle = (roleId) => {
    setSelectedUserRoles((current) => (
      current.includes(roleId)
        ? current.filter((id) => id !== roleId)
        : [...current, roleId]
    ));
  };

  const getEffectivePermissions = async (userId = selectedUserId) => {
    if (!userId) return;

    try {
      const response = await axios.get(`http://localhost:3001/users/${userId}/permissions`, {
        headers: authHeaders(),
      });
      setEffectivePermissions(response.data.permissions || []);
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not load effective permissions');
    }
  };

  const handleSeedDefaults = async () => {
    setError('');
    setSuccess('');

    try {
      await axios.post('http://localhost:3001/roles-permissions/seed', {}, { headers: authHeaders() });
      await loadRbacData();
      setSuccess('Default roles and permissions refreshed.');
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not refresh default roles and permissions');
    }
  };

  const handleCreateRole = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post('http://localhost:3001/roles', roleForm, { headers: authHeaders() });
      setRoleForm({ name: '', description: '' });
      await getRoles();
      setSuccess('Role created.');
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not create role');
    }
  };

  const handleCreatePermission = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post('http://localhost:3001/permissions', permissionForm, { headers: authHeaders() });
      setPermissionForm({ code: '', description: '' });
      await getPermissions();
      setSuccess('Permission created.');
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not create permission');
    }
  };

  const handleSaveRolePermissions = async () => {
    if (!selectedRoleId) return;
    setError('');
    setSuccess('');

    try {
      await axios.put(`http://localhost:3001/roles/${selectedRoleId}/permissions`, {
        permissions: selectedRolePermissions,
      }, {
        headers: authHeaders(),
      });
      await getRoles();
      setSuccess('Role permissions updated.');
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not update role permissions');
    }
  };

  const handleSaveUserRoles = async () => {
    if (!selectedUserId) return;
    setError('');
    setSuccess('');

    try {
      await axios.put(`http://localhost:3001/users/${selectedUserId}/roles`, {
        roles: selectedUserRoles,
      }, {
        headers: authHeaders(),
      });
      await getUsers();
      await getEffectivePermissions(selectedUserId);
      setSuccess('User roles updated.');
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not update user roles');
    }
  };

  return (
    <Box className={pageClass} component="main" sx={{ flexGrow: 1 }}>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h1 className={pageTitleClass}>Roles & Permissions</h1>
        <button className={mutedButtonClass} type="button" onClick={handleSeedDefaults}>Refresh Defaults</button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      <div className="row">
        <div className="col-lg-6">
          <div className={panelClass}>
            <h2 className={sectionTitleClass}>Create Role</h2>
            <form onSubmit={handleCreateRole}>
              <div className="mb-3">
                <label className={labelClass} htmlFor="roleName">Role Name</label>
                <input id="roleName" name="name" className={inputClass} value={roleForm.name} onChange={handleRoleFormChange} required />
              </div>
              <div className="mb-3">
                <label className={labelClass} htmlFor="roleDescription">Description</label>
                <input id="roleDescription" name="description" className={inputClass} value={roleForm.description} onChange={handleRoleFormChange} />
              </div>
              <button className={primaryButtonClass} type="submit">Create Role</button>
            </form>
          </div>
        </div>

        <div className="col-lg-6">
          <div className={panelClass}>
            <h2 className={sectionTitleClass}>Create Permission</h2>
            <form onSubmit={handleCreatePermission}>
              <div className="mb-3">
                <label className={labelClass} htmlFor="permissionCode">Permission Code</label>
                <input id="permissionCode" name="code" className={inputClass} value={permissionForm.code} onChange={handlePermissionFormChange} placeholder="view_reports" required />
              </div>
              <div className="mb-3">
                <label className={labelClass} htmlFor="permissionDescription">Description</label>
                <input id="permissionDescription" name="description" className={inputClass} value={permissionForm.description} onChange={handlePermissionFormChange} />
              </div>
              <button className={primaryButtonClass} type="submit">Create Permission</button>
            </form>
          </div>
        </div>
      </div>

      <div className={panelClass}>
        <h2 className={sectionTitleClass}>Role Permissions</h2>
        <div className="row">
          <div className="col-md-4 mb-3">
            <label className={labelClass} htmlFor="selectedRole">Role</label>
            <select id="selectedRole" className={selectClass} value={selectedRoleId} onChange={handleSelectedRoleChange}>
              <option value="">Choose Role</option>
              {roles.map((role) => (
                <option key={role._id} value={role._id}>{role.name}</option>
              ))}
            </select>
            {selectedRoleId && (
              <p className={`${smallMutedTextClass} mt-2`}>
                {roles.find((role) => role._id === selectedRoleId)?.description || 'No description'}
              </p>
            )}
          </div>
          <div className="col-md-8 mb-3">
            <label className={labelClass}>Permissions</label>
            {!selectedRoleId && <p className={smallMutedTextClass}>Choose a role to edit its permissions.</p>}
            {selectedRoleId && (
              <div className="row">
                {permissions.map((permission) => (
                  <div className="col-md-4 mb-2" key={permission._id}>
                    <label className="d-flex align-items-start gap-2 text-sm text-[#333]">
                      <input
                        type="checkbox"
                        checked={selectedRolePermissions.includes(permission.code)}
                        onChange={() => handlePermissionToggle(permission.code)}
                      />
                      <span>
                        <strong>{permission.code}</strong>
                        <br />
                        <span className={smallMutedTextClass}>{permission.description || '-'}</span>
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <button className={primaryButtonClass} type="button" onClick={handleSaveRolePermissions} disabled={!selectedRoleId}>
          Save Role Permissions
        </button>
      </div>

      <div className={panelClass}>
        <h2 className={sectionTitleClass}>Assign Roles to User</h2>
        <div className="row">
          <div className="col-md-4 mb-3">
            <label className={labelClass} htmlFor="selectedUser">User</label>
            <select id="selectedUser" className={selectClass} value={selectedUserId} onChange={handleSelectedUserChange}>
              <option value="">Choose User</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {userName(user)} - {user.userType}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-8 mb-3">
            <label className={labelClass}>Roles</label>
            {!selectedUserId && <p className={smallMutedTextClass}>Choose a user to assign roles.</p>}
            {selectedUserId && (
              <div className="row">
                {roles.map((role) => (
                  <div className="col-md-4 mb-2" key={role._id}>
                    <label className="d-flex align-items-start gap-2 text-sm text-[#333]">
                      <input
                        type="checkbox"
                        checked={selectedUserRoles.includes(role._id)}
                        onChange={() => handleUserRoleToggle(role._id)}
                      />
                      <span>
                        <strong>{role.name}</strong>
                        <br />
                        <span className={smallMutedTextClass}>{role.description || '-'}</span>
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <button className={primaryButtonClass} type="button" onClick={handleSaveUserRoles} disabled={!selectedUserId}>
          Save User Roles
        </button>
      </div>

      <div className={panelClass}>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h2 className={sectionTitleClass}>Effective Permissions</h2>
          <button className={mutedButtonClass} type="button" onClick={() => getEffectivePermissions()} disabled={!selectedUserId}>
            Refresh
          </button>
        </div>
        {!selectedUserId && <p className={smallMutedTextClass}>Choose a user to inspect their effective permissions.</p>}
        {selectedUserId && effectivePermissions.length === 0 && <p className={smallMutedTextClass}>No permissions found for this user.</p>}
        {effectivePermissions.map((permission) => (
          <span key={permission} className={badgeClass}>{permission}</span>
        ))}
      </div>

      <div className={panelClass}>
        <h2 className={sectionTitleClass}>Roles</h2>
        {loading && <p>Loading roles and permissions...</p>}
        {!loading && (
          <div className="table-responsive">
            <table className="table table-striped custom-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Description</th>
                  <th>System Role</th>
                  <th>Permissions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role._id}>
                    <td>{role.name}</td>
                    <td>{role.description || '-'}</td>
                    <td>{role.systemRole ? 'Yes' : 'No'}</td>
                    <td>{permissionCodes(role).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Box>
  );
}
