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
const bedStatusClass = {
  AVAILABLE: `${badgeBaseClass} bg-[#e9f8ef] text-[#155734]`,
  OCCUPIED: `${badgeBaseClass} bg-[#fff4de] text-[#8a5a00]`,
  RESERVED: `${badgeBaseClass} bg-[#e8edf1] text-[#334155]`,
  MAINTENANCE: `${badgeBaseClass} bg-[#f9e8e8] text-[#8a1f1f]`,
};

function authHeaders() {
  return {
    authorization: `Bearer ${localStorage.getItem('token')}`,
  };
}

function wardName(ward) {
  return ward?.name || 'Unknown ward';
}

function roomLabel(room) {
  if (!room) return 'Unknown room';
  return `${wardName(room.wardId)} / Room ${room.roomNo}`;
}

function bedLabel(bed) {
  if (!bed) return 'Unknown bed';
  return `${roomLabel(bed.roomId)} / Bed ${bed.bedNo}`;
}

export default function WardManagement() {
  const [wards, setWards] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [wardForm, setWardForm] = useState({ name: '', description: '' });
  const [roomForm, setRoomForm] = useState({ wardId: '', roomNo: '', description: '' });
  const [bedForm, setBedForm] = useState({ roomId: '', bedNo: '', status: 'AVAILABLE', description: '' });
  const [filters, setFilters] = useState({ status: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getWards = async () => {
    const response = await axios.get('http://localhost:3001/wards', { headers: authHeaders() });
    setWards(response.data.wards || []);
  };

  const getRooms = async () => {
    const response = await axios.get('http://localhost:3001/rooms', { headers: authHeaders() });
    setRooms(response.data.rooms || []);
  };

  const getBeds = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get('http://localhost:3001/beds', {
        headers: authHeaders(),
        params: { status: filters.status || undefined },
      });
      setBeds(response.data.beds || []);
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not load beds');
    } finally {
      setLoading(false);
    }
  };

  const loadWardSetup = async () => {
    setError('');

    try {
      await Promise.all([getWards(), getRooms(), getBeds()]);
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not load ward setup');
    }
  };

  useEffect(() => {
    loadWardSetup();
    // Run once on mount; searches are triggered explicitly by the Filter button.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleWardChange = (event) => {
    setWardForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleRoomChange = (event) => {
    setRoomForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleBedChange = (event) => {
    setBedForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleFilterChange = (event) => {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleCreateWard = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await axios.post('http://localhost:3001/wards', wardForm, { headers: authHeaders() });
      setWardForm({ name: '', description: '' });
      await getWards();
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not create ward');
    }
  };

  const handleCreateRoom = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await axios.post('http://localhost:3001/rooms', roomForm, { headers: authHeaders() });
      setRoomForm({ wardId: '', roomNo: '', description: '' });
      await getRooms();
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not create room');
    }
  };

  const handleCreateBed = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await axios.post('http://localhost:3001/beds', bedForm, { headers: authHeaders() });
      setBedForm({ roomId: '', bedNo: '', status: 'AVAILABLE', description: '' });
      await getBeds();
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not create bed');
    }
  };

  const handleBedStatusChange = async (bedId, status) => {
    setError('');

    try {
      await axios.patch(`http://localhost:3001/beds/${bedId}`, { status }, { headers: authHeaders() });
      await getBeds();
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not update bed status');
    }
  };

  return (
    <Box className={pageClass} component="main" sx={{ flexGrow: 1 }}>
      <h1 className={pageTitleClass}>Ward Setup</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row">
        <div className="col-lg-4">
          <div className={panelClass}>
            <h2 className={sectionTitleClass}>Create Ward</h2>
            <form onSubmit={handleCreateWard}>
              <div className="mb-3">
                <label className={labelClass} htmlFor="wardName">Ward Name</label>
                <input id="wardName" name="name" className={inputClass} value={wardForm.name} onChange={handleWardChange} required />
              </div>
              <div className="mb-3">
                <label className={labelClass} htmlFor="wardDescription">Description</label>
                <input id="wardDescription" name="description" className={inputClass} value={wardForm.description} onChange={handleWardChange} />
              </div>
              <button className={primaryButtonClass} type="submit">Create Ward</button>
            </form>
          </div>
        </div>

        <div className="col-lg-4">
          <div className={panelClass}>
            <h2 className={sectionTitleClass}>Create Room</h2>
            <form onSubmit={handleCreateRoom}>
              <div className="mb-3">
                <label className={labelClass} htmlFor="roomWardId">Ward</label>
                <select id="roomWardId" name="wardId" className={selectClass} value={roomForm.wardId} onChange={handleRoomChange} required>
                  <option value="">Choose Ward</option>
                  {wards.map((ward) => (
                    <option key={ward._id} value={ward._id}>{ward.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className={labelClass} htmlFor="roomNo">Room Number</label>
                <input id="roomNo" name="roomNo" className={inputClass} value={roomForm.roomNo} onChange={handleRoomChange} required />
              </div>
              <div className="mb-3">
                <label className={labelClass} htmlFor="roomDescription">Description</label>
                <input id="roomDescription" name="description" className={inputClass} value={roomForm.description} onChange={handleRoomChange} />
              </div>
              <button className={primaryButtonClass} type="submit">Create Room</button>
            </form>
          </div>
        </div>

        <div className="col-lg-4">
          <div className={panelClass}>
            <h2 className={sectionTitleClass}>Create Bed</h2>
            <form onSubmit={handleCreateBed}>
              <div className="mb-3">
                <label className={labelClass} htmlFor="bedRoomId">Room</label>
                <select id="bedRoomId" name="roomId" className={selectClass} value={bedForm.roomId} onChange={handleBedChange} required>
                  <option value="">Choose Room</option>
                  {rooms.map((room) => (
                    <option key={room._id} value={room._id}>{roomLabel(room)}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className={labelClass} htmlFor="bedNo">Bed Number</label>
                <input id="bedNo" name="bedNo" className={inputClass} value={bedForm.bedNo} onChange={handleBedChange} required />
              </div>
              <div className="mb-3">
                <label className={labelClass} htmlFor="bedStatus">Status</label>
                <select id="bedStatus" name="status" className={selectClass} value={bedForm.status} onChange={handleBedChange}>
                  <option value="AVAILABLE">Available</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>
              <div className="mb-3">
                <label className={labelClass} htmlFor="bedDescription">Description</label>
                <input id="bedDescription" name="description" className={inputClass} value={bedForm.description} onChange={handleBedChange} />
              </div>
              <button className={primaryButtonClass} type="submit">Create Bed</button>
            </form>
          </div>
        </div>
      </div>

      <div className={panelClass}>
        <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">
          <div>
            <h2 className={sectionTitleClass}>Beds</h2>
            <p className={smallMutedTextClass}>Available beds can be assigned from the Encounters admission workflow.</p>
          </div>
          <div className="d-flex align-items-end gap-2">
            <div>
              <label className={labelClass} htmlFor="filterStatus">Status</label>
              <select id="filterStatus" name="status" className={selectClass} value={filters.status} onChange={handleFilterChange}>
                <option value="">All</option>
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="RESERVED">Reserved</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
            <button className={mutedButtonClass} type="button" onClick={getBeds}>Filter</button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-striped custom-table">
            <thead>
              <tr>
                <th>Bed</th>
                <th>Status</th>
                <th>Description</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="4">Loading beds...</td>
                </tr>
              )}
              {!loading && beds.length === 0 && (
                <tr>
                  <td colSpan="4">No beds found.</td>
                </tr>
              )}
              {!loading && beds.map((bed) => (
                <tr key={bed._id}>
                  <td>{bedLabel(bed)}</td>
                  <td><span className={bedStatusClass[bed.status] || badgeBaseClass}>{bed.status}</span></td>
                  <td>{bed.description || '-'}</td>
                  <td>
                    <select className={selectClass} value={bed.status} onChange={(event) => handleBedStatusChange(bed._id, event.target.value)}>
                      <option value="AVAILABLE">Available</option>
                      <option value="OCCUPIED">Occupied</option>
                      <option value="RESERVED">Reserved</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={panelClass}>
        <h2 className={sectionTitleClass}>Wards and Rooms</h2>
        <div className="row">
          <div className="col-md-6 mb-3">
            <h4 className="mb-3 font-bold text-[#31b372]">Wards</h4>
            {wards.length === 0 && <p className={smallMutedTextClass}>No wards yet.</p>}
            {wards.length > 0 && (
              <table className="table table-striped custom-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {wards.map((ward) => (
                    <tr key={ward._id}>
                      <td>{ward.name}</td>
                      <td>{ward.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="col-md-6 mb-3">
            <h4 className="mb-3 font-bold text-[#31b372]">Rooms</h4>
            {rooms.length === 0 && <p className={smallMutedTextClass}>No rooms yet.</p>}
            {rooms.length > 0 && (
              <table className="table table-striped custom-table">
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room._id}>
                      <td>{roomLabel(room)}</td>
                      <td>{room.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Box>
  );
}
