import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { fetchHistoricalRates } from '../../services/forexService';

export function PerformanceChart() {
  const [data, setData] = useState<{ date: string; rate: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistoricalRates('USD', 'PKR', 7).then((rates) => {
      setData(rates);
      setLoading(false);
    });
  }, []);

  if (loading) return <ActivityIndicator />;

  return (
    <View>
      <Text style={{ fontWeight: 'bold', fontSize: 18, margin: 8 }}>USD/PKR - Last 7 Days</Text>
      <LineChart
        data={{
          labels: data.map(d => d.date.slice(5)), // MM-DD
          datasets: [{ data: data.map(d => d.rate) }]
        }}
        width={Dimensions.get('window').width - 32}
        height={220}
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
        }}
        bezier
        style={{ borderRadius: 8, margin: 8 }}
      />
    </View>
  );
} 