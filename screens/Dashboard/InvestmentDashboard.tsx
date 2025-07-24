import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { InvestmentList } from '../../components/dashboard/InvestmentList';
import { NewInvestmentForm } from '../../components/dashboard/NewInvestmentForm';
import { InvestmentAnalytics } from '../../components/dashboard/InvestmentAnalytics';
import AdvancedAnalytics from '../../components/dashboard/AdvancedAnalytics';
import { useInvestments } from '../../hooks/useInvestments';

const TABS = ['Open Positions', 'Closed Positions', 'New Investment'];

export default function InvestmentDashboard() {
  const [tab, setTab] = useState(0);
  const { investments } = useInvestments();

  return (
    <View style={styles.container}>
      <InvestmentAnalytics investments={investments} />
      <AdvancedAnalytics investments={investments} />
      <View style={styles.tabRow}>
        {TABS.map((label, idx) => (
          <TouchableOpacity
            key={label}
            style={[styles.tab, tab === idx && styles.activeTab]}
            onPress={() => setTab(idx)}
          >
            <Text style={tab === idx ? styles.activeTabText : styles.tabText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView style={{ flex: 1 }}>
        {tab === 0 && <InvestmentList type="open" />}
        {tab === 1 && <InvestmentList type="closed" />}
        {tab === 2 && <NewInvestmentForm />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  tabRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 8 },
  tab: { padding: 10, borderRadius: 8 },
  activeTab: { backgroundColor: '#1DE9B6' },
  tabText: { color: '#222', fontWeight: 'bold' },
  activeTabText: { color: '#fff', fontWeight: 'bold' },
}); 