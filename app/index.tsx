import * as React from 'react';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { fetchUSDtoPKR } from '../services/forexService'; // removed .js
import ForexRateCard from '../components/ForexRateCard';   // ensure .tsx exists

export default function HomeScreen() {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUSDtoPKR()
      .then(setRate)
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Live Forex Rate</Text>
      {loading && <ActivityIndicator size="large" color="#007AFF" />}
      {error && <Text style={styles.error}>Error: {error}</Text>}
      {rate && <ForexRateCard rate={rate} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
});
