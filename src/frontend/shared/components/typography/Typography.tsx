import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { colors, typography as typographyTheme } from '../../styles/theme';

export interface TypographyProps {
  /**
   * Nội dung text
   */
  children: React.ReactNode;
  /**
   * Màu của text
   */
  color?: string;
  /**
   * Căn chỉnh text
   */
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  /**
   * Style tùy chỉnh
   */
  style?: TextStyle;
  /**
   * Số dòng tối đa
   */
  numberOfLines?: number;
  /**
   * Sự kiện khi nhấn vào text
   */
  onPress?: () => void;
  /**
   * Thuộc tính testID cho testing
   */
  testID?: string;
}

/**
 * Component Heading - Tiêu đề lớn
 */
const Heading: React.FC<TypographyProps> = ({
  children,
  color = colors.textDark,
  align = 'left',
  style,
  numberOfLines,
  onPress,
  testID,
}) => (
  <Text
    style={[
      styles.base,
      styles.heading,
      { color, textAlign: align },
      style,
    ]}
    numberOfLines={numberOfLines}
    onPress={onPress}
    testID={testID}
  >
    {children}
  </Text>
);

/**
 * Component Subheading - Tiêu đề phụ
 */
const Subheading: React.FC<TypographyProps> = ({
  children,
  color = colors.textDark,
  align = 'left',
  style,
  numberOfLines,
  onPress,
  testID,
}) => (
  <Text
    style={[
      styles.base,
      styles.subheading,
      { color, textAlign: align },
      style,
    ]}
    numberOfLines={numberOfLines}
    onPress={onPress}
    testID={testID}
  >
    {children}
  </Text>
);

/**
 * Component Body - Văn bản chính
 */
const Body: React.FC<TypographyProps> = ({
  children,
  color = colors.text,
  align = 'left',
  style,
  numberOfLines,
  onPress,
  testID,
}) => (
  <Text
    style={[
      styles.base,
      styles.body,
      { color, textAlign: align },
      style,
    ]}
    numberOfLines={numberOfLines}
    onPress={onPress}
    testID={testID}
  >
    {children}
  </Text>
);

/**
 * Component Caption - Chú thích
 */
const Caption: React.FC<TypographyProps> = ({
  children,
  color = colors.textLight,
  align = 'left',
  style,
  numberOfLines,
  onPress,
  testID,
}) => (
  <Text
    style={[
      styles.base,
      styles.caption,
      { color, textAlign: align },
      style,
    ]}
    numberOfLines={numberOfLines}
    onPress={onPress}
    testID={testID}
  >
    {children}
  </Text>
);

/**
 * Component Label - Nhãn
 */
const Label: React.FC<TypographyProps> = ({
  children,
  color = colors.text,
  align = 'left',
  style,
  numberOfLines,
  onPress,
  testID,
}) => (
  <Text
    style={[
      styles.base,
      styles.label,
      { color, textAlign: align },
      style,
    ]}
    numberOfLines={numberOfLines}
    onPress={onPress}
    testID={testID}
  >
    {children}
  </Text>
);

/**
 * Component Quote - Trích dẫn
 */
const Quote: React.FC<TypographyProps> = ({
  children,
  color = colors.text,
  align = 'left',
  style,
  numberOfLines,
  onPress,
  testID,
}) => (
  <Text
    style={[
      styles.base,
      styles.quote,
      { color, textAlign: align },
      style,
    ]}
    numberOfLines={numberOfLines}
    onPress={onPress}
    testID={testID}
  >
    {children}
  </Text>
);

const styles = StyleSheet.create({
  base: {
    fontFamily: typographyTheme.fontFamily.regular,
  },
  heading: {
    fontSize: typographyTheme.fontSize.xxl,
    lineHeight: typographyTheme.lineHeight.xxl,
    fontFamily: typographyTheme.fontFamily.bold,
    marginBottom: 8,
  },
  subheading: {
    fontSize: typographyTheme.fontSize.xl,
    lineHeight: typographyTheme.lineHeight.xl,
    fontFamily: typographyTheme.fontFamily.medium,
    marginBottom: 4,
  },
  body: {
    fontSize: typographyTheme.fontSize.md,
    lineHeight: typographyTheme.lineHeight.md,
  },
  caption: {
    fontSize: typographyTheme.fontSize.sm,
    lineHeight: typographyTheme.lineHeight.sm,
  },
  label: {
    fontSize: typographyTheme.fontSize.md,
    lineHeight: typographyTheme.lineHeight.md,
    fontFamily: typographyTheme.fontFamily.medium,
  },
  quote: {
    fontSize: typographyTheme.fontSize.md,
    lineHeight: typographyTheme.lineHeight.lg,
    fontFamily: typographyTheme.fontFamily.italic,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
  },
});

/**
 * Typography component dùng chung cho toàn bộ ứng dụng
 * 
 * @example
 * ```jsx
 * <Typography.Heading>Thiền buổi sáng</Typography.Heading>
 * <Typography.Body>Bắt đầu ngày mới với 10 phút thiền.</Typography.Body>
 * ```
 */
const Typography = {
  Heading,
  Subheading,
  Body,
  Caption,
  Label,
  Quote,
};

export default Typography;