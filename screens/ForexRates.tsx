// screens/ForexRates.tsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { fetchForexRatePair } from '../services/forexService';

const ForexRates: React.FC = () => {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRate = async () => {
      try {
        const fetchedRate = await fetchForexRatePair('USD', 'PKR');
        setRate(fetchedRate);
      } catch (error) {
        console.error('Error fetching USD to PKR rate:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRate();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💱 USD to PKR Rate</Text>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Text style={styles.rate}>
          {rate ? `1 USD = ${rate} PKR` : 'Rate not available'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  rate: { fontSize: 20, color: 'green' },
});

export default ForexRates;
