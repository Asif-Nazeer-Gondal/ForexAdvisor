// screens/BudgetCalculator.tsx

import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
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
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-primary rounded-b-3xl px-6 py-6 mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-white text-lg font-mono">Budget Management</Text>
          <Text className="text-accent text-2xl font-bold font-mono">Smart Finance</Text>
        </View>
        <TouchableOpacity onPress={handleSave} className="bg-accent rounded-full p-3">
          <MaterialIcons name="save" size={24} color="#0A2540" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <View className="flex-row justify-around mb-6 mt-2">
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
            <View key={stat.label} className="flex-1 mx-2 p-4 rounded-2xl shadow-lg items-center bg-white">
              {stat.icon}
              <Text className="text-primary text-xs mt-2 font-mono">{stat.label}</Text>
              <Text className="text-primary text-lg font-bold font-mono">{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* Plan Calculator Tabs */}
        <View className="flex-row justify-between mb-4 px-2">
          {PLAN_TYPES.map(plan => (
            <TouchableOpacity
              key={plan.value}
              className={`px-2 py-1 rounded-lg ${activePlan === plan.value ? 'bg-accent' : 'bg-white'}`}
              onPress={() => setActivePlan(plan.value)}
            >
              <Text className={`font-mono text-xs ${activePlan === plan.value ? 'text-primary font-bold' : 'text-primary'}`}>{plan.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Plan Calculation Display */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow">
          <Text className="text-primary text-lg font-bold mb-2 font-mono">{PLAN_TYPES.find(p => p.value === activePlan)?.label} Plan</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-primary font-mono">Income:</Text>
            <Text className="text-primary font-mono">{formatCurrency(planIncome)}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-primary font-mono">Expenses:</Text>
            <Text className="text-primary font-mono">{formatCurrency(planExpenses)}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-primary font-mono">Balance:</Text>
            <Text className={`font-mono ${planBalance >= 0 ? 'text-accent' : 'text-red-500'}`}>{formatCurrency(planBalance)}</Text>
          </View>
        </View>

        {/* Income Input */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow">
          <Text className="text-primary text-lg font-bold mb-2 font-mono">Monthly Income</Text>
          <View className="flex-row items-center">
            <FontAwesome5 name="money-bill-wave" size={20} color="#667eea" style={{ marginRight: 8 }} />
            <TextInput
              className="flex-1 text-base text-primary font-mono"
              placeholder="Enter your monthly income"
              keyboardType="numeric"
              value={income}
              onChangeText={setIncome}
              placeholderTextColor="#888"
            />
          </View>
        </View>

        {/* Expense Categories */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-primary text-lg font-bold font-mono">Expense Categories</Text>
            <TouchableOpacity onPress={() => setShowAddForm(!showAddForm)} className="bg-accent rounded-full p-2">
              <MaterialIcons name={showAddForm ? 'close' : 'add'} size={20} color="#0A2540" />
            </TouchableOpacity>
          </View>
          {showAddForm && (
            <View className="flex-row items-center mb-3">
              <TextInput
                className="flex-1 text-base text-primary font-mono mr-2"
                placeholder="Category"
                value={newCategory}
                onChangeText={setNewCategory}
                placeholderTextColor="#aaa"
              />
              <TextInput
                className="w-24 text-base text-primary font-mono mr-2"
                placeholder="Amount"
                value={newAmount}
                onChangeText={setNewAmount}
                keyboardType="numeric"
                placeholderTextColor="#aaa"
              />
              <TouchableOpacity onPress={handleAddCategory} className="bg-primary rounded-full p-2">
                <MaterialIcons name="check" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          {categories.map((cat, idx) => (
            <View key={cat.category} className="flex-row items-center mb-2">
              <Text className="flex-1 text-primary font-mono">{cat.category}</Text>
              <TextInput
                className="w-24 text-base text-primary font-mono mr-2"
                value={cat.amount.toString()}
                onChangeText={val => setCategoryAmount(cat.category, parseFloat(val) || 0)}
                keyboardType="numeric"
                placeholderTextColor="#aaa"
              />
              <TouchableOpacity onPress={() => removeCategory(cat.category)} className="bg-red-500 rounded-full p-2">
                <MaterialIcons name="delete" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Pie Chart */}
        {categoryPieData.length > 0 && (
          <View className="bg-white rounded-2xl p-4 mb-6 shadow items-center">
            <Text className="text-primary text-lg font-bold mb-2 font-mono">Expense Breakdown</Text>
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
