// File: screens/SettingsScreen.tsx
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

const PAIRS = [
  { label: 'USD/PKR', value: 'USD/PKR' },
  { label: 'EUR/USD', value: 'EUR/USD' },
  { label: 'GBP/USD', value: 'GBP/USD' },
  { label: 'USD/JPY', value: 'USD/JPY' },
];

const SETTINGS_KEY = 'app_settings_v1';

const SettingsScreen: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [defaultPair, setDefaultPair] = useState('USD/PKR');
  const [reminder, setReminder] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setTheme(parsed.theme || 'light');
        setDefaultPair(parsed.defaultPair || 'USD/PKR');
        setReminder(!!parsed.reminder);
      }
      setLoading(false);
    })();
  }, []);

  const saveSettings = async (next?: Partial<{ theme: string; defaultPair: string; reminder: boolean }>) => {
    const newSettings = {
      theme: next?.theme ?? theme,
      defaultPair: next?.defaultPair ?? defaultPair,
      reminder: next?.reminder ?? reminder,
    };
    setTheme(newSettings.theme as 'light' | 'dark');
    setDefaultPair(newSettings.defaultPair);
    setReminder(newSettings.reminder);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  };

  if (loading) return <View style={styles.container}><Text>Loading...</Text></View>;

  return (
    <View style={[styles.container, { backgroundColor: '#f6f8fa' }]}> 
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Theme</Text>
        <View style={styles.rowBetween}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialIcons name={theme === 'dark' ? 'dark-mode' : 'light-mode'} size={22} color="#007AFF" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 15 }}>{theme === 'dark' ? 'Dark' : 'Light'} Mode</Text>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={v => saveSettings({ theme: v ? 'dark' : 'light' })}
            thumbColor={theme === 'dark' ? '#222' : '#fff'}
            trackColor={{ false: '#ccc', true: '#007AFF' }}
          />
        </View>
      </View>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Default Currency Pair</Text>
        <View style={styles.rowBetween}>
          <MaterialIcons name="swap-horiz" size={22} color="#007AFF" style={{ marginRight: 8 }} />
          <Picker
            selectedValue={defaultPair}
            style={{ flex: 1, backgroundColor: '#f7f7f7', borderRadius: 8 }}
            onValueChange={(v: string) => saveSettings({ defaultPair: v })}
            mode={Platform.OS === 'ios' ? 'dropdown' : 'dialog'}
          >
            {PAIRS.map(pair => (
              <Picker.Item key={pair.value} label={pair.label} value={pair.value} />
            ))}
          </Picker>
        </View>
      </View>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Daily Reminder</Text>
        <View style={styles.rowBetween}>
          <MaterialIcons name="notifications-active" size={22} color="#007AFF" style={{ marginRight: 8 }} />
          <Switch
            value={reminder}
            onValueChange={v => saveSettings({ reminder: v })}
            thumbColor={reminder ? '#007AFF' : '#fff'}
            trackColor={{ false: '#ccc', true: '#007AFF' }}
          />
        </View>
      </View>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={{ color: '#555', marginBottom: 4 }}>ForexAdvisor v1.0</Text>
        <Text style={{ color: '#555' }}>Made with ❤️ by Asif Gondal</Text>
        <TouchableOpacity onPress={() => {}} style={{ marginTop: 8 }}>
          <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>Visit GitHub</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    paddingBottom: 32,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007AFF',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default SettingsScreen;