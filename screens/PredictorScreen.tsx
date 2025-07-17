// screens/PredictorScreen.tsx
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    ScrollView,
    StatusBar,
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
    <View className="flex-1 bg-background">
      <StatusBar barStyle={theme.background === '#fff' ? 'dark-content' : 'light-content'} backgroundColor={theme.background} />
      
      {/* Header */}
      <View className="bg-primary rounded-b-3xl px-6 py-6 mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-white text-lg font-mono">AI-Powered</Text>
          <Text className="text-accent text-2xl font-bold font-mono">Forex Predictor</Text>
        </View>
        <TouchableOpacity onPress={loadHistory} className="bg-accent rounded-full p-3">
          <MaterialIcons name="refresh" size={24} color="#0A2540" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Pair Selector */}
        <View className="flex-row justify-between mb-4 px-2">
          {PAIRS.map(pair => (
            <TouchableOpacity
              key={pair.label}
              className={`flex-1 mx-1 px-2 py-2 rounded-lg items-center ${selected.label === pair.label ? 'bg-accent' : 'bg-white'}`}
              onPress={() => setSelected(pair)}
            >
              <FontAwesome5 name={pair.icon as any} size={18} color={selected.label === pair.label ? '#0A2540' : '#1DE9B6'} />
              <Text className={`font-mono text-xs mt-1 ${selected.label === pair.label ? 'text-primary font-bold' : 'text-primary'}`}>{pair.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Prediction Result */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow items-center">
          <Text className="text-primary text-lg font-bold mb-2 font-mono">Prediction</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#1DE9B6" />
          ) : error ? (
            <Text className="text-red-500 font-mono">{error}</Text>
          ) : (
            <>
              <View className="flex-row items-center mb-2">
                <MaterialIcons name={trendIcon as MaterialIconName} size={28} color={trendColor} style={{ marginRight: 8 }} />
                <Text className="text-primary text-xl font-bold font-mono">{prediction}</Text>
              </View>
              <Text className="text-primary font-mono mb-1">Confidence: {confidence}%</Text>
              <Text className="text-gray-600 font-mono mb-2 text-center">{getExplanation(history)}</Text>
              <Text className="text-accent font-mono text-center">{getInvestmentSuggestion(prediction, balance)}</Text>
            </>
          )}
        </View>

        {/* Chart */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow items-center">
          <Text className="text-primary text-lg font-bold mb-2 font-mono">7-Day Trend</Text>
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
            <Text className="text-gray-600 font-mono">No data available</Text>
          )}
        </View>

        {/* Investment Simulation */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow">
          <Text className="text-primary text-lg font-bold mb-2 font-mono">Investment Simulation</Text>
          <View className="flex-row items-center mb-2">
            <TextInput
              className="flex-1 text-base text-primary font-mono mr-2"
              placeholder={`Amount in ${selected.base}`}
              value={simAmount}
              onChangeText={setSimAmount}
              keyboardType="numeric"
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity onPress={handleSimulate} className="bg-accent rounded-full p-2">
              <MaterialIcons name="play-arrow" size={22} color="#0A2540" />
            </TouchableOpacity>
          </View>
          {simResult && <Text className="text-accent font-mono mt-1">{simResult}</Text>}
        </View>
      </ScrollView>
    </View>
  );
}
