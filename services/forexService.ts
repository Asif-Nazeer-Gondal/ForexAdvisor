// services/forexService.ts

const fetchForexRate = async (): Promise<number> => {
  try {
    const response = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=PKR');
    const data = await response.json();
    if (!data.rates || typeof data.rates.PKR !== 'number') {
      console.error('fetchForexRate: API response missing PKR rate:', JSON.stringify(data, null, 2));
      return 0;
    }
    return data.rates.PKR;
  } catch (error) {
    console.error('Error fetching forex rate:', error);
    return 0;
  }
};

export const fetchForexRatePair = async (base: string, target: string): Promise<number> => {
  try {
    const response = await fetch(`https://api.exchangerate.host/latest?base=${base}&symbols=${target}`);
    const data = await response.json();
    if (!data.rates || typeof data.rates[target] !== 'number') {
      console.error(`fetchForexRatePair: API response missing rate for ${base} to ${target}:`, JSON.stringify(data, null, 2));
      return 0;
    }
    return data.rates[target];
  } catch (error) {
    console.error(`Error fetching forex rate for ${base} to ${target}:`, error);
    return 0;
  }
};

export const fetchTopMovers = async (ymd?: string): Promise<{ pair: string; change: number }[]> => {
  try {
    // Fetch today and yesterday rates
    const todayRes = await fetch('https://api.exchangerate.host/latest?base=USD');
    const todayText = await todayRes.text();
    let todayData;
    try {
      todayData = JSON.parse(todayText);
    } catch (e) {
      console.error('fetchTopMovers: Today response was not JSON:', todayText);
      throw e;
    }
    if (!todayData.rates || typeof todayData.rates !== 'object') {
      console.error('fetchTopMovers: Today rates missing or invalid:', JSON.stringify(todayData, null, 2));
      return [];
    }
    let yesterdayDate: string;
    if (ymd) {
      yesterdayDate = ymd;
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterdayDate = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    }
    const yestRes = await fetch(`https://api.exchangerate.host/${yesterdayDate}?base=USD`);
    const yestText = await yestRes.text();
    let yestData;
    try {
      yestData = JSON.parse(yestText);
    } catch (e) {
      console.error('fetchTopMovers: Yesterday response was not JSON:', yestText);
      throw e;
    }
    if (!yestData.rates || typeof yestData.rates !== 'object') {
      console.error('fetchTopMovers: Yesterday rates missing or invalid:', JSON.stringify(yestData, null, 2));
      return [];
    }
    const movers: { pair: string; change: number }[] = [];
    for (const [currency, todayRateRaw] of Object.entries(todayData.rates)) {
      const yestRateRaw = yestData.rates[currency];
      const todayRate = Number(todayRateRaw);
      const yestRate = Number(yestRateRaw);
      if (!isNaN(todayRate) && !isNaN(yestRate) && yestRate !== 0) {
        const change = ((todayRate - yestRate) / yestRate) * 100;
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

export default fetchForexRate;
