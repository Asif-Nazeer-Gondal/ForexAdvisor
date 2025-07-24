import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Investment } from '../../hooks/useInvestments';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { FontAwesome5, MaterialIcons, Feather } from '@expo/vector-icons';

interface InvestmentAnalyticsProps {
  investments: Investment[];
}

const TOOLTIP_TEXT = {
  totalProfit: 'Sum of profit or loss from all closed trades. Positive means overall gain, negative means loss.',
  numTrades: 'Total number of trades you have closed.',
  bestTrade: 'The trade with the highest profit among all your closed trades.',
  worstTrade: 'The trade with the biggest loss among all your closed trades.',
};

function Tooltip({ visible, onClose, text }: { visible: boolean; onClose: () => void; text: string }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.tooltipOverlay} onPress={onClose} activeOpacity={1}>
        <View style={styles.tooltipBox}>
          <Text style={styles.tooltipText}>{text}</Text>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function getProfit(inv: Investment): number {
  if (!inv.closed || inv.closedRate === undefined) return 0;
  return (inv.closedRate - inv.investedRate) * inv.amount;
}

export const InvestmentAnalytics: React.FC<InvestmentAnalyticsProps> = ({ investments }) => {
  const closed = investments.filter(inv => inv.closed && inv.closedRate !== undefined);
  const numTrades = closed.length;
  const totalProfit = closed.reduce((sum, inv) => sum + getProfit(inv), 0);
  const bestTrade = closed.reduce((best, inv) => (getProfit(inv) > getProfit(best) ? inv : best), closed[0]);
  const worstTrade = closed.reduce((worst, inv) => (getProfit(inv) < getProfit(worst) ? inv : worst), closed[0]);

  const chartData = {
    labels: closed.map((inv, i) => `${i + 1}`),
    datasets: [
      {
        data: closed.map(getProfit),
      },
    ],
  };
  const screenWidth = Dimensions.get('window').width;

  // Tooltip state
  const [tooltip, setTooltip] = useState<null | keyof typeof TOOLTIP_TEXT>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Investment Analytics</Text>
      <View style={styles.statRowWithIcon}>
        <Text style={styles.statRow}>
          Total Profit/Loss: <Text style={{color: totalProfit >= 0 ? '#43e97b' : '#fa709a', fontWeight: 'bold'}}>{totalProfit.toFixed(2)}</Text>
        </Text>
        <TouchableOpacity onPress={() => setTooltip('totalProfit')}>
          <Feather name="info" size={16} color="#888" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>
      <View style={styles.statRowWithIcon}>
        <Text style={styles.statRow}>Number of Trades: <Text style={{fontWeight: 'bold'}}>{numTrades}</Text></Text>
        <TouchableOpacity onPress={() => setTooltip('numTrades')}>
          <Feather name="info" size={16} color="#888" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>
      {numTrades > 0 && (
        <View style={styles.bestWorstRow}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <FontAwesome5 name="trophy" size={16} color="#FFD700" style={{marginRight: 4}} />
              <Text style={styles.badgeText}>Best: {bestTrade.pair} ({getProfit(bestTrade).toFixed(2)})</Text>
            </View>
            <TouchableOpacity onPress={() => setTooltip('bestTrade')}>
              <Feather name="info" size={16} color="#888" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, {backgroundColor: '#fa709a22'}]}>
              <MaterialIcons name="warning" size={16} color="#fa709a" style={{marginRight: 4}} />
              <Text style={[styles.badgeText, {color: '#fa709a'}]}>Worst: {worstTrade.pair} ({getProfit(worstTrade).toFixed(2)})</Text>
            </View>
            <TouchableOpacity onPress={() => setTooltip('worstTrade')}>
              <Feather name="info" size={16} color="#888" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>
      )}
      {numTrades === 0 && <Text style={styles.noTrades}>No closed trades yet.</Text>}
      {numTrades > 0 && (
        <BarChart
          data={chartData}
          width={screenWidth - 48}
          height={180}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(67, 233, 123, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(34,34,34,${opacity})`,
            style: { borderRadius: 12 },
            propsForBackgroundLines: { stroke: '#eee' },
          }}
          style={{ marginVertical: 12, borderRadius: 12 }}
          fromZero
        />
      )}
      <Tooltip
        visible={!!tooltip}
        onClose={() => setTooltip(null)}
        text={tooltip ? TOOLTIP_TEXT[tooltip] : ''}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
    margin: 12,
    padding: 16,
    borderRadius: 16,
    elevation: 3,
    alignItems: 'flex-start',
    shadowColor: '#43e97b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  header: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 10,
    color: '#222',
  },
  statRow: {
    fontSize: 16,
    marginBottom: 2,
    color: '#222',
  },
  statRowWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  bestWorstRow: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 4,
    gap: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#43e97b22',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 4,
  },
  badgeText: {
    fontWeight: 'bold',
    color: '#43e97b',
  },
  noTrades: {
    color: '#888',
    marginTop: 8,
  },
  tooltipOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltipBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    maxWidth: 260,
    elevation: 4,
  },
  tooltipText: {
    color: '#222',
    fontSize: 15,
    textAlign: 'center',
  },
}); 