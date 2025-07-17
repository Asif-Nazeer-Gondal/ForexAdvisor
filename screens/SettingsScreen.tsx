// File: screens/SettingsScreen.tsx
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, Linking, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function SettingsScreen() {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [news, setNews] = useState(true);
  const [darkMode, setDarkMode] = useState(theme.mode === 'dark');

  // Placeholder profile info
  const profile = {
    name: 'Sohaib Ahmed',
    email: 'your@email.com',
    avatar: require('../assets/logo.png'),
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Header */}
      <View className="bg-primary rounded-b-3xl px-6 py-6 mb-4 flex-row items-center justify-between">
        <Text className="text-white text-2xl font-bold font-mono">Settings</Text>
        <MaterialIcons name="settings" size={28} color="#FFD700" />
      </View>

      {/* Profile Info */}
      <View className="bg-white rounded-2xl p-5 mb-6 shadow flex-row items-center">
        <Image source={profile.avatar} style={{ width: 56, height: 56, borderRadius: 28, marginRight: 16 }} />
        <View>
          <Text className="text-primary text-lg font-bold font-mono mb-1">{profile.name}</Text>
          <Text className="text-gray-600 font-mono">{profile.email}</Text>
        </View>
      </View>

      {/* Notification Preferences */}
      <View className="bg-white rounded-2xl p-5 mb-6 shadow">
        <Text className="text-primary text-lg font-bold mb-3 font-mono">Notifications</Text>
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-primary font-mono">Market Alerts</Text>
          <Switch value={notifications} onValueChange={setNotifications} thumbColor={notifications ? '#1DE9B6' : '#ccc'} trackColor={{ true: '#A7F3D0', false: '#eee' }} />
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-primary font-mono">Forex News</Text>
          <Switch value={news} onValueChange={setNews} thumbColor={news ? '#FFD700' : '#ccc'} trackColor={{ true: '#FEF08A', false: '#eee' }} />
        </View>
      </View>

      {/* Theme Toggle */}
      <View className="bg-white rounded-2xl p-5 mb-6 shadow flex-row items-center justify-between">
        <Text className="text-primary text-lg font-bold font-mono">Dark Mode</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} thumbColor={darkMode ? '#0A2540' : '#ccc'} trackColor={{ true: '#1DE9B6', false: '#eee' }} />
      </View>

      {/* Support & About */}
      <View className="bg-white rounded-2xl p-5 shadow">
        <Text className="text-primary text-lg font-bold mb-3 font-mono">Support & About</Text>
        <TouchableOpacity className="flex-row items-center mb-2" onPress={() => Linking.openURL('mailto:support@forexadvisor.com')}>
          <MaterialIcons name="email" size={20} color="#1DE9B6" style={{ marginRight: 8 }} />
          <Text className="text-primary font-mono">Contact Support</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center mb-2" onPress={() => Linking.openURL('https://forexadvisor.com')}>
          <MaterialIcons name="public" size={20} color="#FFD700" style={{ marginRight: 8 }} />
          <Text className="text-primary font-mono">Visit Website</Text>
        </TouchableOpacity>
        <View className="flex-row items-center mt-2">
          <MaterialIcons name="info" size={20} color="#888" style={{ marginRight: 8 }} />
          <Text className="text-gray-600 font-mono">App Version 1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}