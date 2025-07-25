// File: utils/formatNumber.ts
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 2,
  }).format(value);
};