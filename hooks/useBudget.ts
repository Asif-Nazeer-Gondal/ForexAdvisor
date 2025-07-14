// File: hooks/useBudget.ts
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'budget_data';

export const useBudget = () => {
  const [budget, setBudget] = useState({
    income: '',
    expenses: '',
    savings: '',
    investment: '',
  });

  const [balance, setBalance] = useState(0);

  const calculateBalance = (data: typeof budget) => {
    const i = parseFloat(data.income) || 0;
    const e = parseFloat(data.expenses) || 0;
    const s = parseFloat(data.savings) || 0;
    const inv = parseFloat(data.investment) || 0;
    setBalance(i - (e + s + inv));
  };

  const loadBudget = async () => {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setBudget(parsed);
      calculateBalance(parsed);
    }
  };

  const saveBudget = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(budget));
  };

  useEffect(() => {
    loadBudget();
  }, []);

  return { budget, setBudget, balance, calculateBalance, saveBudget };
};