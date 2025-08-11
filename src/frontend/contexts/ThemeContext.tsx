import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

type ThemeType = 'light' | 'dark' | 'system';

type ThemeContextType = {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeProviderProps = {
  children: React.ReactNode;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>('system');
  const systemColorScheme = useColorScheme();
  
  // Load saved theme from storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await SecureStore.getItemAsync('theme');
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme as ThemeType)) {
          setTheme(savedTheme as ThemeType);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      }
    };
    
    loadTheme();
  }, []);
  
  // Save theme to storage when it changes
  useEffect(() => {
    const saveTheme = async () => {
      try {
        await SecureStore.setItemAsync('theme', theme);
      } catch (error) {
        console.error('Failed to save theme:', error);
      }
    };
    
    saveTheme();
  }, [theme]);
  
  const value = {
    theme,
    setTheme,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};