import { BlurView } from 'expo-blur';
import { View } from 'react-native';
import { useColorScheme } from '../../hooks/useColorScheme.ts';
import useBottomTabOverflow from '@/components/ui/TabBarBackground';
export default function TabBarBackground() {
  const theme = useColorScheme();

  return (
    <BlurView
      intensity={100}
      tint={theme ?? 'light'}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
      }}
    />
  );
}
