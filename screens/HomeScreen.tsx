// screens/HomeScreen.tsx

import { MaterialIcons } from '@expo/vector-icons';
import 'dotenv/config';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useBudget } from '../hooks/useBudget';
import { fetchForexRatePair, fetchHistoricalRates, fetchTopMovers } from '../services/forexService';
type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];
const trendIcon: MaterialIconName = 'trending-up'; // example

const screenWidth = Dimensions.get('window').width;

// Mock data for 7-day trends
const usdPkrTrend = [278, 279, 277, 280, 281, 282, 283];
const eurUsdTrend = [1.08, 1.09, 1.10, 1.09, 1.08, 1.07, 1.08];

function getInvestmentSuggestion(balance: number, usdPkrTrend: number[]) {
  if (balance <= 0) return 'No available funds to invest.';
  const last = usdPkrTrend.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const avg = usdPkrTrend.reduce((a, b) => a + b, 0) / usdPkrTrend.length;
  if (last > avg) return `Uptrend likely. Consider investing Rs. ${(balance * 0.5).toFixed(0)} (50% of your balance)`;
  if (last < avg) return 'Downtrend likely. Consider holding or investing less.';
  return `Stable trend. You may invest Rs. ${(balance * 0.3).toFixed(0)} (30% of your balance)`;
}

const HomeScreen: React.FC = () => {
  const [usdPkr, setUsdPkr] = useState<number | null>(null);
  const [eurUsd, setEurUsd] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [topMovers, setTopMovers] = useState<{ pair: string; change: number }[]>([]);
  const [loadingMovers, setLoadingMovers] = useState(false);
  const [moversError, setMoversError] = useState('');
  const [usdPkrHistory, setUsdPkrHistory] = useState<number[]>([]);
  const [eurUsdHistory, setEurUsdHistory] = useState<number[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [loadingCharts, setLoadingCharts] = useState(false);
  const [chartError, setChartError] = useState('');
  const { income, categories, totalExpenses, balance } = useBudget();

  const loadRates = async () => {
    setLoading(true);
    try {
      const usdPkrRate = await fetchForexRatePair('USD', 'PKR');
      const eurUsdRate = await fetchForexRatePair('EUR', 'USD');
      setUsdPkr(usdPkrRate);
      setEurUsd(eurUsdRate);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to fetch rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTopMovers = async () => {
    setLoadingMovers(true);
    setMoversError('');
    try {
      const movers = await fetchTopMovers();
      setTopMovers(movers);
    } catch (e) {
      setMoversError('Failed to load top movers.');
    } finally {
      setLoadingMovers(false);
    }
  };

  const loadCharts = async () => {
    setLoadingCharts(true);
    setChartError('');
    try {
      const usdPkr = await fetchHistoricalRates('USD', 'PKR', 7);
      const eurUsd = await fetchHistoricalRates('EUR', 'USD', 7);
      setUsdPkrHistory(usdPkr.map(d => d.rate));
      setEurUsdHistory(eurUsd.map(d => d.rate));
      setChartLabels(usdPkr.map(d => d.date.slice(5))); // MM-DD
    } catch (e) {
      setChartError('Failed to load chart data.');
    } finally {
      setLoadingCharts(false);
    }
  };

  useEffect(() => {
    loadRates();
    loadTopMovers();
    loadCharts();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Forex Rates</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <>
          <Text style={styles.rateText}>
            {usdPkr ? `1 USD = ${usdPkr.toFixed(2)} PKR` : 'USD/PKR not available'}
          </Text>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>USD/PKR (Last 7 Days)</Text>
            {loadingCharts ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : chartError ? (
              <Text style={{ color: 'red' }}>{chartError}</Text>
            ) : usdPkrHistory.length > 0 ? (
              <LineChart
                data={{
                  labels: chartLabels,
                  datasets: [{ data: usdPkrHistory }],
                }}
                width={screenWidth - 48}
                height={120}
                chartConfig={{
                  backgroundColor: '#fff',
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fff',
                  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                  propsForDots: { r: '3', strokeWidth: '2', stroke: '#007AFF' },
                }}
                bezier
                style={{ marginVertical: 8, borderRadius: 8 }}
              />
            ) : (
              <Text>No data available.</Text>
            )}
          </View>
          <Text style={styles.rateText}>
            {eurUsd ? `1 EUR = ${eurUsd.toFixed(4)} USD` : 'EUR/USD not available'}
          </Text>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>EUR/USD (Last 7 Days)</Text>
            {loadingCharts ? (
              <ActivityIndicator size="small" color="#FF6384" />
            ) : chartError ? (
              <Text style={{ color: 'red' }}>{chartError}</Text>
            ) : eurUsdHistory.length > 0 ? (
              <LineChart
                data={{
                  labels: chartLabels,
                  datasets: [{ data: eurUsdHistory }],
                }}
                width={screenWidth - 48}
                height={120}
                chartConfig={{
                  backgroundColor: '#fff',
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fff',
                  color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                  propsForDots: { r: '3', strokeWidth: '2', stroke: '#FF6384' },
                }}
                bezier
                style={{ marginVertical: 8, borderRadius: 8 }}
              />
            ) : (
              <Text>No data available.</Text>
            )}
          </View>
          <Text style={styles.updatedText}>Last updated: {lastUpdated}</Text>
        </>
      )}
      <TouchableOpacity style={styles.button} onPress={loadRates}>
        <Text style={styles.buttonText}>Refresh Rates</Text>
      </TouchableOpacity>
      <View style={styles.budgetSummary}>
        <Text style={styles.budgetTitle}>Budget Summary</Text>
        <Text>Income: Rs. {income || '0'}</Text>
        <Text>Expenses: Rs. {totalExpenses || '0'}</Text>
        <Text>Balance: Rs. {balance}</Text>
      </View>
      <View style={styles.investmentCard}>
        <Text style={styles.investmentTitle}>Investment Suggestion</Text>
        <Text>{getInvestmentSuggestion(balance, usdPkrTrend)}</Text>
      </View>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Top Movers (24h % change)</Text>
        {loadingMovers ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : moversError ? (
          <Text style={{ color: 'red' }}>{moversError}</Text>
        ) : topMovers.length > 0 ? (
          <BarChart
            data={{
              labels: topMovers.map(m => m.pair),
              datasets: [{ data: topMovers.map(m => Number(m.change.toFixed(2))) }],
            }}
            width={screenWidth - 48}
            height={180}
            fromZero
            yAxisLabel=""
            yAxisSuffix="%"
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              color: (opacity = 1) => `rgba(255, 140, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              propsForBackgroundLines: { stroke: '#eee' },
            }}
            style={{ marginVertical: 8, borderRadius: 8 }}
            showValuesOnTopOfBars
          />
        ) : (
          <Text>No data available.</Text>
        )}
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  rateText: {
    fontSize: 20,
    marginVertical: 12,
    color: '#333',
  },
  updatedText: {
    fontSize: 14,
    color: '#666',
  },
  button: {
    marginTop: 24,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  budgetSummary: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  budgetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  investmentCard: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#e6f7ff',
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  investmentTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  sectionCard: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
