// File: hooks/useForex.ts
import { useEffect, useState } from 'react';
import fetchUSDtoPKR from '@/services/forexService';

export const useForex = () => {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRate = async () => {
      try {
        const r = await fetchUSDtoPKR();
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
