import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Constants from 'expo-constants';

const {
  TWELVE_DATA_API_KEY,
  EXCHANGE_RATE_API_KEY,
  CURRENCY_API_KEY
} = Constants.expoConfig.extra;

export default function HomeScreen() {
  useEffect(() => {
    console.log("Twelve API Key:", TWELVE_DATA_API_KEY);
    console.log("ExchangeRate API Key:", EXCHANGE_RATE_API_KEY);
    console.log("CurrencyAPI Key:", CURRENCY_API_KEY);
  }, []);

  return (
    <View>
      <Text>Testing API Keys. Check browser console.</Text>
    </View>
  );
}
