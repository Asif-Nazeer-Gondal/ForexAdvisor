// screens/BudgetCalculator.tsx

import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useBudget } from '../hooks/useBudget';

const screenWidth = Dimensions.get('window').width;

const BudgetCalculator: React.FC = () => {
  const {
    income,
    setIncome,
    categories,
    setCategoryAmount,
    removeCategory,
    saveBudget,
    totalExpenses,
    balance,
    saveToHistory,
    monthlyTotals,
    selectedMonth,
    setSelectedMonth,
  } = useBudget();

  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');

  // Pie chart for category breakdown
  const categoryPieData = categories.map((c, i) => ({
    name: c.category,
    population: c.amount,
    color: ['#4CAF50', '#F44336', '#2196F3', '#FF9800', '#9C27B0', '#009688'][i % 6],
    legendFontColor: '#333',
    legendFontSize: 14,
  })).filter(d => d.population > 0);

  // Line chart for monthly history
  const months = monthlyTotals.map(m => m.month.slice(2));
  const expensesData = monthlyTotals.map(m => m.expenses);
  const balanceData = monthlyTotals.map(m => m.balance);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#f6f8fa' }]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>This Month</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Income:</Text>
            <Text style={styles.summaryValue}>Rs. {income || '0'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Expenses:</Text>
            <Text style={styles.summaryValue}>Rs. {totalExpenses}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Balance:</Text>
            <Text style={[styles.summaryValue, { color: balance >= 0 ? '#4CAF50' : '#F44336' }]}>Rs. {balance}</Text>
          </View>
        </View>
        {/* Pie chart for category breakdown */}
        {categoryPieData.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Expense Breakdown</Text>
            <PieChart
              data={categoryPieData}
              width={screenWidth - 48}
              height={180}
              chartConfig={{
                color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
              style={{ marginBottom: 8 }}
            />
          </View>
        )}
        {/* Add/Edit Categories */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Expense Categories</Text>
          {categories.map((cat, idx) => (
            <View key={cat.category} style={styles.categoryRow}>
              <View style={[styles.colorDot, { backgroundColor: categoryPieData[idx % categoryPieData.length]?.color || '#ccc' }]} />
              <Text style={{ flex: 1 }}>{cat.category}</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={cat.amount.toString()}
                onChangeText={val => setCategoryAmount(cat.category, parseFloat(val) || 0)}
                placeholder="Amount"
                placeholderTextColor="#aaa"
              />
              <TouchableOpacity onPress={() => removeCategory(cat.category)}>
                <MaterialIcons name="delete" size={22} color="#F44336" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          ))}
          <View style={styles.categoryRow}>
            <View style={[styles.colorDot, { backgroundColor: '#bbb' }]} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="New Category"
              value={newCategory}
              onChangeText={setNewCategory}
              placeholderTextColor="#aaa"
            />
            <TextInput
              style={styles.input}
              placeholder="Amount"
              keyboardType="numeric"
              value={newAmount}
              onChangeText={setNewAmount}
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity
              onPress={() => {
                if (newCategory && newAmount) {
                  setCategoryAmount(newCategory, parseFloat(newAmount) || 0);
                  setNewCategory('');
                  setNewAmount('');
                }
              }}
            >
              <MaterialIcons name="add-circle" size={22} color="#007AFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        </View>
        {/* Income input */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Monthly Income</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your income"
            keyboardType="numeric"
            value={income}
            onChangeText={setIncome}
            placeholderTextColor="#aaa"
          />
        </View>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => {
            saveBudget();
            saveToHistory();
          }}
        >
          <Text style={styles.saveButtonText}>Save Budget</Text>
        </TouchableOpacity>
        {/* Monthly history/trend chart */}
        {monthlyTotals.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Monthly History (Expenses & Balance)</Text>
            <LineChart
              data={{
                labels: months,
                datasets: [
                  { data: expensesData, color: () => '#F44336', strokeWidth: 2 },
                  { data: balanceData, color: () => '#2196F3', strokeWidth: 2 },
                ],
                legend: ['Expenses', 'Balance'],
              }}
              width={screenWidth - 48}
              height={180}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                propsForDots: { r: '3', strokeWidth: '2', stroke: '#2196F3' },
              }}
              bezier
              style={{ marginVertical: 8, borderRadius: 8 }}
            />
          </View>
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
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 0,
    fontSize: 15,
    backgroundColor: '#f7f7f7',
    minWidth: 70,
    marginHorizontal: 2,
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
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#007AFF',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#888',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
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
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
