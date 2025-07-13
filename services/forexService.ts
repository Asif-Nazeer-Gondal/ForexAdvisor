// services/forexService.ts
export const fetchForexRate = async (base: string, target: string): Promise<number> => {
  try {
    const response = await fetch(`https://api.exchangerate.host/latest?base=${base}&symbols=${target}`);
    const data = await response.json();

    if (data?.rates?.[target]) {
      return data.rates[target];
    } else {
      throw new Error('Invalid currency response');
    }
  } catch (error) {
    console.error('Error fetching forex rate:', error);
    return 0; // safe fallback
  }
};
