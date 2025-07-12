import { TextProps, Text } from 'react-native';

type CustomTextProps = TextProps & {
  type?: 'title' | 'link' | 'defaultSemiBold'; // extend as needed
};

export function ThemedText({ type, style, ...rest }: CustomTextProps) {
  const customStyle = (() => {
    switch (type) {
      case 'title':
        return { fontSize: 20, fontWeight: 'bold' as const };
      case 'link':
        return { color: 'blue', textDecorationLine: 'underline' as 'underline' };
      case 'defaultSemiBold':
        return { fontWeight: '600' as const };
      default:
        return {};
    }
  })();

  return <Text style={[customStyle, style]} {...rest} />;
}
