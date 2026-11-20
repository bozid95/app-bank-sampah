export const formatAccountNumber = (prefix: string, id: number) => `${prefix}-${String(id).padStart(5, '0')}`;
