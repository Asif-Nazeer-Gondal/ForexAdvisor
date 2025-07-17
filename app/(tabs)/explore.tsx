import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { fetchForexNews } from '../../services/forexService';
import { useTheme } from '../../theme/ThemeContext';

type NewsArticle = {
  url: string;
  title: string;
  description: string;
  source?: { name: string };
  publishedAt: string;
};
type Tip = {
  icon: string;
  color: string;
  title: string;
  desc: string;
};
type Resource = {
  icon: string;
  color: string;
  title: string;
  url: string;
};

const PAIRS = [
  { label: 'All', value: '' },
  { label: 'USD/PKR', value: 'USD/PKR' },
  { label: 'EUR/USD', value: 'EUR/USD' },
  { label: 'GBP/USD', value: 'GBP/USD' },
  { label: 'USD/JPY', value: 'USD/JPY' },
];

const REGIONS = [
  { label: 'All', value: '' },
  { label: 'US', value: 'cnn.com,wsj.com,nytimes.com' },
  { label: 'UK', value: 'bbc.co.uk,ft.com,independent.co.uk' },
  { label: 'EU', value: 'dw.com,euronews.com,lemonde.fr' },
  { label: 'Asia', value: 'asia.nikkei.com,scmp.com' },
];

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
  const { theme } = useTheme();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [newsError, setNewsError] = useState('');
  const [selectedPair, setSelectedPair] = useState(PAIRS[0].value);
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0].value);

  useEffect(() => {
    setLoadingNews(true);
    fetchForexNews(selectedPair, selectedRegion)
      .then(articles => {
        setNews(articles);
        setNewsError('');
      })
      .catch(() => setNewsError('Failed to load news.'))
      .finally(() => setLoadingNews(false));
  }, [selectedPair, selectedRegion]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: 18, paddingBottom: 32 }}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <FontAwesome5 name="search" size={18} color="#888" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search news, pairs, or resources..."
          placeholderTextColor="#aaa"
        />
      </View>

      {/* Featured Card */}
      <View style={styles.featuredCard}>
        <View style={styles.featuredHeader}>
          <Image source={require('../../assets/logo.png')} style={{ width: 32, height: 32, marginRight: 10 }} />
          <Text style={styles.featuredTitle}>{FEATURED.title}</Text>
        </View>
        <Text style={styles.featuredDesc}>{FEATURED.desc}</Text>
        <TouchableOpacity onPress={() => Linking.openURL(FEATURED.url)} style={styles.featuredButton} activeOpacity={0.85}>
          <Text style={styles.featuredButtonText}>Read Article</Text>
          <MaterialIcons name="arrow-forward" size={18} color="#0A2540" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>

      {/* News Filters */}
      <View style={styles.filtersRow}>
        <View style={styles.filterCol}>
          <Text style={styles.filterLabel}>Currency Pair</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {PAIRS.map(pair => (
              <TouchableOpacity
                key={pair.value}
                style={[styles.filterButton, selectedPair === pair.value && styles.filterButtonActive]}
                onPress={() => setSelectedPair(pair.value)}
              >
                <Text style={[styles.filterButtonText, selectedPair === pair.value && styles.filterButtonTextActive]}>{pair.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.filterCol}>
          <Text style={styles.filterLabel}>Region</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {REGIONS.map(region => (
              <TouchableOpacity
                key={region.value}
                style={[styles.filterButton, selectedRegion === region.value && styles.filterButtonActive]}
                onPress={() => setSelectedRegion(region.value)}
              >
                <Text style={[styles.filterButtonText, selectedRegion === region.value && styles.filterButtonTextActive]}>{region.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Latest Forex News */}
      <View style={styles.newsCard}>
        <Text style={styles.newsTitle}>Latest Forex News</Text>
        {loadingNews ? (
          <ActivityIndicator size="small" color="#1DE9B6" />
        ) : newsError ? (
          <Text style={styles.newsError}>{newsError}</Text>
        ) : news.length === 0 ? (
          <Text style={styles.newsEmpty}>No news available.</Text>
        ) : (
          news.slice(0, 5).map((article: NewsArticle, idx: number) => (
            <TouchableOpacity
              key={article.url || idx}
              style={styles.newsItem}
              onPress={() => Linking.openURL(article.url)}
              activeOpacity={0.85}
            >
              <Text style={styles.newsItemTitle}>{article.title}</Text>
              <Text style={styles.newsItemDesc}>{article.description}</Text>
              <Text style={styles.newsItemMeta}>{article.source?.name} • {new Date(article.publishedAt).toLocaleString()}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Investment Tips */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>Investment Tips</Text>
        {TIPS.map((tip: Tip) => (
          <View key={tip.title} style={styles.tipRow}>
            <FontAwesome5 name={tip.icon as any} size={20} color={tip.color} style={{ marginRight: 12, marginTop: 2 }} />
            <View style={styles.tipCol}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDesc}>{tip.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Educational Resources */}
      <View style={styles.resourcesCard}>
        <Text style={styles.resourcesTitle}>Educational Resources</Text>
        {RESOURCES.map((res: Resource) => (
          <TouchableOpacity key={res.title} style={styles.resourceRow} onPress={() => Linking.openURL(res.url)} activeOpacity={0.85}>
            <FontAwesome5 name={res.icon as any} size={18} color={res.color} style={{ marginRight: 10 }} />
            <Text style={styles.resourceTitle}>{res.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0A2540',
    fontFamily: 'SpaceMono',
  },
  featuredCard: {
    backgroundColor: '#0A2540',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  featuredDesc: {
    color: '#1DE9B6',
    fontSize: 15,
    marginBottom: 12,
    fontFamily: 'SpaceMono',
  },
  featuredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DE9B6',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  featuredButtonText: {
    color: '#0A2540',
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  filterCol: {
    flex: 1,
    marginHorizontal: 4,
  },
  filterLabel: {
    color: '#0A2540',
    fontFamily: 'SpaceMono',
    marginBottom: 4,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  filterButtonActive: {
    backgroundColor: '#1DE9B6',
  },
  filterButtonText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: '#0A2540',
  },
  filterButtonTextActive: {
    fontWeight: 'bold',
    color: '#0A2540',
  },
  newsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  newsTitle: {
    color: '#0A2540',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'SpaceMono',
  },
  newsError: {
    color: '#FF5252',
    fontFamily: 'SpaceMono',
  },
  newsEmpty: {
    color: '#888',
    fontFamily: 'SpaceMono',
  },
  newsItem: {
    marginBottom: 12,
  },
  newsItemTitle: {
    color: '#0A2540',
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
    marginBottom: 2,
  },
  newsItemDesc: {
    color: '#888',
    fontFamily: 'SpaceMono',
    marginBottom: 2,
  },
  newsItemMeta: {
    fontSize: 11,
    color: '#aaa',
    fontFamily: 'SpaceMono',
  },
  tipsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  tipsTitle: {
    color: '#0A2540',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: 'SpaceMono',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tipCol: {
    flex: 1,
  },
  tipTitle: {
    color: '#0A2540',
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
    marginBottom: 2,
  },
  tipDesc: {
    color: '#888',
    fontFamily: 'SpaceMono',
  },
  resourcesCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  resourcesTitle: {
    color: '#0A2540',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: 'SpaceMono',
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resourceTitle: {
    color: '#0A2540',
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
    flex: 1,
  },
});
