import React, { useContext, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import axios from 'axios';
import { UserContext } from '../../Context/UserContext';

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
  PENDING_PAYMENT: `${badgeBaseClass} bg-[#fff7df] text-[#8a5a00]`,
  WAITING_TRIAGE: `${badgeBaseClass} bg-[#e9f8ef] text-[#155734]`,
  IN_TRIAGE: `${badgeBaseClass} bg-[#e0f2fe] text-[#075985]`,
  READY_FOR_DOCTOR: `${badgeBaseClass} bg-[#edf7ff] text-[#155e75]`,
  IN_CONSULTATION: `${badgeBaseClass} bg-[#f0e9ff] text-[#5b21b6]`,
  OPEN: `${badgeBaseClass} bg-[#e9f8ef] text-[#155734]`,
  CLOSED: `${badgeBaseClass} bg-[#e8edf1] text-[#334155]`,
  CANCELLED: `${badgeBaseClass} bg-[#f9e8e8] text-[#8a1f1f]`,
};

const statusLabel = {
  PENDING_PAYMENT: 'Pending Payment',
  WAITING_TRIAGE: 'Waiting Triage',
  IN_TRIAGE: 'In Triage',
  READY_FOR_DOCTOR: 'Ready for Doctor',
  IN_CONSULTATION: 'In Consultation',
  OPEN: 'Open',
  CLOSED: 'Closed',
  CANCELLED: 'Cancelled',
};
const paymentExceptionClass = `${badgeBaseClass} bg-[#fff7df] text-[#8a5a00]`;

function authHeaders() {
  return {
    authorization: `Bearer ${localStorage.getItem('token')}`,
  };
}

