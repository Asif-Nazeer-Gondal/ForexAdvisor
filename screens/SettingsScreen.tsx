// File: screens/SettingsScreen.tsx
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, Linking, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View, useColorScheme } from 'react-native';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const [notifications, setNotifications] = useState(true);
  const [news, setNews] = useState(true);
  const [darkMode, setDarkMode] = useState(colorScheme === 'dark');

  // Placeholder profile info
  const profile = {
    name: 'Sohaib Ahmed',
    email: 'your@email.com',
    avatar: require('../assets/logo.png'),
  };

  return (
    <View style={styles.flex1BgBackground}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Settings</Text>
        <MaterialIcons name="settings" size={28} color="#FFD700" />
      </View>
      <ScrollView style={styles.flex1} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <Image source={profile.avatar} style={{ width: 56, height: 56, borderRadius: 28, marginRight: 16 }} />
          <View>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>
          </View>
        </View>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionLabel}>Market Alerts</Text>
            <Switch value={notifications} onValueChange={setNotifications} thumbColor={notifications ? '#1DE9B6' : '#ccc'} trackColor={{ true: '#A7F3D0', false: '#eee' }} />
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionLabel}>Forex News</Text>
            <Switch value={news} onValueChange={setNews} thumbColor={news ? '#FFD700' : '#ccc'} trackColor={{ true: '#FEF08A', false: '#eee' }} />
          </View>
        </View>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Dark Mode</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} thumbColor={darkMode ? '#0A2540' : '#ccc'} trackColor={{ true: '#1DE9B6', false: '#eee' }} />
        </View>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Support & About</Text>
          <TouchableOpacity style={styles.rowCenter} onPress={() => Linking.openURL('mailto:support@forexadvisor.com')}>
            <MaterialIcons name="email" size={20} color="#1DE9B6" style={{ marginRight: 8 }} />
            <Text style={styles.sectionLabel}>Contact Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rowCenter} onPress={() => Linking.openURL('https://forexadvisor.com')}>
            <MaterialIcons name="public" size={20} color="#FFD700" style={{ marginRight: 8 }} />
            <Text style={styles.sectionLabel}>Visit Website</Text>
          </TouchableOpacity>
          <View style={styles.rowCenter}>
            <MaterialIcons name="info" size={20} color="#888" style={{ marginRight: 8 }} />
            <Text style={styles.appVersion}>App Version 1.0.0</Text>
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
    backgroundColor: '#0A2540',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 24,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  flex1: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  profileName: {
    color: '#0A2540',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
    marginBottom: 4,
  },
  profileEmail: {
    color: '#888',
    fontFamily: 'SpaceMono',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  sectionTitle: {
    color: '#0A2540',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: 'SpaceMono',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionLabel: {
    color: '#0A2540',
    fontFamily: 'SpaceMono',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  appVersion: {
    color: '#888',
    fontFamily: 'SpaceMono',
  },
});