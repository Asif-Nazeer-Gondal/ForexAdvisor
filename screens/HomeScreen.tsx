// File: screens/HomeScreen.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const HomeScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>📊 Welcome to ForexAdvisor</Text>
    <Text style={styles.subtitle}>Track your USD to PKR rate & manage your budget!</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 10,
  },
});

export default HomeScreen;
