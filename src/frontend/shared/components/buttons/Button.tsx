import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, typography } from '../../styles/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps {
  /**
   * Nội dung hiển thị trong nút
   */
  children: React.ReactNode;
  /**
   * Loại nút
   * @default 'primary'
   */
  variant?: ButtonVariant;
  /**
   * Kích thước nút
   * @default 'medium'
   */
  size?: ButtonSize;
  /**
   * Sự kiện khi nhấn nút
   */
  onPress?: () => void;
  /**
   * Vô hiệu hóa nút
   * @default false
   */
  disabled?: boolean;
  /**
   * Hiển thị trạng thái loading
   * @default false
   */
  loading?: boolean;
  /**
   * Icon hiển thị bên trái
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon hiển thị bên phải
   */
  rightIcon?: React.ReactNode;
  /**
   * Style tùy chỉnh cho container
   */
  style?: ViewStyle;
  /**
   * Style tùy chỉnh cho text
   */
  textStyle?: TextStyle;
  /**
   * Thuộc tính testID cho testing
   */
  testID?: string;
}

/**
 * Component Button dùng chung cho toàn bộ ứng dụng
 * 
 * @example
 * ```jsx
 * <Button variant="primary" onPress={handlePress}>
 *   Bắt đầu thiền
 * </Button>
 * ```
 */
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  onPress,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  testID,
}) => {
  // Xác định styles dựa trên variant và size
  const containerStyles = [
    styles.container,
    styles[`${variant}Container`],
    styles[`${size}Container`],
    disabled && styles.disabledContainer,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      testID={testID}
    >
      {leftIcon && !loading && <>{leftIcon}</>}
      
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? colors.white : colors.primary} 
        />
      ) : (
        typeof children === 'string' ? (
          <Text style={textStyles}>{children}</Text>
        ) : (
          children
        )
      )}
      
      {rightIcon && !loading && <>{rightIcon}</>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  // Variant styles
  primaryContainer: {
    backgroundColor: colors.primary,
  },
  secondaryContainer: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  tertiaryContainer: {
    backgroundColor: colors.gray100,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  // Size styles
  smallContainer: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    minHeight: 32,
  },
  mediumContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  largeContainer: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 56,
  },
  // Text styles
  text: {
    fontFamily: typography.fontFamily.medium,
    textAlign: 'center',
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.primary,
  },
  tertiaryText: {
    color: colors.text,
  },
  ghostText: {
    color: colors.primary,
  },
  // Text size styles
  smallText: {
    fontSize: typography.fontSize.sm,
  },
  mediumText: {
    fontSize: typography.fontSize.md,
  },
  largeText: {
    fontSize: typography.fontSize.lg,
  },
  // Disabled styles
  disabledContainer: {
    backgroundColor: colors.gray200,
    borderColor: colors.gray200,
    opacity: 0.7,
  },
  disabledText: {
    color: colors.gray600,
  },
});

export default Button;