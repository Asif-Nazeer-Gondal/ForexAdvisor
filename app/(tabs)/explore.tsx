import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TIPS = [
  {
    icon: 'trending-up',
    color: '#4CAF50',
    title: 'Invest Consistently',
    desc: 'Regular investments, even small, can grow significantly over time.'
  },
  {
    icon: 'pie-chart',
    color: '#2196F3',
    title: 'Diversify Portfolio',
    desc: 'Don’t put all your eggs in one basket. Spread your investments.'
  },
  {
    icon: 'alarm',
    color: '#FF9800',
    title: 'Set Reminders',
    desc: 'Review your investments and budget regularly for best results.'
  },
];

const RESOURCES = [
  {
    icon: 'book',
    color: '#9C27B0',
    title: 'Forex Trading Basics',
    url: 'https://www.investopedia.com/forex-trading-4427702',
  },
  {
    icon: 'youtube',
    color: '#F44336',
    title: 'Forex Explained (YouTube)',
    url: 'https://www.youtube.com/results?search_query=forex+trading+for+beginners',
  },
  {
    icon: 'globe',
    color: '#009688',
    title: 'XE Currency Tools',
    url: 'https://www.xe.com/tools/',
  },
];

const FEATURED = {
  title: 'Featured: How to Start Investing in Forex',
  desc: 'A step-by-step beginner’s guide to understanding forex markets, choosing brokers, and making your first trade.',
  url: 'https://www.investopedia.com/articles/forex/11/why-trade-forex.asp',
};

export default function ExploreTab() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f6f8fa' }} contentContainerStyle={styles.container}>
      <View style={styles.featuredCard}>
        <Text style={styles.featuredTitle}>{FEATURED.title}</Text>
        <Text style={styles.featuredDesc}>{FEATURED.desc}</Text>
        <TouchableOpacity onPress={() => Linking.openURL(FEATURED.url)} style={styles.featuredButton}>
          <Text style={styles.featuredButtonText}>Read Article</Text>
          <MaterialIcons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Investment Tips</Text>
        {TIPS.map(tip => (
          <View key={tip.title} style={styles.tipRow}>
            <MaterialIcons name={tip.icon as any} size={22} color={tip.color} style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDesc}>{tip.desc}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Educational Resources</Text>
        {RESOURCES.map(res => (
          <TouchableOpacity key={res.title} style={styles.resourceRow} onPress={() => Linking.openURL(res.url)}>
            <FontAwesome5 name={res.icon as any} size={20} color={res.color} style={{ marginRight: 10 }} />
            <Text style={styles.resourceTitle}>{res.title}</Text>
            <MaterialIcons name="open-in-new" size={16} color="#888" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    paddingBottom: 32,
  },
  featuredCard: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 22,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 2,
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featuredDesc: {
    color: '#e3f0ff',
    fontSize: 15,
    marginBottom: 14,
  },
  featuredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#005ecb',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  featuredButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007AFF',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  tipTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
    color: '#222',
  },
  tipDesc: {
    color: '#555',
    fontSize: 14,
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resourceTitle: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: 'bold',
    flex: 1,
  },
});
