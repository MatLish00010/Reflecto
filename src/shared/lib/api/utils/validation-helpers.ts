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
