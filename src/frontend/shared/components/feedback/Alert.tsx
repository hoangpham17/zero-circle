import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../styles/theme';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
  /**
   * Tiêu đề của alert
   */
  title?: string;
  /**
   * Nội dung của alert
   */
  message: string;
  /**
   * Loại alert (success, error, warning, info)
   * @default 'info'
   */
  type?: AlertType;
  /**
   * Sự kiện khi đóng alert
   */
  onClose?: () => void;
  /**
   * Cho phép đóng alert
   * @default true
   */
  closable?: boolean;
  /**
   * Style tùy chỉnh cho container
   */
  style?: ViewStyle;
  /**
   * Style tùy chỉnh cho title
   */
  titleStyle?: TextStyle;
  /**
   * Style tùy chỉnh cho message
   */
  messageStyle?: TextStyle;
  /**
   * Thuộc tính testID cho testing
   */
  testID?: string;
}

/**
 * Component Alert dùng chung cho toàn bộ ứng dụng
 * 
 * @example
 * ```jsx
 * // Alert thông báo thành công
 * <Alert 
 *   title="Thành công" 
 *   message="Bạn đã hoàn thành bài thiền!" 
 *   type="success" 
 * />
 * 
 * // Alert thông báo lỗi
 * <Alert 
 *   message="Đã xảy ra lỗi khi tải dữ liệu" 
 *   type="error" 
 *   onClose={() => console.log('Alert closed')} 
 * />
 * ```
 */
const Alert: React.FC<AlertProps> = ({
  title,
  message,
  type = 'info',
  onClose,
  closable = true,
  style,
  titleStyle,
  messageStyle,
  testID,
}) => {
  // Xác định màu sắc dựa trên type
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: colors.success + '10', // 10% opacity
          borderColor: colors.success,
          titleColor: colors.success,
        };
      case 'error':
        return {
          backgroundColor: colors.error + '10',
          borderColor: colors.error,
          titleColor: colors.error,
        };
      case 'warning':
        return {
          backgroundColor: colors.warning + '10',
          borderColor: colors.warning,
          titleColor: colors.warning,
        };
      case 'info':
      default:
        return {
          backgroundColor: colors.info + '10',
          borderColor: colors.info,
          titleColor: colors.info,
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: typeStyles.backgroundColor,
          borderColor: typeStyles.borderColor,
        },
        style,
      ]}
      testID={testID}
    >
      <View style={styles.contentContainer}>
        {title && (
          <Text
            style={[
              styles.title,
              { color: typeStyles.titleColor },
              titleStyle,
            ]}
            testID={`${testID}-title`}
          >
            {title}
          </Text>
        )}
        <Text
          style={[styles.message, messageStyle]}
          testID={`${testID}-message`}
        >
          {message}
        </Text>
      </View>

      {closable && onClose && (
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          testID={`${testID}-close`}
        >
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
    marginTop: -spacing.xs,
  },
  closeButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.gray600,
  },
});

export default Alert;