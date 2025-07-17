import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, View } from 'react-native';
import 'react-native-reanimated';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import logo from '../assets/logo.png';

const theme = {
  colors: {
    primary: '#0A2540',
    accent: '#1DE9B6',
    gold: '#FFD700',
    background: '#F5F7FA',
    white: '#FFFFFF',
  },
  fontFamily: {
    mono: 'SpaceMono',
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <StyledThemeProvider theme={theme}>
      <View className="flex-1 bg-background">
        <View className="items-center py-4">
          <Image source={logo} style={{ width: 60, height: 60 }} />
        </View>
        <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </NavigationThemeProvider>
      </View>
    </StyledThemeProvider>
  );
}
