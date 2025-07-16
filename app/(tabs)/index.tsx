import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../../screens/HomeScreen';
import BudgetCalculator from '../../screens/BudgetCalculator';
import PredictorScreen from '../../screens/PredictorScreen';

const Tab = createBottomTabNavigator();

export default function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Home: 'home',
            Budget: 'calculator',
            Predictor: 'stats-chart',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Budget" component={BudgetCalculator} />
      <Tab.Screen name="Predictor" component={PredictorScreen} />
    </Tab.Navigator>
  );
}
