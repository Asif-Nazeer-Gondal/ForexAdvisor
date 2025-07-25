import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { supabase } from '../services/supabaseClient';

export type Investment = {
  id: string;
  pair: string; // e.g. 'USD/PKR'
  amount: number;
  investedRate: number;
  date: string;
  closed: boolean;
  closedRate?: number;
  closedDate?: string;
};

const STORAGE_KEY = 'investments_v1';
const WALLET_KEY = 'wallet_balance_v1';
const ALERTS_KEY = 'forex_rate_alerts_v1';

export type RateAlert = {
  pair: string;
  threshold: number;
  direction: 'above' | 'below';
};

export function useInvestments() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [wallet, setWallet] = useState(50000); // Default demo balance

  useEffect(() => {
    (async () => {
      const inv = await AsyncStorage.getItem(STORAGE_KEY);
      if (inv) setInvestments(JSON.parse(inv));
      const w = await AsyncStorage.getItem(WALLET_KEY);
      if (w) setWallet(Number(w));
    })();
  }, []);

  const addInvestment = async (pair: string, amount: number, investedRate: number) => {
    const newInv: Investment = {
      id: Date.now().toString(),
      pair,
      amount,
      investedRate,
      date: new Date().toISOString(),
      closed: false,
    };
    const updated = [...investments, newInv];
    setInvestments(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setWallet(wallet - amount);
    await AsyncStorage.setItem(WALLET_KEY, String(wallet - amount));
  };

  const closeInvestment = async (id: string, closedRate: number) => {
    const updated = investments.map(inv =>
      inv.id === id
        ? { ...inv, closed: true, closedRate, closedDate: new Date().toISOString() }
        : inv
    );
    setInvestments(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Optionally update wallet with profit/loss
    // Send notification
    const closedInv = updated.find(inv => inv.id === id);
    if (closedInv) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Trade Closed',
          body: `Your ${closedInv.pair} trade has been closed at rate ${closedInv.closedRate}.`,
        },
        trigger: null,
      });
    }
  };

  const editInvestmentAmount = async (id: string, newAmount: number) => {
    const updated = investments.map(inv =>
      inv.id === id ? { ...inv, amount: newAmount } : inv
    );
    setInvestments(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Update in Supabase
    const { data: { user } } = await import('../services/authService').then(m => m.getUser());
    if (user) {
      await supabase.from('investments').update({ amount: newAmount }).eq('id', id).eq('user_id', user.id);
    }
  };

  const deleteInvestment = async (id: string) => {
    const updated = investments.filter(inv => inv.id !== id);
    setInvestments(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Delete from Supabase
    const { data: { user } } = await import('../services/authService').then(m => m.getUser());
    if (user) {
      await supabase.from('investments').delete().eq('id', id).eq('user_id', user.id);
    }
  };

  const openPositions = investments.filter(inv => !inv.closed);
  const closedPositions = investments.filter(inv => inv.closed);

  return {
    investments,
    openPositions,
    closedPositions,
    wallet,
    addInvestment,
    closeInvestment,
    setInvestments, // Export setInvestments for external sync
    editInvestmentAmount,
    deleteInvestment,
  };
}

export async function addRateAlert(alert: RateAlert) {
  const existing = await getRateAlerts();
  const updated = [...existing, alert];
  await AsyncStorage.setItem(ALERTS_KEY, JSON.stringify(updated));
}

export async function getRateAlerts(): Promise<RateAlert[]> {
  const raw = await AsyncStorage.getItem(ALERTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function removeRateAlert(index: number) {
  const existing = await getRateAlerts();
  existing.splice(index, 1);
  await AsyncStorage.setItem(ALERTS_KEY, JSON.stringify(existing));
}

export async function scheduleInvestmentReminder(frequency: 'daily' | 'weekly' | 'monthly', hour: number = 9, minute: number = 0) {
  let trigger;
  if (frequency === 'daily') {
    trigger = { hour, minute, repeats: true };
  } else if (frequency === 'weekly') {
    trigger = { weekday: 1, hour, minute, repeats: true }; // Monday
  } else if (frequency === 'monthly') {
    trigger = { day: 1, hour, minute, repeats: true }; // 1st of month
  }
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Investment Reminder',
      body: 'Time to review or add new investments in ForexAdvisor!',
    },
    trigger,
  });
}

export async function checkMilestones(investments: Investment[]) {
  const closed = investments.filter(inv => inv.closed && inv.closedRate !== undefined);
  const totalProfit = closed.reduce((sum, inv) => sum + ((inv.closedRate! - inv.investedRate) * inv.amount), 0);
  const milestones = [10000, 50000, 100000];
  // Use AsyncStorage to track which milestones have been notified
  const MILESTONE_KEY = 'milestones_notified_v1';
  const raw = await AsyncStorage.getItem(MILESTONE_KEY);
  const notified: number[] = raw ? JSON.parse(raw) : [];
  // First profitable trade
  if (closed.length > 0 && !notified.includes(-1)) {
    const firstProfit = closed.find(inv => (inv.closedRate! - inv.investedRate) * inv.amount > 0);
    if (firstProfit) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Milestone Achieved!',
          body: `Congratulations! You made your first profitable trade (${firstProfit.pair}).`,
        },
        trigger: null,
      });
      notified.push(-1);
    }
  }
  // Profit milestones
  for (const m of milestones) {
    if (totalProfit >= m && !notified.includes(m)) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Milestone Achieved!',
          body: `Your total profit has exceeded ${m}! Keep it up!`,
        },
        trigger: null,
      });
      notified.push(m);
    }
  }
  await AsyncStorage.setItem(MILESTONE_KEY, JSON.stringify(notified));
} 