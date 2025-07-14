// types/navigation.ts

export type RootStackParamList = {
  Home: undefined;
  Budget: undefined;
  Settings: undefined;
  BudgetCalculator: undefined;
  ForexRates: undefined; // Newly added screen
};

// This type is used for strong typing navigation between screens
// Example: useNavigation<NativeStackNavigationProp<RootStackParamList>>()
