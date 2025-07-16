// screens/PredictorScreen.tsx
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useBudget } from '../hooks/useBudget';
import { fetchHistoricalRates } from '../services/forexService';
import { getPrediction } from '../utils/predictorLogic';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>["name"];

const screenWidth = Dimensions.get('window').width;

const PAIRS = [
  { label: 'USD/PKR', base: 'USD', target: 'PKR' },
  { label: 'EUR/USD', base: 'EUR', target: 'USD' },
  { label: 'GBP/USD', base: 'GBP', target: 'USD' },
  { label: 'USD/JPY', base: 'USD', target: 'JPY' },
];

const PredictorScreen: React.FC = () => {
  const [selected, setSelected] = useState(PAIRS[0]);
  const [history, setHistory] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [prediction, setPrediction] = useState('');
  const { balance } = useBudget();
  const [simAmount, setSimAmount] = useState('');
  const [simResult, setSimResult] = useState<string | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchHistoricalRates(selected.base, selected.target, 7);
      setHistory(data.map(d => d.rate));
      setLabels(data.map(d => d.date.slice(5)));
      setPrediction(getPrediction(data.map(d => d.rate)));
    } catch (e) {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  function getConfidence(prices: number[]): number {
    if (prices.length < 4) return 50;
    const last = prices.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const diff = Math.abs(last - avg);
    const rel = avg === 0 ? 0 : diff / avg;
    return Math.min(95, Math.max(60, Math.round(60 + rel * 100)));
  }

  const confidence = getConfidence(history);
  let trendIcon = 'trending-flat';
  let trendColor = '#888';
  if (prediction.includes('Uptrend')) { trendIcon = 'trending-up'; trendColor = '#4CAF50'; }
  else if (prediction.includes('Downtrend')) { trendIcon = 'trending-down'; trendColor = '#F44336'; }

  function getExplanation(prices: number[]): string {
    if (prices.length < 4) return 'Not enough data for a detailed explanation.';
    const last = prices.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    if (last > avg) return 'The last 3 days’ average is higher than the week’s average, indicating an uptrend.';
    if (last < avg) return 'The last 3 days’ average is lower than the week’s average, indicating a downtrend.';
    return 'The last 3 days’ average is about the same as the week’s average, indicating a stable trend.';
  }

  function simulateInvestment(amount: number): string {
    if (history.length < 2) return 'Not enough data.';
    const change = (history[history.length - 1] - history[0]) / history[0];
    const result = amount * (1 + change);
    return `If the trend continues, your investment could become ${result.toFixed(2)} ${selected.target} (${(change * 100).toFixed(2)}%)`;
  }

  function getInvestmentSuggestion(prediction: string, balance: number) {
    if (balance <= 0) return 'No available funds to invest.';
    if (prediction.includes('Uptrend')) return `Uptrend likely. Consider investing Rs. ${(balance * 0.5).toFixed(0)}`;
    if (prediction.includes('Downtrend')) return 'Downtrend likely. Consider holding or investing less.';
    return `Stable trend. You may invest Rs. ${(balance * 0.3).toFixed(0)}`;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f8fa' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Currency Pair</Text>
          <View style={styles.pairRow}>
            {PAIRS.map(pair => (
              <TouchableOpacity
                key={pair.label}
                style={[styles.pairButton, selected.label === pair.label && styles.pairButtonActive]}
                onPress={() => setSelected(pair)}
              >
                <Text style={selected.label === pair.label ? styles.pairButtonTextActive : styles.pairButtonText}>
                  {pair.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{selected.label} (Last 7 Days)</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : error ? (
            <Text style={{ color: 'red' }}>{error}</Text>
          ) : history.length > 0 ? (
            <LineChart
              data={{
                labels,
                datasets: [{ data: history }],
              }}
              width={screenWidth - 48}
              height={160}
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
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>AI Prediction</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <MaterialIcons name={trendIcon as MaterialIconName} size={24} color={trendColor} style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: trendColor }}>{prediction}</Text>
            <Text style={{ marginLeft: 8, color: '#888' }}>({confidence}% confidence)</Text>
          </View>
          <Text style={{ marginBottom: 8 }}>{getExplanation(history)}</Text>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>{getInvestmentSuggestion(prediction, balance)}</Text>
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Simulate Investment</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ marginRight: 6 }}>{selected.base}:</Text>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={styles.input}
                  placeholder={`e.g. 100`}
                  keyboardType="numeric"
                  value={simAmount}
                  onChangeText={setSimAmount}
                />
              </View>
              <TouchableOpacity
                style={styles.simButton}
                onPress={() => {
                  if (simAmount && !isNaN(Number(simAmount))) {
                    setSimResult(simulateInvestment(Number(simAmount)));
                  } else {
                    setSimResult('Enter a valid amount.');
                  }
                }}
              >
                <MaterialIcons name="play-arrow" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
            {simResult && <Text style={{ color: '#007AFF' }}>{simResult}</Text>}
          </View>
        </View>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>What does this mean?</Text>
          <Text style={{ color: '#555' }}>
            This predictor uses a simple moving average to analyze the last 7 days of forex data. The AI suggests trends and investment ideas, but always do your own research before investing.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 18,
    paddingBottom: 32,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007AFF',
  },
  pairRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pairButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f6f8fa',
  },
  pairButtonActive: {
    backgroundColor: '#007AFF',
  },
  pairButtonText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  pairButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    backgroundColor: '#f7f7f7',
    minWidth: 70,
    marginHorizontal: 2,
  },
  simButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 8,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PredictorScreen;
