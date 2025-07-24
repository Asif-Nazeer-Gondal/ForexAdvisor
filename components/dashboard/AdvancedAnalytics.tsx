import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Investment } from '../../hooks/useInvestments';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

interface AdvancedAnalyticsProps {
  investments: Investment[];
}

function filterInvestments(
  investments: Investment[],
  dateFrom: string | null,
  dateTo: string | null,
  pair: string | null,
  tradeType: 'all' | 'open' | 'closed'
) {
  return investments.filter(inv => {
    if (dateFrom && inv.date < dateFrom) return false;
    if (dateTo && inv.date > dateTo) return false;
    if (pair && inv.pair !== pair) return false;
    if (tradeType === 'open' && inv.closed) return false;
    if (tradeType === 'closed' && !inv.closed) return false;
    return true;
  });
}

function getProfitOverTime(investments: Investment[]) {
  const closed = investments.filter(inv => inv.closed && inv.closedDate && inv.closedRate !== undefined)
    .sort((a, b) => new Date(a.closedDate!).getTime() - new Date(b.closedDate!).getTime());
  let cumulative = 0;
  const data = closed.map(inv => {
    cumulative += (inv.closedRate! - inv.investedRate) * inv.amount;
    return { date: inv.closedDate!.slice(0, 10), value: cumulative };
  });
  return data;
}

