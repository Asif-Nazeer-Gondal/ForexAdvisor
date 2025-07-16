// screens/HomeScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import fetchForexRate from '../services/forexService';

const HomeScreen: React.FC = () => {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const loadRate = async () => {
    setLoading(true);
    try {
      const fetchedRate = await fetchForexRate();
      setRate(fetchedRate);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to fetch rate:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRate();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live USD to PKR Rate</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <>
          <Text style={styles.rateText}>
            {rate ? `1 USD = ${rate.toFixed(2)} PKR` : 'Rate not available'}
          </Text>
          <Text style={styles.updatedText}>Last updated: {lastUpdated}</Text>
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={loadRate}>
        <Text style={styles.buttonText}>Refresh Rate</Text>
      </TouchableOpacity>
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
});
