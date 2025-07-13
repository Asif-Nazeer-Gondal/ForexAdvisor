import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Button, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BudgetData {
  income: string;
  expenses: string;
  savings: string;
  investment: string;
}

const BudgetCalculator: React.FC = () => {
  const [data, setData] = useState<BudgetData>({
    income: '',
    expenses: '',
    savings: '',
    investment: '',
  });

  const [balance, setBalance] = useState<number>(0);

  const STORAGE_KEY = 'budget_data';

  const calculateBalance = (budget: BudgetData) => {
    const income = parseFloat(budget.income) || 0;
    const expenses = parseFloat(budget.expenses) || 0;
    const savings = parseFloat(budget.savings) || 0;
    const investment = parseFloat(budget.investment) || 0;
    const result = income - (expenses + savings + investment);
    setBalance(result);
  };

  const handleChange = (field: keyof BudgetData, value: string) => {
    const updatedData = { ...data, [field]: value };
    setData(updatedData);
    calculateBalance(updatedData);
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving budget data:', error);
    }
  };

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: BudgetData = JSON.parse(saved);
        setData(parsed);
        calculateBalance(parsed);
      }
    } catch (error) {
      console.error('Error loading budget data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>💸 Budget Calculator</Text>

        {['income', 'expenses', 'savings', 'investment'].map((field) => (
          <View key={field} style={styles.inputContainer}>
            <Text style={styles.label}>{field.toUpperCase()}</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder={`Enter ${field}`}
              value={data[field as keyof BudgetData]}
              onChangeText={(value) => handleChange(field as keyof BudgetData, value)}
            />
          </View>
        ))}

        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>Remaining Balance</Text>
          <Text style={[styles.balance, balance >= 0 ? styles.positive : styles.negative]}>
            {balance.toFixed(2)} PKR
          </Text>
        </View>

        <Button title="💾 Save Budget" onPress={saveData} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default BudgetCalculator;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inner: {
    padding: 20,
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 10,
  },
  label: {
    marginBottom: 4,
    fontWeight: '600',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  resultContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 18,
    fontWeight: '500',
  },
  balance: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  positive: {
    color: 'green',
  },
  negative: {
    color: 'red',
  },
});
