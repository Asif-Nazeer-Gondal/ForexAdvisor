// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './screens/Home';
import BudgetCalculator from './screens/BudgetCalculator';
import ForexRates from './screens/ForexRates';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="BudgetCalculator" component={BudgetCalculator} />
        <Stack.Screen name="ForexRates" component={ForexRates} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
