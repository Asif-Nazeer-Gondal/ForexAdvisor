// File: hooks/useBudget.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export type ExpenseCategory = { category: string; amount: number };
export type BudgetHistoryEntry = {
  month: string; // e.g., '2024-06'
  income: number;
  expenses: ExpenseCategory[];
};

const STORAGE_KEY = 'budget_data_v2';
const HISTORY_KEY = 'budget_history_v2';

export const useBudget = () => {
  const [income, setIncome] = useState('');
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [history, setHistory] = useState<BudgetHistoryEntry[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Load current month data
  const loadBudget = async () => {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setIncome(parsed.income || '');
      setCategories(parsed.categories || []);
    }
    const hist = await AsyncStorage.getItem(HISTORY_KEY);
    if (hist) setHistory(JSON.parse(hist));
  };

  // Save current month data
  const saveBudget = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ income, categories }));
  };

  // Add or update a category
  const setCategoryAmount = (category: string, amount: number) => {
    setCategories(prev => {
      const idx = prev.findIndex(c => c.category === category);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { category, amount };
        return updated;
      } else {
        return [...prev, { category, amount }];
      }
    });
  };

  // Remove a category
  const removeCategory = (category: string) => {
    setCategories(prev => prev.filter(c => c.category !== category));
  };

  // Save monthly snapshot to history
  const saveToHistory = async () => {
    const month = selectedMonth;
    const entry: BudgetHistoryEntry = {
      month,
      income: parseFloat(income) || 0,
      expenses: categories,
    };
    let hist = [...history];
    const idx = hist.findIndex(e => e.month === month);
    if (idx >= 0) {
      hist[idx] = entry;
    } else {
      hist.push(entry);
    }
    setHistory(hist);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
  };

  // Get total expenses for current month
  const totalExpenses = categories.reduce((sum, c) => sum + c.amount, 0);
  const balance = (parseFloat(income) || 0) - totalExpenses;

  // Get monthly totals for trend chart
  const monthlyTotals = history.map(h => ({
    month: h.month,
    expenses: h.expenses.reduce((sum, c) => sum + c.amount, 0),
    income: h.income,
    balance: h.income - h.expenses.reduce((sum, c) => sum + c.amount, 0),
  }));

  useEffect(() => {
    loadBudget();
  }, []);

  return {
    income,
    setIncome,
    categories,
    setCategoryAmount,
    removeCategory,
    saveBudget,
    totalExpenses,
    balance,
    saveToHistory,
    history,
    monthlyTotals,
    selectedMonth,
    setSelectedMonth,
  };
};