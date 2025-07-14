// utils/predictorLogic.ts
export function getPrediction(prices: number[]): string {
  const last = prices.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  if (last > avg) return 'Uptrend likely';
  else if (last < avg) return 'Downtrend likely';
  return 'Stable trend';
}
