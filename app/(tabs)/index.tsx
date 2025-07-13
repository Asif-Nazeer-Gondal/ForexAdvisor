// app/index.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { fetchForexRate } from '../../services/forexService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const HomeScreen: React.FC = () => {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadRate = async () => {
      try {
        const cached = await AsyncStorage.getItem('cachedRate');
        if (cached) setRate(parseFloat(cached));

        const latest = await fetchForexRate();
        setRate(latest);
        await AsyncStorage.setItem('cachedRate', latest.toString());
      } catch (err) {
        console.error('Error loading forex rate:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRate();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ForexAdvisor 💸</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" />
      ) : (
        <Text style={styles.rate}>USD to PKR: {rate}</Text>
      )}
      <View style={styles.buttonGroup}>
        <Button title="See More Details" onPress={() => router.push('/forex-details')} />
        <Button title="Calculate Budget" onPress={() => router.push('/budget')} />
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  rate: { fontSize: 20, marginVertical: 15 },
  buttonGroup: { width: '100%', gap: 10, marginTop: 20 },
});
