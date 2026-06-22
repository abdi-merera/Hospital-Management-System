import mongoose from 'mongoose';
import { Admission, Bed, BedAssignment, Room, Ward } from './ward.model';
import type { AuthSender, BedAssignmentPayload, BedPayload, RoomPayload, WardFilters, WardPayload } from './ward.types';

function objectId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

const roomPopulate = { path: 'wardId' };
const bedPopulate = { path: 'roomId', populate: { path: 'wardId' } };
const assignmentPopulate = [
  { path: 'admissionId', populate: { path: 'patientId', populate: { path: 'userId' } } },
  { path: 'bedId', populate: { path: 'roomId', populate: { path: 'wardId' } } },
  { path: 'assignedBy', select: 'firstName lastName email userType' },
  { path: 'endedBy', select: 'firstName lastName email userType' },
];

export function listWards() {
  return Ward.find({}).sort({ name: 1 });
}

export function createWardRecord(payload: WardPayload) {
  return Ward.create({
    name: payload.name,
    departmentId: payload.departmentId ? objectId(payload.departmentId) : undefined,
    description: payload.description,
  });
}

export function updateWardRecord(id: string, payload: WardPayload) {
  return Ward.findByIdAndUpdate(id, {
    name: payload.name,
    departmentId: payload.departmentId ? objectId(payload.departmentId) : undefined,
    description: payload.description,
  }, { new: true });
}

export function listRooms(filters: WardFilters) {
  const query: Record<string, unknown> = {};
  if (filters.wardId) query.wardId = objectId(filters.wardId);
  return Room.find(query).populate(roomPopulate).sort({ roomNo: 1 });
}

export async function createRoomRecord(payload: RoomPayload) {
  const ward = await Ward.findById(payload.wardId);
  if (!ward) throw new Error('Ward not found');

  return Room.create({
    wardId: objectId(payload.wardId as string),
    roomNo: payload.roomNo,
    description: payload.description,
  });
}

export function updateRoomRecord(id: string, payload: RoomPayload) {
  return Room.findByIdAndUpdate(id, {
    wardId: payload.wardId ? objectId(payload.wardId) : undefined,
    roomNo: payload.roomNo,
    description: payload.description,
  }, { new: true }).populate(roomPopulate);
}

export function listBeds(filters: WardFilters) {
  const query: Record<string, unknown> = {};
  if (filters.roomId) query.roomId = objectId(filters.roomId);
  if (filters.status) query.status = filters.status;
  return Bed.find(query).populate(bedPopulate).sort({ bedNo: 1 });
}

export async function createBedRecord(payload: BedPayload) {
  const room = await Room.findById(payload.roomId);
  if (!room) throw new Error('Room not found');

  return Bed.create({
    roomId: objectId(payload.roomId as string),
    bedNo: payload.bedNo,
    status: payload.status || 'AVAILABLE',
    description: payload.description,
  });
}

export function updateBedRecord(id: string, payload: BedPayload) {
  return Bed.findByIdAndUpdate(id, {
    roomId: payload.roomId ? objectId(payload.roomId) : undefined,
    bedNo: payload.bedNo,
    status: payload.status,
    description: payload.description,
  }, { new: true }).populate(bedPopulate);
}

export function listBedAssignments(filters: WardFilters) {
  const query: Record<string, unknown> = {};
  if (filters.admissionId) query.admissionId = objectId(filters.admissionId);
  if (filters.bedId) query.bedId = objectId(filters.bedId);
  return BedAssignment.find(query).populate(assignmentPopulate).sort({ startedAt: -1 });
}

export async function assignBed(payload: BedAssignmentPayload, sender?: AuthSender) {
  const admission = await Admission.findById(payload.admissionId);
  if (!admission) throw new Error('Admission not found');
  if (['DISCHARGED', 'CANCELLED'].includes(admission.status)) throw new Error('Cannot assign a bed to a closed admission');

  const bed = await Bed.findById(payload.bedId);
  if (!bed) throw new Error('Bed not found');
  if (bed.status !== 'AVAILABLE' && bed.status !== 'RESERVED') throw new Error('Bed is not available');

  const activeAssignment = await BedAssignment.findOne({
    admissionId: objectId(payload.admissionId as string),
    endedAt: { $exists: false },
  });

  if (activeAssignment) {
    await BedAssignment.findByIdAndUpdate(activeAssignment._id, {
      endedAt: new Date(),
      endedBy: sender?.id ? objectId(sender.id) : undefined,
    });
    await Bed.findByIdAndUpdate(activeAssignment.bedId, { status: 'AVAILABLE' });
    await Admission.findByIdAndUpdate(payload.admissionId, { status: 'TRANSFERRED' });
  }

  const assignment = await BedAssignment.create({
    admissionId: objectId(payload.admissionId as string),
    bedId: objectId(payload.bedId as string),
    startedAt: payload.startedAt ? new Date(payload.startedAt) : new Date(),
    assignedBy: sender?.id ? objectId(sender.id) : undefined,
  });

  await Bed.findByIdAndUpdate(payload.bedId, { status: 'OCCUPIED' });

  return BedAssignment.findById(assignment._id).populate(assignmentPopulate);
}

export async function endBedAssignment(id: string, payload: BedAssignmentPayload, sender?: AuthSender) {
  const assignment = await BedAssignment.findById(id);
  if (!assignment) return null;

  const endedAssignment = await BedAssignment.findByIdAndUpdate(id, {
    endedAt: payload.endedAt ? new Date(payload.endedAt) : new Date(),
    endedBy: sender?.id ? objectId(sender.id) : undefined,
  }, { new: true }).populate(assignmentPopulate);

  await Bed.findByIdAndUpdate(assignment.bedId, { status: 'AVAILABLE' });
  return endedAssignment;
}

