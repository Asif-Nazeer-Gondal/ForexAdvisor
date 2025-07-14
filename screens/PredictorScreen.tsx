// screens/PredictorScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { getPrediction } from '../utils/predictorLogic';
import { RootStackParamList } from '../types/navigation'; // ✅ correct if one folder up

const PredictorScreen = () => {
  const [prices, setPrices] = useState<number[]>([]);
  const [prediction, setPrediction] = useState<string>('');

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('https://api.twelvedata.com/time_series?symbol=USD/PKR&interval=1day&apikey=YOUR_API_KEY');
        const data = await response.json();
        const priceArray = data?.values?.slice(0, 7).map((item: any) => parseFloat(item.close));
        if (priceArray) {
          setPrices(priceArray.reverse());
          setPrediction(getPrediction(priceArray));
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchPrices();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Forex Prediction</Text>
      {prices.length === 0 ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <Text>Last 7 Prices: {prices.join(', ')}</Text>
          <Text style={styles.prediction}>Prediction: {prediction}</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  prediction: { marginTop: 20, fontSize: 18, color: 'green' },
});

export default PredictorScreen;
