// File: utils/validateInput.ts
export const isValidNumber = (value: string): boolean => {
  return /^\d*\.?\d*$/.test(value);
};
