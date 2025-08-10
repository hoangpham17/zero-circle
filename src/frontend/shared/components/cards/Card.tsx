import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, borderRadius, shadows, spacing } from '../../styles/theme';

export interface CardProps {
  /**
   * Nội dung bên trong card
   */
  children: React.ReactNode;
  /**
   * Sự kiện khi nhấn vào card
   */
  onPress?: () => void;
  /**
   * Style tùy chỉnh cho card
   */
  style?: ViewStyle;
  /**
   * Màu nền của card
   */
  backgroundColor?: string;
  /**
   * Loại card (default, elevated, outlined)
   */
  variant?: 'default' | 'elevated' | 'outlined';
  /**
   * Padding bên trong card
   */
  padding?: number;
  /**
   * Border radius của card
   */
  radius?: number;
  /**
   * Thuộc tính testID cho testing
   */
  testID?: string;
}

/**
 * Component Card dùng chung cho toàn bộ ứng dụng
 * 
 * @example
 * ```jsx
 * <Card variant="elevated" onPress={() => console.log('Card pressed')}>
 *   <Typography.Heading>Thiền buổi sáng</Typography.Heading>
 *   <Typography.Body>Bắt đầu ngày mới với 10 phút thiền.</Typography.Body>
 * </Card>
 * ```
 */
const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  backgroundColor = colors.white,
  variant = 'default',
  padding = spacing.md,
  radius = borderRadius.md,
  testID,
}) => {
  // Xác định style dựa trên variant
  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return styles.elevated;
      case 'outlined':
        return styles.outlined;
      default:
        return styles.default;
    }
  };

  // Render card có thể nhấn hoặc không
  const renderCard = () => (
    <View
      style={[
        styles.container,
        getVariantStyle(),
        { backgroundColor, padding, borderRadius: radius },
        style,
      ]}
      testID={testID}
    >
      {children}
    </View>
  );

  // Nếu có onPress thì bọc trong TouchableOpacity
  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        testID={`${testID}-touchable`}
      >
        {renderCard()}
      </TouchableOpacity>
    );
  }

  return renderCard();
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  default: {
    backgroundColor: colors.white,
  },
  elevated: {
    backgroundColor: colors.white,
    ...shadows.md,
  },
  outlined: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray300,
  },
});

export default Card;