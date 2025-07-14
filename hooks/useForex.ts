// File: hooks/useForex.ts
import { useEffect, useState } from 'react';
import { fetchForexRate } from '../services/forexService';

export const useForex = () => {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRate = async () => {
      try {
        const r = await fetchForexRate();
        setRate(r);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    getRate();
  }, []);

  return { rate, loading };
};
