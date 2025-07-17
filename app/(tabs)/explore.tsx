import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { fetchForexNews } from '../../services/forexService';
import { useTheme } from '../../theme/ThemeContext';

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
  const [news, setNews] = useState([]);
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
      <View className="flex-row items-center mb-4 bg-white rounded-xl px-4 py-2 shadow">
        <FontAwesome5 name="search" size={18} color="#888" style={{ marginRight: 8 }} />
        <TextInput
          className="flex-1 text-base text-primary font-mono"
          placeholder="Search news, pairs, or resources..."
          placeholderTextColor="#aaa"
        />
      </View>

      {/* Featured Card */}
      <View className="bg-primary rounded-2xl p-5 mb-6 shadow-lg">
        <View className="flex-row items-center mb-3">
          <Image source={require('../../assets/logo.png')} style={{ width: 32, height: 32, marginRight: 10 }} />
          <Text className="text-white text-lg font-bold font-mono">{FEATURED.title}</Text>
        </View>
        <Text className="text-accent text-base mb-3 font-mono">{FEATURED.desc}</Text>
        <TouchableOpacity onPress={() => Linking.openURL(FEATURED.url)} className="flex-row items-center bg-accent rounded-lg px-4 py-2 self-start" activeOpacity={0.85}>
          <Text className="text-primary font-bold font-mono">Read Article</Text>
          <MaterialIcons name="arrow-forward" size={18} color="#0A2540" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>

      {/* News Filters */}
      <View className="flex-row justify-between mb-3">
        <View className="flex-1 mr-2">
          <Text className="text-primary font-mono mb-1">Currency Pair</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {PAIRS.map(pair => (
              <TouchableOpacity
                key={pair.value}
                className={`px-3 py-1 mr-2 rounded-lg ${selectedPair === pair.value ? 'bg-accent' : 'bg-white'}`}
                onPress={() => setSelectedPair(pair.value)}
              >
                <Text className={`font-mono text-xs ${selectedPair === pair.value ? 'text-primary font-bold' : 'text-primary'}`}>{pair.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View className="flex-1 ml-2">
          <Text className="text-primary font-mono mb-1">Region</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {REGIONS.map(region => (
              <TouchableOpacity
                key={region.value}
                className={`px-3 py-1 mr-2 rounded-lg ${selectedRegion === region.value ? 'bg-accent' : 'bg-white'}`}
                onPress={() => setSelectedRegion(region.value)}
              >
                <Text className={`font-mono text-xs ${selectedRegion === region.value ? 'text-primary font-bold' : 'text-primary'}`}>{region.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Latest Forex News */}
      <View className="bg-white rounded-2xl p-5 mb-6 shadow">
        <Text className="text-primary text-lg font-bold mb-2 font-mono">Latest Forex News</Text>
        {loadingNews ? (
          <ActivityIndicator size="small" color="#1DE9B6" />
        ) : newsError ? (
          <Text className="text-red-500 font-mono">{newsError}</Text>
        ) : news.length === 0 ? (
          <Text className="text-gray-600 font-mono">No news available.</Text>
        ) : (
          news.slice(0, 5).map((article, idx) => (
            <TouchableOpacity
              key={article.url || idx}
              className="mb-3"
              onPress={() => Linking.openURL(article.url)}
              activeOpacity={0.85}
            >
              <Text className="text-primary font-bold font-mono mb-1">{article.title}</Text>
              <Text className="text-gray-600 font-mono mb-1">{article.description}</Text>
              <Text className="text-xs text-gray-400 font-mono">{article.source?.name} • {new Date(article.publishedAt).toLocaleString()}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Investment Tips */}
      <View className="bg-white rounded-2xl p-5 mb-6 shadow">
        <Text className="text-primary text-lg font-bold mb-3 font-mono">Investment Tips</Text>
        {TIPS.map(tip => (
          <View key={tip.title} className="flex-row items-start mb-4">
            <MaterialIcons name={tip.icon as any} size={22} color={tip.color} style={{ marginRight: 10, marginTop: 2 }} />
            <View className="flex-1">
              <Text className="text-primary font-bold font-mono mb-1">{tip.title}</Text>
              <Text className="text-gray-600 font-mono">{tip.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Educational Resources */}
      <View className="bg-white rounded-2xl p-5 shadow">
        <Text className="text-primary text-lg font-bold mb-3 font-mono">Educational Resources</Text>
        {RESOURCES.map(res => (
          <TouchableOpacity key={res.title} className="flex-row items-center mb-3" onPress={() => Linking.openURL(res.url)} activeOpacity={0.85}>
            <FontAwesome5 name={res.icon as any} size={20} color={res.color} style={{ marginRight: 10 }} />
            <Text className="text-primary font-bold font-mono flex-1">{res.title}</Text>
            <MaterialIcons name="open-in-new" size={16} color="#888" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
