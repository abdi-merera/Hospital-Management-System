export interface MedicinePayload {
  company?: string;
  name?: string;
  description?: string;
  price?: string | number;
}

export interface ValidationResult {
  status: boolean;
  errors?: string[];
}

export function validateMedicinePayload(medicine: MedicinePayload): ValidationResult {
  const errors: string[] = [];
  const price = Number(medicine.price);

  if (!medicine.company) errors.push('Please enter company name');
  if (!medicine.name) errors.push('Please enter medicine name');
  if (!medicine.description) errors.push('Please enter medicine description');
  if (medicine.price === undefined || medicine.price === null || medicine.price === '') {
    errors.push('Please enter medicine cost');
  } else if (Number.isNaN(price) || price < 0) {
    errors.push('Please enter a valid medicine cost');
  }

  return errors.length > 0 ? { status: false, errors } : { status: true };
}
