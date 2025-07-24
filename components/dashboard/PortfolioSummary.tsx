import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useInvestments } from '../../hooks/useInvestments';

export function PortfolioSummary() {
  const { wallet, openPositions, closedPositions } = useInvestments();

  // Calculate profit/loss from closed positions
  const profitLoss = closedPositions.reduce((sum, inv) => {
    if (inv.closedRate && inv.investedRate) {
      return sum + (inv.closedRate - inv.investedRate) * inv.amount;
    }
    return sum;
  }, 0);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Portfolio Summary</Text>
      <Text>Wallet: ${wallet.toLocaleString()}</Text>
      <Text>Profit/Loss: ${profitLoss.toLocaleString()}</Text>
      <Text>Open Positions: {openPositions.length}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, backgroundColor: '#fff', borderRadius: 8, margin: 8, elevation: 2 },
  title: { fontWeight: 'bold', fontSize: 18, marginBottom: 8 }
}); 