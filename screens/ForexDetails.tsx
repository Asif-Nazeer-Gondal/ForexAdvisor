// screens/ForexDetails.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ForexDetails: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Forex Prediction</Text>
      <Text style={styles.info}>This feature will show future USD to PKR trends using AI or market data.</Text>
      <Text style={styles.placeholder}>🚧 Coming Soon 🚧</Text>
    </View>
  );
};

export default ForexDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  info: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
  },
  placeholder: {
    fontSize: 20,
    color: '#888',
    marginTop: 20,
  },
});
