import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Picker, Alert } from 'react-native';
import { useInvestments } from '../../hooks/useInvestments';
import { fetchForexRatePair } from '../../services/forexService';

const PAIRS = [
  { label: 'USD/PKR', base: 'USD', target: 'PKR' },
  { label: 'EUR/USD', base: 'EUR', target: 'USD' },
  { label: 'GBP/USD', base: 'GBP', target: 'USD' },
  { label: 'USD/JPY', base: 'USD', target: 'JPY' },
];

export function NewInvestmentForm() {
  const { addInvestment, wallet } = useInvestments();
  const [selected, setSelected] = useState(PAIRS[0]);
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRate = async () => {
    setLoading(true);
    try {
      const r = await fetchForexRatePair(selected.base, selected.target);
      setRate(r);
    } catch (e) {
      Alert.alert('Error', 'Failed to fetch rate');
    } finally {
      setLoading(false);
    }
  };

  const handleInvest = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Error', 'Enter a valid amount');
      return;
    }
    if (!rate) {
      Alert.alert('Error', 'Fetch the latest rate first');
      return;
    }
    if (Number(amount) > wallet) {
      Alert.alert('Error', 'Not enough balance');
      return;
    }
    await addInvestment(`${selected.base}/${selected.target}`, Number(amount), rate);
    setAmount('');
    setRate(null);
    Alert.alert('Success', 'Investment added!');
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>New Investment</Text>
      <Text>Pair:</Text>
      {/* Picker for currency pair */}
      <Picker
        selectedValue={selected.label}
        onValueChange={(_, idx) => setSelected(PAIRS[idx])}
        style={styles.picker}
      >
        {PAIRS.map(pair => (
          <Picker.Item key={pair.label} label={pair.label} value={pair.label} />
        ))}
      </Picker>
      <Text>Amount:</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="Enter amount"
      />
      <Button title={rate ? `Rate: ${rate}` : loading ? 'Fetching Rate...' : 'Fetch Rate'} onPress={fetchRate} disabled={loading} />
      <Button title="Invest" onPress={handleInvest} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', margin: 8, padding: 16, borderRadius: 8, elevation: 2 },
  title: { fontWeight: 'bold', fontSize: 18, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginVertical: 8 },
  picker: { height: 44, marginVertical: 8 },
}); 