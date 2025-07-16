// services/forexService.ts

const fetchForexRate = async (): Promise<number> => {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    return data.rates.PKR;
  } catch (error) {
    console.error('Error fetching forex rate:', error);
    return 0;
  }
};

export default fetchForexRate;
