// app/(tabs)/calculator.tsx
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useState } from 'react';

export default function CalculatorScreen() {
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');
  const [savings, setSavings] = useState<number | null>(null);

  const calculateSavings = () => {
    const totalIncome = parseFloat(income);
    const totalExpenses = parseFloat(expenses);
    if (!isNaN(totalIncome) && !isNaN(totalExpenses)) {
      setSavings(totalIncome - totalExpenses);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Monthly Income (PKR):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={income}
        onChangeText={setIncome}
        placeholder="e.g. 50000"
      />
      <Text style={styles.label}>Monthly Expenses (PKR):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={expenses}
        onChangeText={setExpenses}
        placeholder="e.g. 30000"
      />
      <Button title="Calculate Savings" onPress={calculateSavings} />
      {savings !== null && (
        <Text style={styles.result}>Estimated Savings: {savings} PKR</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontSize: 16, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginTop: 5,
    marginBottom: 10,
    borderRadius: 8,
  },
  result: { marginTop: 15, fontSize: 18, fontWeight: 'bold' },
});
