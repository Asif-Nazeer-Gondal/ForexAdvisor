import axios from 'axios';
import { API_KEY } from '@env'; // or use direct URL if no .env setup

export const fetchForexRate = async (): Promise<number> => {
  try {
    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`
    );
    const rate = response.data?.conversion_rates?.PKR;
    if (!rate) throw new Error('PKR rate not found');
    return rate;
  } catch (error) {
    console.error('Error fetching forex rate:', error);
    throw error;
  }
};
