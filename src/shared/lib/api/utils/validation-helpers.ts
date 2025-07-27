export function validateNumericId(
  id: string,
  entityName: string = 'item'
): number {
  const numericId = parseInt(id);
  if (isNaN(numericId)) {
    throw new Error(`Valid ${entityName} ID is required`);
  }
  return numericId;
}

export function validateRequiredFields(
  body: Record<string, unknown>,
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter(field => !body[field]);
  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}