function getTradeFrequency(investments: Investment[], mode: 'monthly' | 'weekly') {
  const freq: { [period: string]: number } = {};
  investments.forEach(inv => {
    let period = '';
    if (mode === 'monthly') period = inv.date.slice(0, 7);
    else {
      const d = new Date(inv.date);
      const year = d.getFullYear();
      const week = Math.ceil(((d.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + new Date(year, 0, 1).getDay() + 1) / 7);
      period = `${year}-W${week}`;
    }
    freq[period] = (freq[period] || 0) + 1;
  });
  const periods = Object.keys(freq).sort();
  return { labels: periods, data: periods.map(p => freq[p]) };
}

function getPairDistribution(investments: Investment[]) {
  const pairs: { [pair: string]: number } = {};
  investments.forEach(inv => {
    pairs[inv.pair] = (pairs[inv.pair] || 0) + 1;
  });
  return Object.entries(pairs).map(([pair, count], i) => ({
    name: pair,
    population: count,
    color: ['#43e97b', '#fa709a', '#1DE9B6', '#38f9d7', '#FFD700', '#888'][i % 6],
    legendFontColor: '#222',
    legendFontSize: 13,
    value: count,
    label: pair,
  }));
}

function getPairDistributionBar(investments: Investment[]) {
  const pairs: { [pair: string]: number } = {};
  investments.forEach(inv => {
    pairs[inv.pair] = (pairs[inv.pair] || 0) + 1;
  });
  const pairNames = Object.keys(pairs);
  return { labels: pairNames, data: pairNames.map(p => pairs[p]) };
}

function getWinRate(investments: Investment[]) {
  const closed = investments.filter(inv => inv.closed && inv.closedRate !== undefined);
  if (closed.length === 0) return 0;
  const wins = closed.filter(inv => (inv.closedRate! - inv.investedRate) * inv.amount > 0).length;
  return (wins / closed.length) * 100;
}

function getAvgProfitLoss(investments: Investment[]) {
  const closed = investments.filter(inv => inv.closed && inv.closedRate !== undefined);
  if (closed.length === 0) return 0;
  const total = closed.reduce((sum, inv) => sum + (inv.closedRate! - inv.investedRate) * inv.amount, 0);
  return total / closed.length;
}

function getBestWorstMonth(investments: Investment[]) {
  const closed = investments.filter(inv => inv.closed && inv.closedRate !== undefined);
  const monthProfits: { [month: string]: number } = {};
  closed.forEach(inv => {
    const month = inv.closedDate ? inv.closedDate.slice(0, 7) : '';
    const profit = (inv.closedRate! - inv.investedRate) * inv.amount;
    monthProfits[month] = (monthProfits[month] || 0) + profit;
  });
  const months = Object.keys(monthProfits);
  if (months.length === 0) return { best: null, worst: null };
  let best = months[0], worst = months[0];
  months.forEach(m => {
    if (monthProfits[m] > monthProfits[best]) best = m;
    if (monthProfits[m] < monthProfits[worst]) worst = m;
  });
  return { best: { month: best, profit: monthProfits[best] }, worst: { month: worst, profit: monthProfits[worst] } };
}

function getStreaks(investments: Investment[]) {
  const closed = investments.filter(inv => inv.closed && inv.closedRate !== undefined);
  let maxWin = 0, maxLoss = 0, curWin = 0, curLoss = 0;
  closed.forEach(inv => {
    const profit = (inv.closedRate! - inv.investedRate) * inv.amount;
    if (profit > 0) {
      curWin++;
      maxWin = Math.max(maxWin, curWin);
      curLoss = 0;
    } else if (profit < 0) {
      curLoss++;
      maxLoss = Math.max(maxLoss, curLoss);
      curWin = 0;
    } else {
      curWin = 0;
      curLoss = 0;
    }
  });
  return { maxWin, maxLoss };
}

function getMaxDrawdown(investments: Investment[]) {
  const closed = investments.filter(inv => inv.closed && inv.closedDate && inv.closedRate !== undefined)
    .sort((a, b) => new Date(a.closedDate!).getTime() - new Date(b.closedDate!).getTime());
  let peak = 0, trough = 0, maxDD = 0, cumulative = 0;
  closed.forEach(inv => {
    cumulative += (inv.closedRate! - inv.investedRate) * inv.amount;
    if (cumulative > peak) {
      peak = cumulative;
      trough = cumulative;
    }
    if (cumulative < trough) {
      trough = cumulative;
      maxDD = Math.max(maxDD, peak - trough);
    }
  });
  return maxDD;
}

function getTradeReturnHistogram(investments: Investment[]) {
  const closed = investments.filter(inv => inv.closed && inv.closedRate !== undefined);
  const returns = closed.map(inv => (inv.closedRate! - inv.investedRate) * inv.amount);
  if (returns.length === 0) return { bins: [], counts: [] };
  const min = Math.min(...returns), max = Math.max(...returns);
  const binCount = 6;
  const binSize = (max - min) / binCount || 1;
  const bins = Array.from({ length: binCount }, (_, i) => min + i * binSize);
  const counts = Array(binCount).fill(0);
  returns.forEach(r => {
    let idx = Math.floor((r - min) / binSize);
    if (idx === binCount) idx = binCount - 1;
    counts[idx]++;
  });
  return { bins, counts };
}

export default function AdvancedAnalytics({ investments }: AdvancedAnalyticsProps) {
  const [freqMode, setFreqMode] = useState<'monthly' | 'weekly'>('monthly');
  const [pairChart, setPairChart] = useState<'pie' | 'bar'>('pie');
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [pair, setPair] = useState<string | null>(null);
  const [tradeType, setTradeType] = useState<'all' | 'open' | 'closed'>('all');

  const filtered = filterInvestments(investments, dateFrom, dateTo, pair, tradeType);
  const profitData = getProfitOverTime(filtered);
  const freqData = getTradeFrequency(filtered, freqMode);
  const pairData = getPairDistribution(filtered);
  const pairBarData = getPairDistributionBar(filtered);
  const winRate = getWinRate(filtered);
  const avgPL = getAvgProfitLoss(filtered);
  const { best, worst } = getBestWorstMonth(filtered);
  const { maxWin, maxLoss } = getStreaks(filtered);
  const maxDrawdown = getMaxDrawdown(filtered);
  const hist = getTradeReturnHistogram(filtered);
  const screenWidth = Dimensions.get('window').width;
  const allPairs = Array.from(new Set(investments.map(inv => inv.pair)));

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.container}>
        <Text style={styles.header}>Advanced Analytics</Text>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>From:</Text>
          <TextInput
            style={styles.filterInput}
            placeholder="YYYY-MM-DD"
            value={dateFrom || ''}
            onChangeText={setDateFrom}
          />
          <Text style={styles.filterLabel}>To:</Text>
          <TextInput
            style={styles.filterInput}
            placeholder="YYYY-MM-DD"
            value={dateTo || ''}
            onChangeText={setDateTo}
          />
          <Text style={styles.filterLabel}>Pair:</Text>
          <TouchableOpacity style={styles.filterPicker} onPress={() => setPair(null)}>
            <Text style={{ color: pair === null ? '#1DE9B6' : '#222' }}>All</Text>
          </TouchableOpacity>
          {allPairs.map(p => (
            <TouchableOpacity key={p} style={styles.filterPicker} onPress={() => setPair(p)}>
              <Text style={{ color: pair === p ? '#1DE9B6' : '#222' }}>{p}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.filterPicker} onPress={() => setTradeType('all')}>
            <Text style={{ color: tradeType === 'all' ? '#1DE9B6' : '#222' }}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterPicker} onPress={() => setTradeType('open')}>
            <Text style={{ color: tradeType === 'open' ? '#1DE9B6' : '#222' }}>Open</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterPicker} onPress={() => setTradeType('closed')}>
            <Text style={{ color: tradeType === 'closed' ? '#1DE9B6' : '#222' }}>Closed</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.stat}>Win Rate: <Text style={{ color: '#43e97b', fontWeight: 'bold' }}>{winRate.toFixed(1)}%</Text></Text>
          <Text style={styles.stat}>Avg P/L: <Text style={{ color: avgPL >= 0 ? '#43e97b' : '#fa709a', fontWeight: 'bold' }}>{avgPL.toFixed(2)}</Text></Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.stat}>Best Month: {best ? `${best.month} (${best.profit.toFixed(2)})` : '-'}</Text>
          <Text style={styles.stat}>Worst Month: {worst ? `${worst.month} (${worst.profit.toFixed(2)})` : '-'}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.stat}>Longest Win Streak: <Text style={{ color: '#43e97b', fontWeight: 'bold' }}>{maxWin}</Text></Text>
          <Text style={styles.stat}>Longest Loss Streak: <Text style={{ color: '#fa709a', fontWeight: 'bold' }}>{maxLoss}</Text></Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.stat}>Max Drawdown: <Text style={{ color: '#fa709a', fontWeight: 'bold' }}>{maxDrawdown.toFixed(2)}</Text></Text>
        </View>
        <Text style={styles.chartTitle}>Profit Over Time</Text>
        {profitData.length > 1 ? (
          <LineChart
            data={{
              labels: profitData.map(d => d.date.slice(5)),
              datasets: [{ data: profitData.map(d => d.value) }],
            }}
            width={screenWidth - 48}
            height={180}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={chartConfig}
            style={styles.chart}
          />
        ) : (
          <Text style={styles.noData}>Not enough closed trades for trend.</Text>
        )}
        <View style={styles.segmentedRow}>
          <TouchableOpacity style={[styles.segment, freqMode === 'monthly' && styles.segmentActive]} onPress={() => setFreqMode('monthly')}>
            <Text style={freqMode === 'monthly' ? styles.segmentTextActive : styles.segmentText}>Monthly</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.segment, freqMode === 'weekly' && styles.segmentActive]} onPress={() => setFreqMode('weekly')}>
            <Text style={freqMode === 'weekly' ? styles.segmentTextActive : styles.segmentText}>Weekly</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.chartTitle}>Trade Frequency ({freqMode.charAt(0).toUpperCase() + freqMode.slice(1)})</Text>
        {freqData.labels.length > 0 ? (
          <BarChart
            data={{ labels: freqData.labels, datasets: [{ data: freqData.data }] }}
            width={screenWidth - 48}
            height={180}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={chartConfig}
            style={styles.chart}
            fromZero
          />
        ) : (
          <Text style={styles.noData}>No trades yet.</Text>
        )}
        <View style={styles.segmentedRow}>
          <TouchableOpacity style={[styles.segment, pairChart === 'pie' && styles.segmentActive]} onPress={() => setPairChart('pie')}>
            <Text style={pairChart === 'pie' ? styles.segmentTextActive : styles.segmentText}>Pie</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.segment, pairChart === 'bar' && styles.segmentActive]} onPress={() => setPairChart('bar')}>
            <Text style={pairChart === 'bar' ? styles.segmentTextActive : styles.segmentText}>Bar</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.chartTitle}>Pair Distribution</Text>
        {pairChart === 'pie' && pairData.length > 0 ? (
          <PieChart
            data={pairData}
            width={screenWidth - 48}
            height={180}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        ) : null}
        {pairChart === 'bar' && pairBarData.labels.length > 0 ? (
          <BarChart
            data={{ labels: pairBarData.labels, datasets: [{ data: pairBarData.data }] }}
            width={screenWidth - 48}
            height={180}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={chartConfig}
            style={styles.chart}
            fromZero
          />
        ) : null}
        {pairChart === 'pie' && pairData.length === 0 && <Text style={styles.noData}>No trades yet.</Text>}
        {pairChart === 'bar' && pairBarData.labels.length === 0 && <Text style={styles.noData}>No trades yet.</Text>}
        <Text style={styles.chartTitle}>Trade Return Distribution</Text>
        {hist.bins.length > 0 ? (
          <BarChart
            data={{
              labels: hist.bins.map((b, i) => `${b.toFixed(0)}${i === hist.bins.length - 1 ? '+' : ''}`),
              datasets: [{ data: hist.counts }],
            }}
            width={screenWidth - 48}
            height={180}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={chartConfig}
            style={styles.chart}
            fromZero
          />
        ) : (
          <Text style={styles.noData}>No closed trades for histogram.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const chartConfig = {
  backgroundColor: '#fff',
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(67, 233, 123, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(34,34,34,${opacity})`,
  style: { borderRadius: 12 },
  propsForBackgroundLines: { stroke: '#eee' },
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    alignItems: 'flex-start',
  },
  header: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    color: '#222',
  },
  chartTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 12,
    marginBottom: 4,
    color: '#222',
  },
  chart: {
    borderRadius: 12,
    marginBottom: 8,
  },
  noData: {
    color: '#888',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
  },
  stat: {
    fontSize: 15,
    color: '#222',
    marginRight: 12,
  },
  segmentedRow: {
    flexDirection: 'row',
    marginVertical: 4,
    marginBottom: 0,
  },
  segment: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginRight: 8,
  },
  segmentActive: {
    backgroundColor: '#1DE9B6',
  },
  segmentText: {
    color: '#222',
    fontWeight: 'bold',
  },
  segmentTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  filterLabel: {
    fontSize: 13,
    color: '#222',
    marginRight: 2,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 4,
    width: 90,
    marginRight: 6,
    backgroundColor: '#fff',
    fontSize: 13,
  },
  filterPicker: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#eee',
    marginRight: 4,
    marginBottom: 2,
  },
}); 