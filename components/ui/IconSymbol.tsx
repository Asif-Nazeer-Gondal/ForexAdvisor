import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';

interface IconSymbolProps {
  name: keyof typeof MaterialIcons.glyphMap;
  color: string;
  size: number;
}

export const IconSymbol = ({ name, color, size }: IconSymbolProps) => {
  return <MaterialIcons name={name} color={color} size={size} />;
};
