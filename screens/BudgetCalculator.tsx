// screens/BudgetCalculator.tsx

import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useBudget } from '../hooks/useBudget';
import { useTheme } from '../theme/ThemeContext';

const PLAN_TYPES = [
  { label: 'Daily', value: 'daily', days: 1 },
  { label: 'Weekly', value: 'weekly', days: 7 },
  { label: 'Monthly', value: 'monthly', days: 30 },
  { label: 'Quarterly', value: 'quarterly', days: 90 },
  { label: 'Bi-Annual', value: 'biannual', days: 182 },
  { label: 'Annual', value: 'annual', days: 365 },
];

const screenWidth = Dimensions.get('window').width;

export default function BudgetCalculator() {
  const { theme } = useTheme();
  const {
    income,
    setIncome,
    categories,
    setCategoryAmount,
    removeCategory,
    saveBudget,
    totalExpenses,
    balance,
  } = useBudget();
  const [activePlan, setActivePlan] = useState('monthly');
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Pie chart for category breakdown
  const categoryPieData = categories.map((c, i) => ({
    name: c.category,
    population: c.amount,
    color: ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140'][i % 6],
    legendFontColor: '#222',
    legendFontSize: 12,
  })).filter(d => d.population > 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Plan calculations
  const planDays = PLAN_TYPES.find(p => p.value === activePlan)?.days || 30;
  const planIncome = (parseFloat(income) || 0) / (30 / planDays);
  const planExpenses = (totalExpenses || 0) / (30 / planDays);
  const planBalance = planIncome - planExpenses;

  const handleSave = () => {
    saveBudget();
    Alert.alert('Success', 'Budget saved successfully!');
  };

  const handleAddCategory = () => {
    if (newCategory && newAmount) {
      setCategoryAmount(newCategory, parseFloat(newAmount) || 0);
      setNewCategory('');
      setNewAmount('');
      setShowAddForm(false);
    } else {
      Alert.alert('Error', 'Please enter both category name and amount');
    }
  };

  return (
    <View style={styles.flex1BgBackground}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.headerTitle}>Budget Management</Text>
          <Text style={styles.headerSubtitle}>Smart Finance</Text>
        </View>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <MaterialIcons name="save" size={24} color="#0A2540" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <View style={styles.statsRow}>
          {[{
            label: 'Income',
            value: formatCurrency(parseFloat(income) || 0),
            icon: <FontAwesome5 name="arrow-up" size={20} color="#1DE9B6" />,
          }, {
            label: 'Expenses',
            value: formatCurrency(totalExpenses),
            icon: <FontAwesome5 name="arrow-down" size={20} color="#FF5A5F" />,
          }, {
            label: 'Balance',
            value: formatCurrency(balance),
            icon: <FontAwesome5 name="wallet" size={20} color="#FFD700" />,
          }].map(stat => (
            <View key={stat.label} style={styles.statCard}>
              {stat.icon}
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* Plan Calculator Tabs */}
        <View style={styles.planRow}>
          {PLAN_TYPES.map(plan => (
            <TouchableOpacity
              key={plan.value}
              style={[styles.planButton, activePlan === plan.value && styles.planButtonActive]}
              onPress={() => setActivePlan(plan.value)}
            >
              <Text style={[styles.planButtonText, activePlan === plan.value && styles.planButtonTextActive]}>{plan.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Plan Calculation Display */}
        <View style={styles.planCard}>
          <Text style={styles.planCardTitle}>{PLAN_TYPES.find(p => p.value === activePlan)?.label} Plan</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.planCardLabel}>Income:</Text>
            <Text style={styles.planCardLabel}>{formatCurrency(planIncome)}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.planCardLabel}>Expenses:</Text>
            <Text style={styles.planCardLabel}>{formatCurrency(planExpenses)}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.planCardLabel}>Balance:</Text>
            <Text style={[styles.planCardLabel, planBalance >= 0 ? styles.balancePositive : styles.balanceNegative]}>{formatCurrency(planBalance)}</Text>
          </View>
        </View>

        {/* Income Input */}
        <View style={styles.monthlyIncomeCard}>
          <Text style={styles.monthlyIncomeTitle}>Monthly Income</Text>
          <View style={styles.rowCenter}>
            <FontAwesome5 name="money-bill-wave" size={20} color="#667eea" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              placeholder="Enter your monthly income"
              keyboardType="numeric"
              value={income}
              onChangeText={setIncome}
              placeholderTextColor="#aaa"
            />
          </View>
        </View>

        {/* Expense Categories */}
        <View style={styles.expensesCard}>
          <View style={styles.rowBetweenCenter}>
            <Text style={styles.expensesTitle}>Expense Categories</Text>
            <TouchableOpacity onPress={() => setShowAddForm(!showAddForm)} style={styles.addButton}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          {showAddForm && (
            <View style={styles.addFormRow}>
              <TextInput
                style={styles.inputFlex}
                placeholder="Category"
                value={newCategory}
                onChangeText={setNewCategory}
                placeholderTextColor="#aaa"
              />
              <TextInput
                style={styles.inputSmall}
                placeholder="Amount"
                value={newAmount}
                onChangeText={setNewAmount}
                keyboardType="numeric"
                placeholderTextColor="#aaa"
              />
              <TouchableOpacity onPress={handleAddCategory} style={styles.addButtonSmall}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          )}
          {categories.map(cat => (
            <View key={cat.category} style={styles.categoryRow}>
              <Text style={styles.categoryLabel}>{cat.category}</Text>
              <TextInput
                style={styles.inputSmall}
                value={cat.amount.toString()}
                onChangeText={val => setCategoryAmount(cat.category, parseFloat(val) || 0)}
                keyboardType="numeric"
                placeholderTextColor="#aaa"
              />
              <TouchableOpacity onPress={() => removeCategory(cat.category)} style={styles.removeButton}>
                <Text style={styles.removeButtonText}>X</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Pie Chart */}
        {categoryPieData.length > 0 && (
          <View style={styles.expenseBreakdownCard}>
            <Text style={styles.expenseBreakdownTitle}>Expense Breakdown</Text>
            <PieChart
              data={categoryPieData}
              width={screenWidth - 80}
              height={200}
              chartConfig={{
                color: (opacity = 1) => `rgba(34,34,34,${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
              style={{ borderRadius: 16 }}
            />
          </View>
        )}
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
    fontSize: 20,
    fontFamily: 'SpaceMono',
  },
  headerSubtitle: {
    color: '#1DE9B6',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  saveButton: {
    backgroundColor: '#1DE9B6',
    borderRadius: 24,
    padding: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  flex1: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  statLabel: {
    color: '#0A2540',
    fontSize: 12,
    marginTop: 8,
    fontFamily: 'SpaceMono',
  },
  statValue: {
    color: '#0A2540',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  planButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginHorizontal: 4,
  },
  planButtonActive: {
    backgroundColor: '#1DE9B6',
  },
  planButtonText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: '#0A2540',
  },
  planButtonTextActive: {
    fontWeight: 'bold',
    color: '#0A2540',
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  planCardTitle: {
    color: '#0A2540',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'SpaceMono',
  },
  planCardLabel: {
    color: '#0A2540',
    fontFamily: 'SpaceMono',
  },
  balancePositive: {
    color: '#1DE9B6',
  },
  balanceNegative: {
    color: '#FF5252',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  monthlyIncomeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  monthlyIncomeTitle: {
    color: '#0A2540',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'SpaceMono',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#0A2540',
    fontFamily: 'SpaceMono',
  },
  expensesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  expensesTitle: {
    color: '#0A2540',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'SpaceMono',
  },
  rowBetweenCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#1DE9B6',
    borderRadius: 16,
    padding: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  addFormRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputFlex: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#0A2540',
    fontFamily: 'SpaceMono',
    marginRight: 8,
  },
  inputSmall: {
    width: 80,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#0A2540',
    fontFamily: 'SpaceMono',
    marginRight: 8,
  },
  addButtonSmall: {
    backgroundColor: '#0A2540',
    borderRadius: 16,
    padding: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    flex: 1,
    color: '#0A2540',
    fontFamily: 'SpaceMono',
  },
  removeButton: {
    backgroundColor: '#FF5252',
    borderRadius: 16,
    padding: 8,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  expenseBreakdownCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  expenseBreakdownTitle: {
    color: '#0A2540',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'SpaceMono',
  },
});
