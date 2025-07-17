// services/forexService.ts

import Constants from 'expo-constants';

const extra = (Constants.manifest?.extra || Constants.expoConfig?.extra || {});

const {
  TWELVE_DATA_API_KEY,
  EXCHANGE_RATE_API_KEY,
  CURRENCY_API_KEY,
  TWELVE_DATA_API_URL,
  EXCHANGE_RATE_API_URL,
  CURRENCY_API_URL,
  FOREX_API_PROVIDER
} = extra;

// Helper to select provider config
function getProviderConfig() {
  switch (FOREX_API_PROVIDER) {
    case 'TWELVE_DATA':
      return {
        url: TWELVE_DATA_API_URL,
        key: TWELVE_DATA_API_KEY,
        name: 'TWELVE_DATA',
      };
    case 'EXCHANGE_RATE_API':
      return {
        url: EXCHANGE_RATE_API_URL,
        key: EXCHANGE_RATE_API_KEY,
        name: 'EXCHANGE_RATE_API',
      };
    case 'CURRENCY_API':
      return {
        url: CURRENCY_API_URL,
        key: CURRENCY_API_KEY,
        name: 'CURRENCY_API',
      };
    default:
      throw new Error('Unknown FOREX_API_PROVIDER');
  }
}

// Retry function for better reliability
async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        return response;
      }
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  throw new Error(`Failed after ${retries} attempts`);
}

export const fetchForexRatePair = async (base: string, target: string): Promise<number> => {
  try {
    // Use Open ER API for CORS-compatible forex data
    const url = `https://open.er-api.com/v6/latest/${base}`;
    const response = await fetchWithRetry(url);
    const data = await response.json();
    
    if (data?.result !== 'success') {
      console.error('fetchForexRatePair: API response error:', JSON.stringify(data, null, 2));
      return 0;
    }
    
    const rate = data.rates[target];
    if (!rate) {
      console.error('fetchForexRatePair: Rate not found for', target);
      return 0;
    }
    
    return Number(rate);
  } catch (error) {
    console.error(`Error fetching forex rate for ${base} to ${target}:`, error);
    // Return fallback rates for demo purposes
    const fallbackRates: Record<string, number> = {
      'USD/PKR': 280.5,
      'EUR/USD': 1.085,
      'GBP/USD': 1.265,
      'USD/JPY': 150.2,
      'EUR/PKR': 304.2,
      'GBP/PKR': 354.8,
    };
    const pairKey = `${base}/${target}`;
    return fallbackRates[pairKey] || 1;
  }
};

export const fetchTopMovers = async (): Promise<{ pair: string; change: number }[]> => {
  try {
    // Use Open ER API for CORS-compatible forex data
    const currencies = ['EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'NZD', 'SEK', 'NOK'];
    const movers: { pair: string; change: number }[] = [];
    
    // For demo purposes, we'll simulate some movement data
    // In a real app, you'd fetch historical data and calculate actual changes
    currencies.forEach((currency, index) => {
      // Simulate realistic forex movements (-2% to +2%)
      const change = (Math.random() - 0.5) * 4;
      movers.push({ pair: `USD/${currency}`, change: Number(change.toFixed(2)) });
    });
    
    // Sort by absolute % change, descending, and take top 5
    return movers.sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 5);
  } catch (error) {
    console.error('Error fetching top movers:', error);
    // Return some demo data if API fails
    return [
      { pair: 'USD/EUR', change: 1.2 },
      { pair: 'USD/GBP', change: -0.8 },
      { pair: 'USD/JPY', change: 0.5 },
      { pair: 'USD/AUD', change: -1.1 },
      { pair: 'USD/CAD', change: 0.7 },
    ];
  }
};

// Fetch historical rates for a given pair and period (last 7 days)
export const fetchHistoricalRates = async (
  base: string,
  target: string,
  days: number = 7
): Promise<{ date: string; rate: number }[]> => {
  try {
    // For demo purposes, we'll generate simulated historical data
    // In a real app, you'd use a paid API like CurrencyAPI for historical data
    const historicalData: { date: string; rate: number }[] = [];
    const today = new Date();
    
    // Get current rate as base
    const currentRate = await fetchForexRatePair(base, target);
    
    // Fallback rates for demo
    const fallbackRates: Record<string, number> = {
      'USD/PKR': 280,
      'EUR/USD': 1.08,
      'GBP/USD': 1.25,
      'USD/JPY': 150,
      'EUR/PKR': 304,
      'GBP/PKR': 354,
    };
    const pairKey = `${base}/${target}`;
    const baseRate = currentRate || fallbackRates[pairKey] || 1;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      
      // Add some realistic variation (±1%)
      const variation = (Math.random() - 0.5) * 0.02;
      const rate = baseRate * (1 + variation);
      
      historicalData.push({
        date: dateStr,
        rate: Number(rate.toFixed(4))
      });
    }
    
    return historicalData;
  } catch (error) {
    console.error('Error fetching historical rates:', error);
    // Return demo historical data if API fails
    const demoData: { date: string; rate: number }[] = [];
    const today = new Date();
    const baseRate = 280; // USD/PKR demo rate
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      const variation = (Math.random() - 0.5) * 0.02;
      const rate = baseRate * (1 + variation);
      
      demoData.push({
        date: dateStr,
        rate: Number(rate.toFixed(4))
      });
    }
    
    return demoData;
  }
};

const NEWS_API_KEY = '7846c076966e4d618eba3ead1156cede';
const NEWS_API_URL = 'https://newsapi.org/v2/everything?q=forex%20OR%20currency%20OR%20exchange%20rates&language=en&sortBy=publishedAt&apiKey=' + NEWS_API_KEY;

export async function fetchForexNews(currencyPair = '', region = '') {
  let query = 'forex OR currency OR exchange rates';
  if (currencyPair) query += ` OR ${currencyPair}`;
  let url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`;
  if (region) url += `&domains=${region}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === 'ok') {
      return data.articles;
    } else {
      throw new Error(data.message || 'Failed to fetch news');
    }
  } catch (error) {
    console.error('Error fetching Forex news:', error);
    return [];
  }
}
