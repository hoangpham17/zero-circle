import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../../styles/theme';

export interface LoadingProps {
  /**
   * Hiển thị text bên dưới loading spinner
   */
  text?: string;
  /**
   * Kích thước của loading spinner (small, large)
   * @default 'large'
   */
  size?: 'small' | 'large';
  /**
   * Màu sắc của loading spinner
   * @default colors.primary
   */
  color?: string;
  /**
   * Hiển thị loading spinner toàn màn hình
   * @default false
   */
  fullscreen?: boolean;
  /**
   * Style tùy chỉnh cho container
   */
  style?: ViewStyle;
  /**
   * Thuộc tính testID cho testing
   */
  testID?: string;
}

/**
 * Component Loading dùng chung cho toàn bộ ứng dụng
 * 
 * @example
 * ```jsx
 * // Loading spinner cơ bản
 * <Loading />
 * 
 * // Loading spinner với text
 * <Loading text="Đang tải..." />
 * 
 * // Loading spinner toàn màn hình
 * <Loading fullscreen text="Đang tải dữ liệu..." />
 * ```
 */
const Loading: React.FC<LoadingProps> = ({
  text,
  size = 'large',
  color = colors.primary,
  fullscreen = false,
  style,
  testID,
}) => {
  const containerStyles = [
    styles.container,
    fullscreen && styles.fullscreen,
    style,
  ];

  return (
    <View style={containerStyles} testID={testID}>
      <ActivityIndicator size={size} color={color} testID={`${testID}-spinner`} />
      {text && (
        <Text style={styles.text} testID={`${testID}-text`}>
          {text}
        </Text>
      )}
    </View>
  );
};

/**
 * Component LoadingOverlay - Hiển thị loading spinner với overlay mờ phía sau
 */
export const LoadingOverlay: React.FC<LoadingProps> = (props) => (
  <View style={styles.overlay} testID={`${props.testID}-overlay`}>
    <Loading {...props} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  fullscreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1000,
  },
  text: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    textAlign: 'center',
  },
});

export default Loading;