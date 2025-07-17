import React, { createContext, ReactNode, useContext, useState } from 'react';

const themes = {
  light: {
    background: '#fff',
    text: '#222',
    textSecondary: '#555',
    card: '#f6f8fa',
    primary: '#007AFF',
    tabBar: '#fff',
    border: '#e0e0e0',
  },
  dark: {
    background: '#1a1a2e',
    text: '#fff',
    textSecondary: '#bbb',
    card: '#2a2a40',
    primary: '#007AFF',
    tabBar: '#22223b',
    border: '#444',
  },
};

type ThemeType = typeof themes.light;

interface ThemeContextType {
  theme: ThemeType;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: themes.light,
  isDark: false,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => setIsDark((d) => !d);
  return (
    <ThemeContext.Provider value={{ theme: isDark ? themes.dark : themes.light, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 