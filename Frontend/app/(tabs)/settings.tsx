import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, TextInput, Picker, FlatList, TouchableOpacity } from 'react-native';
import { scheduleInvestmentReminder, addRateAlert, getRateAlerts, removeRateAlert, RateAlert } from '../../hooks/useInvestments';
import { getUser, signOut } from '../../services/authService';

const PAIRS = [
  'USD/PKR', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'EUR/PKR', 'GBP/PKR'
];

export default function SettingsScreen() {
  const [alerts, setAlerts] = useState<RateAlert[]>([]);
  const [pair, setPair] = useState(PAIRS[0]);
  const [threshold, setThreshold] = useState('');
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setAlerts(await getRateAlerts());
      const { data } = await getUser();
      setEmail(data?.user?.email || null);
    })();
  }, []);

  const handleAddAlert = async () => {
    if (!threshold || isNaN(Number(threshold))) {
      Alert.alert('Invalid threshold');
      return;
    }
    await addRateAlert({ pair, threshold: Number(threshold), direction });
    setAlerts(await getRateAlerts());
    setThreshold('');
    Alert.alert('Alert Added', `You'll be notified when ${pair} is ${direction} ${threshold}`);
  };

  const handleRemoveAlert = async (index: number) => {
    await removeRateAlert(index);
    setAlerts(await getRateAlerts());
  };

  const handleSchedule = async (frequency: 'daily' | 'weekly' | 'monthly') => {
    await scheduleInvestmentReminder(frequency, 9, 0);
    Alert.alert('Reminder Set', `You will receive a ${frequency} investment reminder at 9:00 AM.`);
  };

  const handleLogout = async () => {
    await signOut();
    // Reload app/auth state (simple way: reload window)
    if (typeof window !== 'undefined') window.location.reload();
  };

  return (
    <View style={styles.container}>
      {email && <Text style={styles.userInfo}>Logged in as: {email}</Text>}
      <Text style={styles.header}>Settings</Text>
      <Text style={styles.section}>Investment Reminders</Text>
      <Button title="Set Daily Reminder (9:00 AM)" onPress={() => handleSchedule('daily')} />
      <Button title="Set Weekly Reminder (Mon 9:00 AM)" onPress={() => handleSchedule('weekly')} />
      <Button title="Set Monthly Reminder (1st, 9:00 AM)" onPress={() => handleSchedule('monthly')} />
      <Text style={styles.section}>Forex Rate Alerts</Text>
      <View style={styles.row}>
        <Picker
          selectedValue={pair}
          style={{ flex: 1 }}
          onValueChange={setPair}
        >
          {PAIRS.map(p => <Picker.Item key={p} label={p} value={p} />)}
        </Picker>
        <TextInput
          style={styles.input}
          placeholder="Threshold"
          keyboardType="numeric"
          value={threshold}
          onChangeText={setThreshold}
        />
        <Picker
          selectedValue={direction}
          style={{ width: 100 }}
          onValueChange={v => setDirection(v)}
        >
          <Picker.Item label=">=" value="above" />
          <Picker.Item label="<=" value="below" />
        </Picker>
        <Button title="Add" onPress={handleAddAlert} />
      </View>
      <FlatList
        data={alerts}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.alertRow}>
            <Text>{item.pair} {item.direction === 'above' ? '>=' : '<='} {item.threshold}</Text>
            <TouchableOpacity onPress={() => handleRemoveAlert(index)}>
              <Text style={{ color: '#fa709a', marginLeft: 8 }}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: '#888', marginTop: 8 }}>No alerts set.</Text>}
      />
      <View style={{ flex: 1 }} />
      <Button title="Logout" color="#fa709a" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f5f7fa' },
  userInfo: { color: '#222', fontWeight: 'bold', marginBottom: 8, fontSize: 16 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  section: { fontSize: 16, fontWeight: 'bold', marginVertical: 12 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 6, width: 80, marginHorizontal: 8, backgroundColor: '#fff' },
  alertRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
});
