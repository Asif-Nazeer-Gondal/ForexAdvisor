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

export const fetchForexRatePair = async (base: string, target: string): Promise<number> => {
  try {
    // Use exchangerate.host for free forex data
    const response = await fetch(`https://api.exchangerate.host/latest?base=${base}&symbols=${target}`);
    const data = await response.json();
    
    if (!data.rates || !data.rates[target]) {
      console.error('fetchForexRatePair: API response missing rate:', JSON.stringify(data, null, 2));
      return 0;
    }
    
    return Number(data.rates[target]);
  } catch (error) {
    console.error(`Error fetching forex rate for ${base} to ${target}:`, error);
    return 0;
  }
};

export const fetchTopMovers = async (): Promise<{ pair: string; change: number }[]> => {
  try {
    // Use exchangerate.host for free forex data
    const todayDate = new Date();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(todayDate.getDate() - 1);
    const todayStr = todayDate.toISOString().slice(0, 10);
    const yesterdayStr = yesterdayDate.toISOString().slice(0, 10);
    
    // Fetch today's rates
    const todayRes = await fetch(`https://api.exchangerate.host/${todayStr}?base=USD`);
    const todayData = await todayRes.json();
    
    // Fetch yesterday's rates
    const yestRes = await fetch(`https://api.exchangerate.host/${yesterdayStr}?base=USD`);
    const yestData = await yestRes.json();
    
    if (!todayData.rates || !yestData.rates) {
      console.error('Error: Missing rates data from API');
      return [];
    }
    
    // Calculate movers
    const movers: { pair: string; change: number }[] = [];
    const currencies = ['EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'NZD', 'SEK', 'NOK'];
    
    for (const currency of currencies) {
      if (todayData.rates[currency] && yestData.rates[currency]) {
        const change = ((todayData.rates[currency] - yestData.rates[currency]) / yestData.rates[currency]) * 100;
        movers.push({ pair: `USD/${currency}`, change });
      }
    }
    
    // Sort by absolute % change, descending, and take top 5
    return movers.sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 5);
  } catch (error) {
    console.error('Error fetching top movers:', error);
    return [];
  }
};

// Fetch historical rates for a given pair and period (last 7 days)
export const fetchHistoricalRates = async (
  base: string,
  target: string,
  days: number = 7
): Promise<{ date: string; rate: number }[]> => {
  try {
    // Use exchangerate.host for free historical data
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);
    const url = `https://api.exchangerate.host/timeseries?start_date=${startStr}&end_date=${endStr}&base=${base}&symbols=${target}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.rates) return [];
    return Object.entries(data.rates).map(([date, obj]) => ({
      date,
      rate: (obj as Record<string, number>)[target],
    })).sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error fetching historical rates:', error);
    return [];
  }
};
