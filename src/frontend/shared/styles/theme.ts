/**
 * Theme configuration for ZeroCircle app
 * Định nghĩa các giá trị design system dùng chung trong toàn bộ ứng dụng
 */

// Colors
export const colors = {
  // Primary colors
  primary: '#6A5ACD', // Màu chính - Slate Blue (tượng trưng cho sự bình yên, thiền định)
  primaryLight: '#8A7CE0',
  primaryDark: '#4A3C9D',
  
  // Secondary colors
  secondary: '#9575CD', // Màu phụ - Medium Purple
  secondaryLight: '#B39DDB',
  secondaryDark: '#7953D2',
  
  // Accent colors
  accent: '#FF7043', // Màu nhấn - Deep Orange (tượng trưng cho năng lượng, sự tỉnh thức)
  accentLight: '#FF9E80',
  accentDark: '#E64A19',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  text: '#333333',
  textLight: '#757575',
  textDark: '#212121',
  
  // Gray scale
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  
  // Semantic colors
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',
  
  // Background colors
  background: '#FFFFFF',
  backgroundDark: '#F5F5F5',
  backgroundMeditation: '#F0F8FF', // Màu nền cho phần thiền
  backgroundDharma: '#FFF8E1', // Màu nền cho phần Phật pháp
  backgroundCommunity: '#F1F8E9', // Màu nền cho phần cộng đồng
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
};

// Typography
export const typography = {
  fontFamily: {
    regular: 'Roboto-Regular',
    medium: 'Roboto-Medium',
    bold: 'Roboto-Bold',
    light: 'Roboto-Light',
    italic: 'Roboto-Italic',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    display: 36,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
    xxxl: 42,
    display: 48,
  },
};

// Spacing
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
  section: 64,
};

// Border radius
export const borderRadius = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 9999,
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.0,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 5.0,
    elevation: 6,
  },
};

// Animation durations
export const animation = {
  fast: 200,
  normal: 300,
  slow: 500,
};

// Z-index values
export const zIndex = {
  base: 1,
  card: 10,
  dialog: 20,
  popover: 30,
  overlay: 40,
  modal: 50,
  toast: 60,
};

// Export default theme object
const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  zIndex,
};

export default theme;