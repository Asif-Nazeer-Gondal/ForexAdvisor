import { View, StyleSheet } from 'react-native';
import BudgetCalculator from '../../screens/BudgetCalculator';

export default function BudgetTabScreen() {
  return (
    <View style={styles.container}>
      <BudgetCalculator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
