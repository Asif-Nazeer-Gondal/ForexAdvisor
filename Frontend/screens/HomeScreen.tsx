// screens/HomeScreen.tsx

import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import logo from '../assets/logo.png';
import { useBudget } from '../hooks/useBudget';
import { fetchForexRatePair } from '../services/forexService';
import { useTheme } from '../theme/ThemeContext';

export default function HomeScreen() {
  const { theme } = useTheme();
  const [usdPkr, setUsdPkr] = useState<number | null>(null);
  const [eurUsd, setEurUsd] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);
  const { income, categories, totalExpenses, balance } = useBudget();

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  const loadRates = async () => {
    setLoading(true);
    try {
      const usdPkrRate = await fetchForexRatePair('USD', 'PKR');
      const eurUsdRate = await fetchForexRatePair('EUR', 'USD');
      setUsdPkr(usdPkrRate);
      setEurUsd(eurUsdRate);
    } catch (error) {
      Alert.alert('Network Error', 'Unable to fetch live forex rates.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadRates();
    } catch (error) {
      // handle error
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRates();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const refreshControl = (
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  );

  const stats = [
    {
      label: 'Balance',
      value: formatCurrency(balance || 0),
      icon: <FontAwesome5 name="wallet" size={24} color="#FFD700" />,
      color: '#0A2540',
      onPress: () => {},
    },
    {
      label: 'Income',
      value: formatCurrency(parseFloat(income) || 0),
      icon: <FontAwesome5 name="arrow-up" size={24} color="#1DE9B6" />,
      color: '#1DE9B6',
      onPress: () => {},
    },
    {
      label: 'Expenses',
      value: formatCurrency(totalExpenses || 0),
      icon: <FontAwesome5 name="arrow-down" size={24} color="#FF5A5F" />,
      color: '#FF5A5F',
      onPress: () => {},
    },
  ];

  return (
    <View style={styles.flex1BgBackground}>
      <View style={styles.headerContainer}>
        <Image source={logo} style={styles.logo} />
        <View>
          <Text style={styles.headerTitle}>Welcome to ForexAdvisor</Text>
          <Text style={styles.headerSubtitle}>Your Smart Forex Dashboard</Text>
        </View>
      </View>
      <ScrollView style={styles.flex1} contentContainerStyle={{ paddingBottom: 32 }} refreshControl={refreshControl} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          {stats.map(stat => (
            <TouchableOpacity
              key={stat.label}
              style={[styles.statCard, { backgroundColor: stat.color }]}
              activeOpacity={0.85}
              onPress={stat.onPress}
            >
              {stat.icon}
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Live Forex Rates</Text>
          <View style={styles.ratesRow}>
            <TouchableOpacity style={[styles.rateCard, { marginRight: 8 }]} activeOpacity={0.85}>
              <Text style={styles.rateLabel}>USD/PKR</Text>
              <Text style={styles.rateValue}>{usdPkr ? usdPkr.toFixed(2) : '--'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.rateCard, { marginLeft: 8 }]} activeOpacity={0.85}>
              <Text style={styles.rateLabel}>EUR/USD</Text>
              <Text style={styles.rateValue}>{eurUsd ? eurUsd.toFixed(4) : '--'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>What's New</Text>
          <View style={styles.newsCard}>
            <Text style={styles.newsText}>• Daily market summary and top movers coming soon!</Text>
          </View>
          <View style={styles.newsCard}>
            <Text style={styles.newsText}>• AI-powered predictions and alerts will be available in the next update.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1BgBackground: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
    backgroundColor: '#0A2540',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  logo: {
    width: 48,
    height: 48,
    marginRight: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  headerSubtitle: {
    color: '#1DE9B6',
    fontSize: 16,
    fontFamily: 'SpaceMono',
    marginTop: 4,
  },
  flex1: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 8,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  statLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
    fontFamily: 'SpaceMono',
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#0A2540',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'SpaceMono',
  },
  ratesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rateCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  rateLabel: {
    color: '#0A2540',
    fontSize: 12,
    fontFamily: 'SpaceMono',
  },
  rateValue: {
    color: '#0A2540',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  newsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  newsText: {
    color: '#0A2540',
    fontFamily: 'SpaceMono',
  },
});
