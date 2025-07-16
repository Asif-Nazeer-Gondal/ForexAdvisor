import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleProp, TextStyle } from 'react-native';

interface IconSymbolProps {
  name: keyof typeof MaterialIcons.glyphMap;
  color?: string;
  size?: number;
  style?: StyleProp<TextStyle>;
}

export const IconSymbol = ({ name, color, size, style }: IconSymbolProps) => {
  return <MaterialIcons name={name} color={color} size={size} style={style} />;
};