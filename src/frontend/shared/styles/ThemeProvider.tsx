import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import defaultTheme, { colors } from './theme';

// Định nghĩa kiểu dữ liệu cho theme
export interface ThemeContextType {
  /**
   * Theme hiện tại
   */
  theme: typeof defaultTheme;
  /**
   * Chế độ màu (light/dark)
   */
  colorMode: 'light' | 'dark';
  /**
   * Thay đổi chế độ màu
   */
  toggleColorMode: () => void;
  /**
   * Đặt chế độ màu cụ thể
   */
  setColorMode: (mode: 'light' | 'dark') => void;
}

// Tạo context cho theme
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export interface ThemeProviderProps {
  /**
   * Các component con
   */
  children: React.ReactNode;
  /**
   * Theme tùy chỉnh (nếu có)
   */
  customTheme?: typeof defaultTheme;
  /**
   * Chế độ màu mặc định
   */
  defaultColorMode?: 'light' | 'dark' | 'system';
}

/**
 * Component ThemeProvider cung cấp theme cho toàn bộ ứng dụng
 * 
 * @example
 * ```jsx
 * // Trong App.tsx hoặc component gốc
 * import { ThemeProvider } from './shared/styles/ThemeProvider';
 * 
 * const App = () => {
 *   return (
 *     <ThemeProvider defaultColorMode="system">
 *       <RootNavigator />
 *     </ThemeProvider>
 *   );
 * };
 * ```
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  customTheme,
  defaultColorMode = 'system',
}) => {
  // Lấy chế độ màu từ hệ thống
  const systemColorScheme = useColorScheme();
  
  // State cho chế độ màu hiện tại
  const [colorMode, setColorMode] = useState<'light' | 'dark'>(
    defaultColorMode === 'system' 
      ? (systemColorScheme as 'light' | 'dark') || 'light'
      : defaultColorMode as 'light' | 'dark'
  );

  // Cập nhật chế độ màu khi hệ thống thay đổi
  useEffect(() => {
    if (defaultColorMode === 'system' && systemColorScheme) {
      setColorMode(systemColorScheme as 'light' | 'dark');
    }
  }, [systemColorScheme, defaultColorMode]);

  // Chuyển đổi giữa light và dark mode
  const toggleColorMode = () => {
    setColorMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Tạo theme dựa trên chế độ màu
  const theme = {
    ...defaultTheme,
    ...customTheme,
    colors: {
      ...defaultTheme.colors,
      ...(customTheme?.colors || {}),
      // Thêm các màu dark mode nếu cần
      ...(colorMode === 'dark' && {
        background: '#121212',
        backgroundDark: '#1E1E1E',
        text: '#FFFFFF',
        textLight: '#BBBBBB',
        textDark: '#EEEEEE',
        // Các màu khác cho dark mode
      }),
    },
  };

  // Giá trị context
  const contextValue: ThemeContextType = {
    theme,
    colorMode,
    toggleColorMode,
    setColorMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};