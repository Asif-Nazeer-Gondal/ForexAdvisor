// File: hooks/useForex.ts
import { fetchForexRatePair } from '@/services/forexService';
import { useEffect, useState } from 'react';

export const useForex = () => {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRate = async () => {
      try {
        const r = await fetchForexRatePair('USD', 'PKR');
        setRate(r);
      } catch (e) {
        console.error('Failed to fetch USD to PKR rate:', e);
      } finally {
        setLoading(false);
      }
    };
    getRate();
  }, []);

  return { rate, loading };
};
