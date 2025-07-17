// screens/HomeScreen.tsx

import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import logo from '../assets/logo.png';
import { useBudget } from '../hooks/useBudget';
import { fetchForexRatePair } from '../services/forexService';
import { useTheme } from '../theme/ThemeContext';

const HomeScreen: React.FC = () => {
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

  return (
    <View className="flex-1 bg-background">
      {/* Welcome Banner with Logo */}
      <View className="items-center py-6 bg-primary rounded-b-3xl mb-4">
        <Image source={logo} style={{ width: 60, height: 60, marginBottom: 8 }} />
        <Text className="text-white text-2xl font-bold font-mono">Welcome to ForexAdvisor</Text>
        <Text className="text-accent text-base mt-1 font-mono">Your Smart Forex Dashboard</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats Cards */}
        <View className="flex-row justify-around mb-6">
          {[{
            label: 'Balance',
            value: formatCurrency(balance || 0),
            icon: <FontAwesome5 name="wallet" size={24} color="#FFD700" />,
            color: 'bg-primary',
          }, {
            label: 'Income',
            value: formatCurrency(parseFloat(income) || 0),
            icon: <FontAwesome5 name="arrow-up" size={24} color="#1DE9B6" />,
            color: 'bg-accent',
          }, {
            label: 'Expenses',
            value: formatCurrency(totalExpenses || 0),
            icon: <FontAwesome5 name="arrow-down" size={24} color="#FF5A5F" />,
            color: 'bg-gold',
          }].map((stat, idx) => (
            <TouchableOpacity
              key={stat.label}
              activeOpacity={0.8}
              className={`flex-1 mx-2 p-4 rounded-2xl shadow-lg items-center ${stat.color}`}
              style={{
                transform: [{ translateY: idx === 1 ? 0 : 8 }],
                elevation: 4,
              }}
              onPress={() => {}}
            >
              {stat.icon}
              <Text className="text-white text-xs mt-2 font-mono">{stat.label}</Text>
              <Text className="text-white text-lg font-bold font-mono">{stat.value}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Forex Rates Section */}
        <View className="px-4 mb-6">
          <Text className="text-primary text-lg font-bold mb-2 font-mono">Live Forex Rates</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity className="flex-1 bg-white rounded-xl p-4 mr-2 shadow" activeOpacity={0.85}>
              <Text className="text-primary text-xs font-mono">USD/PKR</Text>
              <Text className="text-2xl font-bold text-primary font-mono">{usdPkr ? usdPkr.toFixed(2) : '--'}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-white rounded-xl p-4 ml-2 shadow" activeOpacity={0.85}>
              <Text className="text-primary text-xs font-mono">EUR/USD</Text>
              <Text className="text-2xl font-bold text-primary font-mono">{eurUsd ? eurUsd.toFixed(4) : '--'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* What's New / News Section */}
        <View className="px-4">
          <Text className="text-primary text-lg font-bold mb-2 font-mono">What's New</Text>
          <View className="bg-white rounded-xl p-4 shadow mb-2">
            <Text className="text-primary font-mono">• Daily market summary and top movers coming soon!</Text>
          </View>
          <View className="bg-white rounded-xl p-4 shadow">
            <Text className="text-primary font-mono">• AI-powered predictions and alerts will be available in the next update.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
