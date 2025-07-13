// screens/ForexRates.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { fetchForexRate } from '../services/forexService';

const ForexRates: React.FC = () => {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getRate = async () => {
      try {
        const result = await fetchForexRate();
        setRate(result);
      } catch (err) {
        setError('Unable to fetch forex rate');
      } finally {
        setLoading(false);
      }
    };

    getRate();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💱 Live Forex Rate</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <Text style={styles.rate}>1 USD = {rate?.toFixed(2)} PKR</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  rate: {
    fontSize: 22,
    textAlign: 'center',
    color: 'green',
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
});

export default ForexRates;
