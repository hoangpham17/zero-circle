import { useContext } from 'react';
import { ThemeContext, ThemeContextType } from '../styles/ThemeProvider';

/**
 * Hook để truy cập theme trong ứng dụng
 * 
 * @returns Theme context hiện tại
 * 
 * @example
 * ```jsx
 * import { useTheme } from '../hooks/useTheme';
 * 
 * const MyComponent = () => {
 *   const { colors, spacing, typography } = useTheme();
 *   
 *   return (
 *     <View style={{ backgroundColor: colors.background, padding: spacing.md }}>
 *       <Text style={{ fontSize: typography.fontSize.md }}>Hello World</Text>
 *     </View>
 *   );
 * };
 * ```
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};