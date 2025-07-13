// components/ForexRateCard.tsx
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ForexRateCardProps {
  rate: number;
}

const ForexRateCard: React.FC<ForexRateCardProps> = ({ rate }) => (
  <View style={styles.card}>
    <Text style={styles.title}>USD → PKR</Text>
    <Text style={styles.rate}>Rs. {rate.toFixed(2)}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginVertical: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  rate: {
    fontSize: 16,
    color: '#333',
  },
});

export default ForexRateCard;
