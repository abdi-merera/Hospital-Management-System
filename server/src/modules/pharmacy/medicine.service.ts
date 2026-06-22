import Medicine from './medicine.model';
import type { MedicinePayload } from './medicine.validation';

export function listMedicines(name?: string) {
  if (!name) {
    return Medicine.find({});
  }

  return Medicine.find({ name });
}

export function findMedicineById(id: string) {
  return Medicine.findById(id);
}

export function createMedicineRecord(payload: MedicinePayload) {
  return Medicine.create({
    company: payload.company,
    name: payload.name,
    description: payload.description,
    price: Number(payload.price),
  });
}

export function updateMedicineRecord(id: string, payload: MedicinePayload) {
  return Medicine.updateOne(
    { _id: id },
    {
      $set: {
        company: payload.company,
        name: payload.name,
        description: payload.description,
        price: Number(payload.price),
      },
    },
  );
}

export function deleteMedicineRecord(id: string) {
  return Medicine.deleteOne({ _id: id });
}
