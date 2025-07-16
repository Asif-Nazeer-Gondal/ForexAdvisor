// screens/PredictorScreen.tsx
console.log("✅ PredictorScreen rendered");
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import fetchForexRate from '../services/forexService';

const PredictorScreen: React.FC = () => {
  const [usdAmount, setUsdAmount] = useState<string>('100');
  const [rate, setRate] = useState<number | null>(null);
  const [predictedPKR, setPredictedPKR] = useState<number | null>(null);

  const loadRate = async () => {
    try {
      const currentRate = await fetchForexRate();
      setRate(currentRate);
    } catch (error) {
      console.error('Error fetching rate:', error);
    }
  };

  const calculatePrediction = () => {
    const usd = parseFloat(usdAmount);
    if (!isNaN(usd) && rate) {
      setPredictedPKR(parseFloat((usd * rate).toFixed(2)));
    }
  };

  useEffect(() => {
    loadRate();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>📈 Forex Predictor</Text>

          <Text style={styles.label}>Enter Amount in USD:</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 100"
            keyboardType="numeric"
            value={usdAmount}
            onChangeText={setUsdAmount}
          />

          <TouchableOpacity style={styles.button} onPress={calculatePrediction}>
            <Text style={styles.buttonText}>Predict</Text>
          </TouchableOpacity>

          {predictedPKR !== null && (
            <Text style={styles.result}>
              {usdAmount} USD ≈ {predictedPKR} PKR
            </Text>
          )}

          {rate && (
            <Text style={styles.rateText}>Current Rate: 1 USD = {rate.toFixed(2)} PKR</Text>
          )}

          {!rate && (
            <Text style={styles.errorText}>❌ Unable to fetch forex rate.</Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PredictorScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 24,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  result: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  rateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    textAlign: 'center',
  },
});
