import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { useColorScheme } from 'react-native';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const useAppColorScheme = () => {
  const { theme, setTheme } = useTheme();
  const systemColorScheme = useColorScheme();
  
  // If theme is set to 'system', use the system color scheme
  const currentColorScheme = theme === 'system' ? systemColorScheme : theme;
  
  return {
    colorScheme: currentColorScheme || 'light',
    isDark: currentColorScheme === 'dark',
    setColorScheme: setTheme,
  };
};