function patientName(patient) {
  if (!patient?.userId) return 'Unknown patient';
  return `${patient.userId.firstName || ''} ${patient.userId.lastName || ''}`.trim();
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

function formatStatus(status) {
  return statusLabel[status] || status;
}

function bedLabel(bed) {
  if (!bed) return 'Unknown bed';
  const room = bed.roomId;
  const ward = room?.wardId;
  const parts = [];

  if (ward?.name) parts.push(ward.name);
  if (room?.roomNo) parts.push(`Room ${room.roomNo}`);
  if (bed.bedNo) parts.push(`Bed ${bed.bedNo}`);

  return parts.length > 0 ? parts.join(' / ') : bed.bedNo || 'Unknown bed';
}

export default function EncounterList() {
  const { currentUser } = useContext(UserContext);
  const permissions = currentUser?.permissions || [];
  const roles = (currentUser?.roles || []).map((role) => (typeof role === 'string' ? role : role.name));
  const hasRole = (roleName) => roles.includes(roleName);
  const isNurse = currentUser?.userType === 'Staff' && hasRole('Nurse');
  const isDoctor = currentUser?.userType === 'Staff' && hasRole('Doctor');
  const isReceptionist = currentUser?.userType === 'Staff' && hasRole('Receptionist');
  const canCreateEncounter = permissions.includes('create_encounter');
  const canCreateTriage = permissions.includes('create_triage');
  const canViewTriage = permissions.includes('view_triage') || canCreateTriage;
  const canCreateClinicalNote = permissions.includes('create_clinical_note');
  const canViewEmr = permissions.includes('view_emr') || canCreateClinicalNote;
  const canCreateDiagnosis = permissions.includes('create_diagnosis');
  const canCreateAdmission = permissions.includes('create_admission');
  const canViewAdmission = permissions.includes('view_admission') || canCreateAdmission;
  const canAssignBed = permissions.includes('assign_bed');
  const canDischargeAdmission = permissions.includes('discharge_admission');
  const canCloseEncounter = permissions.includes('close_encounter');
  const queueTitle = isNurse
    ? 'Nurse Triage Queue'
    : isDoctor
      ? 'Doctor Consultation Queue'
      : isReceptionist
        ? 'Reception Intake Queue'
        : 'Encounters';
  const queueDescription = isNurse
    ? 'Patients shown here are paid or manually allowed and waiting for triage.'
    : isDoctor
      ? 'Patients shown here have completed triage and are ready for consultation.'
      : isReceptionist
        ? 'Use this page to create walk-in or appointment encounters and monitor payment/check-in status.'
        : 'Create, find, and manage encounters.';
  const statusOptions = isNurse
    ? [
      ['WAITING_TRIAGE', 'Waiting Triage'],
      ['IN_TRIAGE', 'In Triage'],
    ]
    : isDoctor
      ? [
        ['READY_FOR_DOCTOR', 'Ready for Doctor'],
        ['IN_CONSULTATION', 'In Consultation'],
        ['OPEN', 'Open'],
      ]
      : [
        ['PENDING_PAYMENT', 'Pending Payment'],
        ['WAITING_TRIAGE', 'Waiting Triage'],
        ['IN_TRIAGE', 'In Triage'],
        ['READY_FOR_DOCTOR', 'Ready for Doctor'],
        ['IN_CONSULTATION', 'In Consultation'],
        ['OPEN', 'Open'],
        ['CLOSED', 'Closed'],
        ['CANCELLED', 'Cancelled'],
      ];
  const [patients, setPatients] = useState([]);
  const [encounters, setEncounters] = useState([]);
  const [selectedEncounter, setSelectedEncounter] = useState(null);
  const [triageRecords, setTriageRecords] = useState([]);
  const [clinicalNotes, setClinicalNotes] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [bedAssignmentsByAdmissionId, setBedAssignmentsByAdmissionId] = useState({});
  const [triageForm, setTriageForm] = useState({
    temperature: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    pulse: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    weight: '',
    height: '',
    painScore: '',
    notes: '',
  });
  const [clinicalNoteForm, setClinicalNoteForm] = useState({
    noteType: 'SOAP',
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    notes: '',
  });
  const [diagnosisForm, setDiagnosisForm] = useState({
    code: '',
    description: '',
    diagnosisType: 'PRIMARY',
    status: 'ACTIVE',
  });
  const [admissionForm, setAdmissionForm] = useState({
    reason: '',
  });
  const [bedAssignmentFormByAdmissionId, setBedAssignmentFormByAdmissionId] = useState({});
  const [dischargeSummaryByAdmissionId, setDischargeSummaryByAdmissionId] = useState({});
  const [filters, setFilters] = useState({
    patientId: '',
    type: '',
    status: '',
  });
  const [form, setForm] = useState({
    patientId: '',
    type: 'OUTPATIENT',
    reason: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getPatients = async () => {
    const response = await axios.get('http://localhost:3001/patients', {
      headers: authHeaders(),
    });
    setPatients(response.data);
  };

  const getEncounters = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get('http://localhost:3001/encounters', {
        headers: authHeaders(),
        params: {
          patientId: filters.patientId || undefined,
          type: filters.type || undefined,
          status: filters.status || undefined,
        },
      });
      setEncounters(response.data.encounters || []);
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not load encounters');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    getPatients().catch((requestError) => {
      setError(requestError.response?.data?.errors?.[0] || 'Could not load patients');
    });
  }, []);

  useEffect(() => {
    getEncounters();
    // Run once on mount; encounter searches are triggered explicitly by the Search button.
  }, []);

  const handleFilterChange = (event) => {
    setFilters((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleFormChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleTriageChange = (event) => {
    setTriageForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleClinicalNoteChange = (event) => {
    setClinicalNoteForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleDiagnosisChange = (event) => {
    setDiagnosisForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleAdmissionChange = (event) => {
    setAdmissionForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleBedAssignmentChange = (admissionId, bedId) => {
    setBedAssignmentFormByAdmissionId((current) => ({
      ...current,
      [admissionId]: bedId,
    }));
  };

  const handleDischargeSummaryChange = (admissionId, value) => {
    setDischargeSummaryByAdmissionId((current) => ({
      ...current,
      [admissionId]: value,
    }));
  };

  const getTriageRecords = async (encounterId) => {
    if (!encounterId) return;

    try {
      const response = await axios.get(`http://localhost:3001/encounters/${encounterId}/triage`, {
        headers: authHeaders(),
      });
      setTriageRecords(response.data.triageRecords || []);
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not load triage records');
    }
  };

  const getClinicalNotes = async (encounterId) => {
    if (!encounterId) return;

    try {
      const response = await axios.get('http://localhost:3001/clinical-notes', {
        headers: authHeaders(),
        params: { encounterId },
      });
      setClinicalNotes(response.data.clinicalNotes || []);
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not load clinical notes');
    }
  };

  const getDiagnoses = async (encounterId) => {
    if (!encounterId) return;

    try {
      const response = await axios.get('http://localhost:3001/diagnoses', {
        headers: authHeaders(),
        params: { encounterId },
      });
      setDiagnoses(response.data.diagnoses || []);
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not load diagnoses');
    }
  };

  const getAdmissions = async (encounterId) => {
    if (!encounterId) return;

    try {
      const response = await axios.get('http://localhost:3001/admissions', {
        headers: authHeaders(),
        params: { encounterId },
      });
      const loadedAdmissions = response.data.admissions || [];
      setAdmissions(loadedAdmissions);
      await getBedAssignmentsForAdmissions(loadedAdmissions);
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not load admissions');
    }
  };

  const getAvailableBeds = async () => {
    try {
      const response = await axios.get('http://localhost:3001/beds', {
        headers: authHeaders(),
        params: { status: 'AVAILABLE' },
      });
      setAvailableBeds(response.data.beds || []);
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not load available beds');
    }
  };

  const getBedAssignmentsForAdmissions = async (loadedAdmissions) => {
    const assignmentGroups = {};

    await Promise.all(
      loadedAdmissions.map(async (admission) => {
        try {
          const response = await axios.get('http://localhost:3001/bed-assignments', {
            headers: authHeaders(),
            params: { admissionId: admission._id },
          });
          assignmentGroups[admission._id] = response.data.bedAssignments || [];
        } catch (requestError) {
          assignmentGroups[admission._id] = [];
          setError(requestError.response?.data?.errors?.[0] || 'Could not load bed assignments');
        }
      }),
    );

    setBedAssignmentsByAdmissionId(assignmentGroups);
  };

  const selectEncounter = async (encounter) => {
    setSelectedEncounter(encounter);
    setTriageRecords([]);
    setClinicalNotes([]);
    setDiagnoses([]);
    setAdmissions([]);
    setAvailableBeds([]);
    setBedAssignmentsByAdmissionId({});
    setTriageForm({
      temperature: '',
      bloodPressureSystolic: '',
      bloodPressureDiastolic: '',
      pulse: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      weight: '',
      height: '',
      painScore: '',
      notes: '',
    });
    setClinicalNoteForm({
      noteType: 'SOAP',
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
      notes: '',
    });
    setDiagnosisForm({
      code: '',
      description: '',
      diagnosisType: 'PRIMARY',
      status: 'ACTIVE',
    });
    setAdmissionForm({ reason: '' });
    setBedAssignmentFormByAdmissionId({});
    setDischargeSummaryByAdmissionId({});
    await Promise.all([
      canViewTriage ? getTriageRecords(encounter._id) : Promise.resolve(),
      canViewEmr ? getClinicalNotes(encounter._id) : Promise.resolve(),
      canViewEmr ? getDiagnoses(encounter._id) : Promise.resolve(),
      canViewAdmission ? getAdmissions(encounter._id) : Promise.resolve(),
      canAssignBed ? getAvailableBeds() : Promise.resolve(),
    ]);
  };

  const triagePayload = () => {
    const payload = {
      encounterId: selectedEncounter?._id,
      temperature: triageForm.temperature ? Number(triageForm.temperature) : undefined,
      bloodPressureSystolic: triageForm.bloodPressureSystolic ? Number(triageForm.bloodPressureSystolic) : undefined,
      bloodPressureDiastolic: triageForm.bloodPressureDiastolic ? Number(triageForm.bloodPressureDiastolic) : undefined,
      pulse: triageForm.pulse ? Number(triageForm.pulse) : undefined,
      respiratoryRate: triageForm.respiratoryRate ? Number(triageForm.respiratoryRate) : undefined,
      oxygenSaturation: triageForm.oxygenSaturation ? Number(triageForm.oxygenSaturation) : undefined,
      weight: triageForm.weight ? Number(triageForm.weight) : undefined,
      height: triageForm.height ? Number(triageForm.height) : undefined,
      painScore: triageForm.painScore ? Number(triageForm.painScore) : undefined,
      notes: triageForm.notes,
    };

    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);
    return payload;
  };

  const handleCreateTriage = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await axios.post('http://localhost:3001/triage-records', triagePayload(), {
        headers: authHeaders(),
      });
      setTriageForm({
        temperature: '',
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        pulse: '',
        respiratoryRate: '',
        oxygenSaturation: '',
        weight: '',
        height: '',
        painScore: '',
        notes: '',
      });
      await getTriageRecords(selectedEncounter._id);
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not create triage record');
    }
  };

  const handleCreateClinicalNote = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await axios.post('http://localhost:3001/clinical-notes', {
        encounterId: selectedEncounter?._id,
        ...clinicalNoteForm,
      }, {
        headers: authHeaders(),
      });
      setClinicalNoteForm({
        noteType: 'SOAP',
        subjective: '',
        objective: '',
        assessment: '',
        plan: '',
        notes: '',
      });
      await getClinicalNotes(selectedEncounter._id);
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not create clinical note');
    }
  };

  const handleCreateDiagnosis = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await axios.post('http://localhost:3001/diagnoses', {
        encounterId: selectedEncounter?._id,
        ...diagnosisForm,
      }, {
        headers: authHeaders(),
      });
      setDiagnosisForm({
        code: '',
        description: '',
        diagnosisType: 'PRIMARY',
        status: 'ACTIVE',
      });
      await getDiagnoses(selectedEncounter._id);
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not create diagnosis');
    }
  };

  const handleCreateAdmission = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await axios.post('http://localhost:3001/admissions', {
        encounterId: selectedEncounter?._id,
        reason: admissionForm.reason,
      }, {
        headers: authHeaders(),
      });
      setAdmissionForm({ reason: '' });
      await getAdmissions(selectedEncounter._id);
      await getAvailableBeds();
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not create admission');
    }
  };

  const handleAssignBed = async (admissionId) => {
    setError('');
    const bedId = bedAssignmentFormByAdmissionId[admissionId];

    if (!bedId) {
      setError('Please choose an available bed');
      return;
    }

    try {
      await axios.post('http://localhost:3001/bed-assignments', {
        admissionId,
        bedId,
      }, {
        headers: authHeaders(),
      });
      setBedAssignmentFormByAdmissionId((current) => ({
        ...current,
        [admissionId]: '',
      }));
      await getAdmissions(selectedEncounter._id);
      await getAvailableBeds();
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not assign bed');
    }
  };

  const handleEndBedAssignment = async (assignmentId) => {
    setError('');

    try {
      await axios.patch(`http://localhost:3001/bed-assignments/${assignmentId}/end`, {}, {
        headers: authHeaders(),
      });
      await getAdmissions(selectedEncounter._id);
      await getAvailableBeds();
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not end bed assignment');
    }
  };

  const handleDischargeAdmission = async (admissionId) => {
    setError('');

    try {
      await axios.patch(`http://localhost:3001/admissions/${admissionId}/discharge`, {
        dischargeSummary: dischargeSummaryByAdmissionId[admissionId] || '',
      }, {
        headers: authHeaders(),
      });
      setDischargeSummaryByAdmissionId((current) => ({
        ...current,
        [admissionId]: '',
      }));
      await getAdmissions(selectedEncounter._id);
      await getAvailableBeds();
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not discharge admission');
    }
  };

  const handleCreateEncounter = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await axios.post('http://localhost:3001/encounters', form, {
        headers: authHeaders(),
      });
      setForm({ patientId: '', type: 'OUTPATIENT', reason: '' });
      await getEncounters();
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not create encounter');
    }
  };

  const handleCloseEncounter = async (encounterId) => {
    setError('');

    try {
      const response = await axios.patch(`http://localhost:3001/encounters/${encounterId}/close`, {}, {
        headers: authHeaders(),
      });
      setSelectedEncounter(response.data.encounter);
      await getEncounters();
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0] || 'Could not close encounter');
    }
  };

  return (
    <Box className={pageClass} component="main" sx={{ flexGrow: 1 }}>
      <h1 className={pageTitleClass}>Encounters</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {canCreateEncounter && (
        <div className={panelClass}>
          <h2 className={sectionTitleClass}>Create Encounter</h2>
          <form onSubmit={handleCreateEncounter}>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className={labelClass} htmlFor="patientId">Patient</label>
                <select id="patientId" name="patientId" className={selectClass} value={form.patientId} onChange={handleFormChange} required>
                  <option value="">Choose Patient</option>
                  {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.medicalRecordNo ? `${patient.medicalRecordNo} - ` : ''}{patientName(patient)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3 mb-3">
                <label className={labelClass} htmlFor="type">Type</label>
                <select id="type" name="type" className={selectClass} value={form.type} onChange={handleFormChange}>
                  <option value="OUTPATIENT">Outpatient</option>
                  <option value="EMERGENCY">Emergency</option>
                  <option value="FOLLOW_UP">Follow-up</option>
                </select>
              </div>
              <div className="col-md-5 mb-3">
                <label className={labelClass} htmlFor="reason">Reason</label>
                <input id="reason" name="reason" className={inputClass} value={form.reason} onChange={handleFormChange} placeholder="Reason for visit" />
              </div>
            </div>
            <button className={primaryButtonClass} type="submit">Create Encounter</button>
          </form>
        </div>
      )}

      <div className={panelClass}>
        <h2 className={sectionTitleClass}>{queueTitle}</h2>
        <p className={`${smallMutedTextClass} mb-4`}>{queueDescription}</p>
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
            <label className={labelClass} htmlFor="filterType">Type</label>
            <select id="filterType" name="type" className={selectClass} value={filters.type} onChange={handleFilterChange}>
              <option value="">All Types</option>
              <option value="OUTPATIENT">Outpatient</option>
              <option value="EMERGENCY">Emergency</option>
              <option value="FOLLOW_UP">Follow-up</option>
            </select>
          </div>
          <div className="col-md-3 mb-3">
            <label className={labelClass} htmlFor="filterStatus">Status</label>
            <select id="filterStatus" name="status" className={selectClass} value={filters.status} onChange={handleFilterChange}>
              <option value="">All Queue Statuses</option>
              {statusOptions.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2 mb-3">
            <button className={primaryButtonClass} type="button" onClick={getEncounters}>Search</button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-striped custom-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Type</th>
                <th>Status</th>
                <th>Payment Flag</th>
                <th>Started</th>
                <th>Reason</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="7">Loading encounters...</td>
                </tr>
              )}
              {!loading && encounters.length === 0 && (
                <tr>
                  <td colSpan="7">No encounters found.</td>
                </tr>
              )}
              {!loading && encounters.map((encounter) => (
                <tr key={encounter._id}>
                  <td>{patientName(encounter.patientId)}</td>
                  <td>{encounter.type}</td>
                  <td><span className={statusClass[encounter.status] || badgeBaseClass}>{formatStatus(encounter.status)}</span></td>
                  <td>{encounter.paymentException ? <span className={paymentExceptionClass}>! Payment Pending</span> : '-'}</td>
                  <td>{formatDate(encounter.startedAt)}</td>
                  <td>{encounter.reason || '-'}</td>
                  <td className="text-right">
                    <button className={mutedButtonClass} type="button" onClick={() => selectEncounter(encounter)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEncounter && (
        <div className={panelClass}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className={sectionTitleClass}>Encounter Details</h2>
            <button className={mutedButtonClass} type="button" onClick={() => setSelectedEncounter(null)}>Close</button>
          </div>
          <div className="row">
            <div className="col-md-4 mb-3">
              <strong>Patient</strong>
              <div>{patientName(selectedEncounter.patientId)}</div>
            </div>
            <div className="col-md-2 mb-3">
              <strong>Type</strong>
              <div>{selectedEncounter.type}</div>
            </div>
            <div className="col-md-2 mb-3">
              <strong>Status</strong>
              <div><span className={statusClass[selectedEncounter.status] || badgeBaseClass}>{formatStatus(selectedEncounter.status)}</span></div>
            </div>
            <div className="col-md-4 mb-3">
              <strong>Started</strong>
              <div>{formatDate(selectedEncounter.startedAt)}</div>
            </div>
            <div className="col-12 mb-3">
              <strong>Reason</strong>
              <div>{selectedEncounter.reason || '-'}</div>
            </div>
          </div>
          {selectedEncounter.paymentException && (
            <div className="alert alert-warning" role="alert">
              ! Payment has not been processed. Patient was manually allowed to continue for treatment.
              {selectedEncounter.paymentExceptionReason ? ` Reason: ${selectedEncounter.paymentExceptionReason}` : ''}
            </div>
          )}
          {canCloseEncounter && ['OPEN', 'IN_CONSULTATION'].includes(selectedEncounter.status) && (
            <button className={primaryButtonClass} type="button" onClick={() => handleCloseEncounter(selectedEncounter._id)}>
              Close Encounter
            </button>
          )}

          {(canViewTriage || canViewEmr || canViewAdmission) && <hr className="my-4" />}

          {canViewTriage && (
            <>
          <h3 className={sectionTitleClass}>Triage</h3>
          {canCreateTriage && <form onSubmit={handleCreateTriage}>
            <div className="row">
              <div className="col-md-3 mb-3">
                <label className={labelClass} htmlFor="temperature">Temperature</label>
                <input id="temperature" name="temperature" type="number" step="0.1" className={inputClass} value={triageForm.temperature} onChange={handleTriageChange} />
              </div>
              <div className="col-md-3 mb-3">
                <label className={labelClass} htmlFor="bloodPressureSystolic">BP Systolic</label>
                <input id="bloodPressureSystolic" name="bloodPressureSystolic" type="number" className={inputClass} value={triageForm.bloodPressureSystolic} onChange={handleTriageChange} />
              </div>
              <div className="col-md-3 mb-3">
                <label className={labelClass} htmlFor="bloodPressureDiastolic">BP Diastolic</label>
                <input id="bloodPressureDiastolic" name="bloodPressureDiastolic" type="number" className={inputClass} value={triageForm.bloodPressureDiastolic} onChange={handleTriageChange} />
              </div>
              <div className="col-md-3 mb-3">
                <label className={labelClass} htmlFor="pulse">Pulse</label>
                <input id="pulse" name="pulse" type="number" className={inputClass} value={triageForm.pulse} onChange={handleTriageChange} />
              </div>
              <div className="col-md-3 mb-3">
                <label className={labelClass} htmlFor="respiratoryRate">Resp. Rate</label>
                <input id="respiratoryRate" name="respiratoryRate" type="number" className={inputClass} value={triageForm.respiratoryRate} onChange={handleTriageChange} />
              </div>
              <div className="col-md-3 mb-3">
                <label className={labelClass} htmlFor="oxygenSaturation">Oxygen Sat.</label>
                <input id="oxygenSaturation" name="oxygenSaturation" type="number" min="0" max="100" className={inputClass} value={triageForm.oxygenSaturation} onChange={handleTriageChange} />
              </div>
              <div className="col-md-2 mb-3">
                <label className={labelClass} htmlFor="weight">Weight</label>
                <input id="weight" name="weight" type="number" step="0.1" className={inputClass} value={triageForm.weight} onChange={handleTriageChange} />
              </div>
              <div className="col-md-2 mb-3">
                <label className={labelClass} htmlFor="height">Height</label>
                <input id="height" name="height" type="number" step="0.1" className={inputClass} value={triageForm.height} onChange={handleTriageChange} />
              </div>
              <div className="col-md-2 mb-3">
                <label className={labelClass} htmlFor="painScore">Pain</label>
                <input id="painScore" name="painScore" type="number" min="0" max="10" className={inputClass} value={triageForm.painScore} onChange={handleTriageChange} />
              </div>
              <div className="col-md-6 mb-3">
                <label className={labelClass} htmlFor="notes">Notes</label>
                <input id="notes" name="notes" className={inputClass} value={triageForm.notes} onChange={handleTriageChange} />
              </div>
            </div>
            <button className={primaryButtonClass} type="submit">Add Triage Record</button>
          </form>}

          <div className="mt-4">
            <h4 className="mb-3 font-bold text-[#31b372]">Triage History</h4>
            {triageRecords.length === 0 && <p className={smallMutedTextClass}>No triage records for this encounter yet.</p>}
            {triageRecords.length > 0 && (
              <div className="table-responsive">
                <table className="table table-striped custom-table">
                  <thead>
                    <tr>
                      <th>Recorded</th>
                      <th>Temp</th>
                      <th>BP</th>
                      <th>Pulse</th>
                      <th>Resp.</th>
                      <th>O2</th>
                      <th>Pain</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {triageRecords.map((record) => (
                      <tr key={record._id}>
                        <td>{formatDate(record.recordedAt)}</td>
                        <td>{record.temperature ?? '-'}</td>
                        <td>{record.bloodPressureSystolic || record.bloodPressureDiastolic ? `${record.bloodPressureSystolic || '-'} / ${record.bloodPressureDiastolic || '-'}` : '-'}</td>
                        <td>{record.pulse ?? '-'}</td>
                        <td>{record.respiratoryRate ?? '-'}</td>
                        <td>{record.oxygenSaturation ?? '-'}</td>
                        <td>{record.painScore ?? '-'}</td>
                        <td>{record.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
            </>
          )}

          {canViewEmr && <hr className="my-4" />}

          {canViewEmr && (
            <>
          <h3 className={sectionTitleClass}>Doctor Consultation</h3>
          {canCreateClinicalNote && <form onSubmit={handleCreateClinicalNote}>
            <div className="row">
              <div className="col-md-3 mb-3">
                <label className={labelClass} htmlFor="noteType">Note Type</label>
                <select id="noteType" name="noteType" className={selectClass} value={clinicalNoteForm.noteType} onChange={handleClinicalNoteChange}>
                  <option value="SOAP">SOAP</option>
                  <option value="PROGRESS">Progress</option>
                  <option value="DISCHARGE">Discharge</option>
                  <option value="GENERAL">General</option>
                </select>
              </div>
              <div className="col-md-9 mb-3">
                <label className={labelClass} htmlFor="subjective">Subjective</label>
                <textarea id="subjective" name="subjective" className={inputClass} rows="2" value={clinicalNoteForm.subjective} onChange={handleClinicalNoteChange} placeholder="Patient symptoms and history" />
              </div>
              <div className="col-md-6 mb-3">
                <label className={labelClass} htmlFor="objective">Objective</label>
                <textarea id="objective" name="objective" className={inputClass} rows="3" value={clinicalNoteForm.objective} onChange={handleClinicalNoteChange} placeholder="Exam findings and observations" />
              </div>
              <div className="col-md-6 mb-3">
                <label className={labelClass} htmlFor="assessment">Assessment</label>
                <textarea id="assessment" name="assessment" className={inputClass} rows="3" value={clinicalNoteForm.assessment} onChange={handleClinicalNoteChange} placeholder="Clinical assessment" />
              </div>
              <div className="col-md-6 mb-3">
                <label className={labelClass} htmlFor="plan">Treatment Plan</label>
                <textarea id="plan" name="plan" className={inputClass} rows="3" value={clinicalNoteForm.plan} onChange={handleClinicalNoteChange} placeholder="Treatment plan, orders, follow-up" />
              </div>
              <div className="col-md-6 mb-3">
                <label className={labelClass} htmlFor="clinicalNotes">Additional Notes</label>
                <textarea id="clinicalNotes" name="notes" className={inputClass} rows="3" value={clinicalNoteForm.notes} onChange={handleClinicalNoteChange} />
              </div>
            </div>
            <button className={primaryButtonClass} type="submit">Save Clinical Note</button>
          </form>}

          <div className="mt-4">
            <h4 className="mb-3 font-bold text-[#31b372]">Clinical Notes</h4>
            {clinicalNotes.length === 0 && <p className={smallMutedTextClass}>No clinical notes for this encounter yet.</p>}
            {clinicalNotes.length > 0 && (
              <div className="table-responsive">
                <table className="table table-striped custom-table">
                  <thead>
                    <tr>
                      <th>Created</th>
                      <th>Type</th>
                      <th>Subjective</th>
                      <th>Assessment</th>
                      <th>Plan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clinicalNotes.map((note) => (
                      <tr key={note._id}>
                        <td>{formatDate(note.createdAt)}</td>
                        <td>{note.noteType}</td>
                        <td>{note.subjective || '-'}</td>
                        <td>{note.assessment || '-'}</td>
                        <td>{note.plan || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-4 rounded border border-[#e0e0e0] p-4">
            <h4 className="mb-3 font-bold text-[#31b372]">Diagnosis</h4>
            {canCreateDiagnosis && <form onSubmit={handleCreateDiagnosis}>
              <div className="row">
                <div className="col-md-2 mb-3">
                  <label className={labelClass} htmlFor="diagnosisCode">Code</label>
                  <input id="diagnosisCode" name="code" className={inputClass} value={diagnosisForm.code} onChange={handleDiagnosisChange} placeholder="Optional" />
                </div>
                <div className="col-md-4 mb-3">
                  <label className={labelClass} htmlFor="diagnosisDescription">Description</label>
                  <input id="diagnosisDescription" name="description" className={inputClass} value={diagnosisForm.description} onChange={handleDiagnosisChange} required />
                </div>
                <div className="col-md-3 mb-3">
                  <label className={labelClass} htmlFor="diagnosisType">Type</label>
                  <select id="diagnosisType" name="diagnosisType" className={selectClass} value={diagnosisForm.diagnosisType} onChange={handleDiagnosisChange}>
                    <option value="PRIMARY">Primary</option>
                    <option value="SECONDARY">Secondary</option>
                    <option value="DIFFERENTIAL">Differential</option>
                  </select>
                </div>
                <div className="col-md-3 mb-3">
                  <label className={labelClass} htmlFor="diagnosisStatus">Status</label>
                  <select id="diagnosisStatus" name="status" className={selectClass} value={diagnosisForm.status} onChange={handleDiagnosisChange}>
                    <option value="ACTIVE">Active</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="RULED_OUT">Ruled out</option>
                  </select>
                </div>
              </div>
              <button className={primaryButtonClass} type="submit">Add Diagnosis</button>
            </form>}

            <div className="mt-4">
              <h5 className="mb-3 font-bold text-[#31b372]">Diagnoses</h5>
              {diagnoses.length === 0 && <p className={smallMutedTextClass}>No diagnoses for this encounter yet.</p>}
              {diagnoses.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-striped custom-table">
                    <thead>
                      <tr>
                        <th>Diagnosed</th>
                        <th>Code</th>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {diagnoses.map((diagnosis) => (
                        <tr key={diagnosis._id}>
                          <td>{formatDate(diagnosis.diagnosedAt)}</td>
                          <td>{diagnosis.code || '-'}</td>
                          <td>{diagnosis.description}</td>
                          <td>{diagnosis.diagnosisType}</td>
                          <td>{diagnosis.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
            </>
          )}

          {canViewAdmission && <hr className="my-4" />}

          {canViewAdmission && (
            <>
          <h3 className={sectionTitleClass}>Admission Decision</h3>
          <div className="rounded border border-[#e0e0e0] p-4">
            {canCreateAdmission && <form onSubmit={handleCreateAdmission}>
              <div className="row align-items-end">
                <div className="col-md-9 mb-3">
                  <label className={labelClass} htmlFor="admissionReason">Reason for Admission</label>
                  <input
                    id="admissionReason"
                    name="reason"
                    className={inputClass}
                    value={admissionForm.reason}
                    onChange={handleAdmissionChange}
                    placeholder="Why the patient needs inpatient care"
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <button className={primaryButtonClass} type="submit">Admit Patient</button>
                </div>
              </div>
            </form>}

            <div className="mt-3">
              <h4 className="mb-3 font-bold text-[#31b372]">Admissions</h4>
              {admissions.length === 0 && <p className={smallMutedTextClass}>No admission has been created for this encounter yet.</p>}
              {admissions.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-striped custom-table">
                    <thead>
                      <tr>
                        <th>Admitted</th>
                        <th>Status</th>
                        <th>Reason</th>
                        <th>Current Bed</th>
                        <th>Discharged</th>
                        <th>Discharge Summary</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admissions.map((admission) => {
                        const bedAssignments = bedAssignmentsByAdmissionId[admission._id] || [];
                        const activeAssignment = bedAssignments.find((assignment) => !assignment.endedAt);
                        const isActiveAdmission = ['ADMITTED', 'TRANSFERRED'].includes(admission.status);

                        return (
                          <React.Fragment key={admission._id}>
                            <tr>
                              <td>{formatDate(admission.admittedAt)}</td>
                              <td><span className={statusClass[admission.status] || badgeBaseClass}>{admission.status}</span></td>
                              <td>{admission.reason || '-'}</td>
                              <td>{activeAssignment ? bedLabel(activeAssignment.bedId) : '-'}</td>
                              <td>{formatDate(admission.dischargedAt)}</td>
                              <td>
                                {admission.status === 'DISCHARGED' || !canDischargeAdmission ? (
                                  admission.dischargeSummary || '-'
                                ) : (
                                  <input
                                    className={inputClass}
                                    value={dischargeSummaryByAdmissionId[admission._id] || ''}
                                    onChange={(event) => handleDischargeSummaryChange(admission._id, event.target.value)}
                                    placeholder="Optional summary"
                                  />
                                )}
                              </td>
                              <td className="text-right">
                                {isActiveAdmission && canDischargeAdmission ? (
                                  <button className={mutedButtonClass} type="button" onClick={() => handleDischargeAdmission(admission._id)}>
                                    Discharge
                                  </button>
                                ) : (
                                  '-'
                                )}
                              </td>
                            </tr>
                            {isActiveAdmission && canAssignBed && (
                              <tr>
                                <td colSpan="7">
                                  <div className="row align-items-end">
                                    <div className="col-md-8 mb-2">
                                      <label className={labelClass} htmlFor={`bed-${admission._id}`}>Assign / Transfer Bed</label>
                                      <select
                                        id={`bed-${admission._id}`}
                                        className={selectClass}
                                        value={bedAssignmentFormByAdmissionId[admission._id] || ''}
                                        onChange={(event) => handleBedAssignmentChange(admission._id, event.target.value)}
                                      >
                                        <option value="">Choose available bed</option>
                                        {availableBeds.map((bed) => (
                                          <option key={bed._id} value={bed._id}>{bedLabel(bed)}</option>
                                        ))}
                                      </select>
                                      {availableBeds.length === 0 && (
                                        <p className={`${smallMutedTextClass} mt-2`}>No available beds found. Add wards, rooms, and beds first.</p>
                                      )}
                                    </div>
                                    <div className="col-md-4 mb-2">
                                      <button className={primaryButtonClass} type="button" onClick={() => handleAssignBed(admission._id)}>
                                        {activeAssignment ? 'Transfer Bed' : 'Assign Bed'}
                                      </button>
                                    </div>
                                  </div>

                                  <div className="mt-3">
                                    <strong>Bed History</strong>
                                    {bedAssignments.length === 0 && <p className={smallMutedTextClass}>No bed assignments for this admission yet.</p>}
                                    {bedAssignments.length > 0 && (
                                      <div className="table-responsive mt-2">
                                        <table className="table table-sm">
                                          <thead>
                                            <tr>
                                              <th>Bed</th>
                                              <th>Started</th>
                                              <th>Ended</th>
                                              <th className="text-right">Action</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {bedAssignments.map((assignment) => (
                                              <tr key={assignment._id}>
                                                <td>{bedLabel(assignment.bedId)}</td>
                                                <td>{formatDate(assignment.startedAt)}</td>
                                                <td>{formatDate(assignment.endedAt)}</td>
                                                <td className="text-right">
                                                  {!assignment.endedAt ? (
                                                    <button className={mutedButtonClass} type="button" onClick={() => handleEndBedAssignment(assignment._id)}>
                                                      End Assignment
                                                    </button>
                                                  ) : (
                                                    '-'
                                                  )}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
            </>
          )}
        </div>
      )}
    </Box>
  );
}
