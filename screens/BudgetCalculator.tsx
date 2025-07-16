// screens/BudgetCalculator.tsx

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BudgetCalculator: React.FC = () => {
  const [income, setIncome] = useState<string>('');
  const [expenses, setExpenses] = useState<string>('');
  const [savings, setSavings] = useState<number | null>(null);

  const calculateSavings = () => {
    const incomeVal = parseFloat(income);
    const expenseVal = parseFloat(expenses);

    if (!isNaN(incomeVal) && !isNaN(expenseVal)) {
      const calculated = incomeVal - expenseVal;
      setSavings(calculated);
      AsyncStorage.setItem('savings', JSON.stringify(calculated));
    }
  };

  useEffect(() => {
    const loadSaved = async () => {
      const saved = await AsyncStorage.getItem('savings');
      if (saved) setSavings(parseFloat(saved));
    };
    loadSaved();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>💰 Budget Calculator</Text>

        <Text style={styles.label}>Monthly Income:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your income"
          keyboardType="numeric"
          value={income}
          onChangeText={setIncome}
        />

        <Text style={styles.label}>Monthly Expenses:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your expenses"
          keyboardType="numeric"
          value={expenses}
          onChangeText={setExpenses}
        />

        <TouchableOpacity style={styles.button} onPress={calculateSavings}>
          <Text style={styles.buttonText}>Calculate Savings</Text>
        </TouchableOpacity>

        {savings !== null && (
          <Text style={styles.result}>Remaining Savings: Rs. {savings}</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default BudgetCalculator;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  result: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
