import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const colors = {
  light: {
    background: '#ffffff',
    card: '#f8f9fa',
    text: '#1a1a1a',
    textSecondary: '#6b7280',
    primary: '#8b5cf6',
    primaryForeground: '#ffffff',
    secondary: '#f59e0b',
    secondaryForeground: '#ffffff',
    accent: '#ec4899',
    muted: '#f3f4f6',
    border: '#e5e7eb',
    destructive: '#ef4444',
  },
  dark: {
    background: '#0a0a0a',
    card: '#1a1a1a',
    text: '#ffffff',
    textSecondary: '#9ca3af',
    primary: '#8b5cf6',
    primaryForeground: '#ffffff',
    secondary: '#f59e0b',
    secondaryForeground: '#ffffff',
    accent: '#ec4899',
    muted: '#1f2937',
    border: '#374151',
    destructive: '#ef4444',
  },
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true); // Default to dark theme for speakeasy vibe

  const theme = {
    colors: isDark ? colors.dark : colors.light,
    isDark,
    toggleTheme: () => setIsDark(!isDark),
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};
