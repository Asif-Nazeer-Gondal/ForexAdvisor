// screens/ForexRates.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { fetchForexRate } from '../services/forexService';

const ForexRates: React.FC = () => {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getRate = async () => {
      try {
        const forexRate = await fetchForexRate('USD', 'PKR');
        setRate(forexRate);
      } catch {
        setRate(null);
      } finally {
        setLoading(false);
      }
    };

    getRate();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💱 USD to PKR</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : rate !== null ? (
        <Text style={styles.rate}>{`1 USD = ${rate.toFixed(2)} PKR`}</Text>
      ) : (
        <Text style={styles.error}>Failed to load rate.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  rate: {
    fontSize: 22,
    textAlign: 'center',
  },
  error: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
});

export default ForexRates;
