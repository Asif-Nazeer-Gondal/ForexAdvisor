import React from 'react';
import { ScrollView } from 'react-native';
import { PortfolioSummary, PerformanceChart, QuickActions, Watchlist, NewsFeed } from '../../components/dashboard';

export default function UserDashboard() {
  return (
    <ScrollView>
      <PortfolioSummary />
      <PerformanceChart />
      <QuickActions />
      <Watchlist />
      <NewsFeed />
    </ScrollView>
  );
} 