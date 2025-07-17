// screens/PredictorScreen.tsx
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useBudget } from '../hooks/useBudget';
import { fetchHistoricalRates } from '../services/forexService';
import { useTheme } from '../theme/ThemeContext';
import { getPrediction } from '../utils/predictorLogic';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>["name"];

const screenWidth = Dimensions.get('window').width;

const PAIRS = [
  { label: 'USD/PKR', base: 'USD', target: 'PKR', icon: 'dollar-sign' },
  { label: 'EUR/USD', base: 'EUR', target: 'USD', icon: 'euro-sign' },
  { label: 'GBP/USD', base: 'GBP', target: 'USD', icon: 'pound-sign' },
  { label: 'USD/JPY', base: 'USD', target: 'JPY', icon: 'yen-sign' },
];

export default function PredictorScreen() {
  const { theme } = useTheme();
  const [selected, setSelected] = useState(PAIRS[0]);
  const [history, setHistory] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [prediction, setPrediction] = useState('');
  const { balance } = useBudget();
  const [simAmount, setSimAmount] = useState('');
  const [simResult, setSimResult] = useState<string | null>(null);

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

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

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
  let trendGradient: [string, string] = ['#888', '#666'];
  
  if (prediction.includes('Uptrend')) { 
    trendIcon = 'trending-up'; 
    trendColor = '#43e97b'; 
    trendGradient = ['#43e97b', '#38f9d7'];
  }
  else if (prediction.includes('Downtrend')) { 
    trendIcon = 'trending-down'; 
    trendColor = '#fa709a'; 
    trendGradient = ['#fa709a', '#fee140'];
  }

  function getExplanation(prices: number[]): string {
    if (prices.length < 4) return 'Not enough data for a detailed explanation.';
    const last = prices.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    if (last > avg) return 'The last 3 days\' average is higher than the week\'s average, indicating an uptrend.';
    if (last < avg) return 'The last 3 days\' average is lower than the week\'s average, indicating a downtrend.';
    return 'The last 3 days\' average is about the same as the week\'s average, indicating a stable trend.';
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

  const handleSimulate = () => {
    if (simAmount && !isNaN(Number(simAmount))) {
      setSimResult(simulateInvestment(Number(simAmount)));
    } else {
      Alert.alert('Error', 'Please enter a valid amount.');
    }
  };

  return (
    <View style={styles.flex1BgBackground}>
      <StatusBar barStyle={theme.background === '#fff' ? 'dark-content' : 'light-content'} backgroundColor={theme.background} />
      
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>AI-Powered</Text>
        <Text style={styles.headerSubtitle}>Forex Predictor</Text>
        <TouchableOpacity onPress={loadHistory} style={styles.loadButton}>
          <Text style={styles.loadButtonText}>Load</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Pair Selector */}
        <View style={styles.pairRow}>
          {PAIRS.map(pair => (
            <TouchableOpacity
              key={pair.label}
              style={[styles.pairButton, selected.label === pair.label && styles.pairButtonActive]}
              onPress={() => setSelected(pair)}
            >
              <Text style={[styles.pairButtonText, selected.label === pair.label && styles.pairButtonTextActive]}>{pair.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Prediction Result */}
        <View style={styles.predictionCard}>
          <Text style={styles.predictionTitle}>Prediction</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#1DE9B6" />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <>
              <View style={styles.predictionRow}>
                <Text style={styles.predictionValue}>{prediction}</Text>
              </View>
              <Text style={styles.confidenceText}>Confidence: {confidence}%</Text>
              <Text style={styles.explanationText}>{getExplanation(history)}</Text>
              <Text style={styles.suggestionText}>{getInvestmentSuggestion(prediction, balance)}</Text>
            </>
          )}
        </View>

        {/* Chart */}
        <View style={styles.trendCard}>
          <Text style={styles.trendTitle}>7-Day Trend</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#1DE9B6" />
          ) : history.length > 0 ? (
            <LineChart
              data={{
                labels,
                datasets: [{ data: history }],
              }}
              width={screenWidth}
              height={180}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                color: (opacity = 1) => `rgba(10,37,64,${opacity})`,
                labelColor: (opacity = 1) => `rgba(29,233,182,${opacity})`,
                propsForDots: { r: '4', strokeWidth: '2', stroke: '#1DE9B6' },
                strokeWidth: 3,
              }}
              bezier
              style={{ borderRadius: 16 }}
            />
          ) : (
            <Text style={styles.noDataText}>No data available</Text>
          )}
        </View>

        {/* Investment Simulation */}
        <View style={styles.simulationCard}>
          <Text style={styles.simulationTitle}>Investment Simulation</Text>
          <View style={styles.simulationRow}>
            <TextInput
              style={styles.input}
              placeholder={`Amount in ${selected.base}`}
              value={simAmount}
              onChangeText={setSimAmount}
              keyboardType="numeric"
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity onPress={handleSimulate} style={styles.simulateButton}>
              <Text style={styles.simulateButtonText}>Simulate</Text>
            </TouchableOpacity>
          </View>
          {simResult && <Text style={styles.simResultText}>{simResult}</Text>}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1BgBackground: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  headerContainer: {
    backgroundColor: '#0A2540',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 24,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'SpaceMono',
  },
  headerSubtitle: {
    color: '#1DE9B6',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  loadButton: {
    backgroundColor: '#1DE9B6',
    borderRadius: 24,
    padding: 12,
  },
  loadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  flex1: {
    flex: 1,
  },
  pairRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  pairButton: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  pairButtonActive: {
    backgroundColor: '#1DE9B6',
  },
  pairButtonText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: '#0A2540',
  },
  pairButtonTextActive: {
    fontWeight: 'bold',
    color: '#0A2540',
  },
  predictionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  predictionTitle: {
    color: '#0A2540',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'SpaceMono',
  },
  errorText: {
    color: '#FF5252',
    fontFamily: 'SpaceMono',
  },
  predictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  predictionValue: {
    color: '#0A2540',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  confidenceText: {
    color: '#0A2540',
    fontFamily: 'SpaceMono',
    marginBottom: 4,
  },
  explanationText: {
    color: '#888',
    fontFamily: 'SpaceMono',
    marginBottom: 4,
    textAlign: 'center',
  },
  suggestionText: {
    color: '#1DE9B6',
    fontFamily: 'SpaceMono',
    textAlign: 'center',
  },
  trendCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  trendTitle: {
    color: '#0A2540',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'SpaceMono',
  },
  noDataText: {
    color: '#888',
    fontFamily: 'SpaceMono',
  },
  simulationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  simulationTitle: {
    color: '#0A2540',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'SpaceMono',
  },
  simulationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#0A2540',
    fontFamily: 'SpaceMono',
    marginRight: 8,
  },
  simulateButton: {
    backgroundColor: '#1DE9B6',
    borderRadius: 16,
    padding: 10,
  },
  simulateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  simResultText: {
    color: '#1DE9B6',
    fontFamily: 'SpaceMono',
    marginTop: 8,
  },
});
