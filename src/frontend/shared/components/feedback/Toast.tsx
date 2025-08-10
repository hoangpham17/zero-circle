import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, spacing, typography, borderRadius, zIndex } from '../../styles/theme';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  /**
   * Nội dung hiển thị trong toast
   */
  message: string;
  /**
   * Loại toast (success, error, warning, info)
   * @default 'info'
   */
  type?: ToastType;
  /**
   * Thời gian hiển thị toast (ms)
   * @default 3000
   */
  duration?: number;
  /**
   * Sự kiện khi đóng toast
   */
  onClose?: () => void;
  /**
   * Vị trí hiển thị toast (top, bottom)
   * @default 'top'
   */
  position?: 'top' | 'bottom';
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
 * Component Toast dùng chung cho toàn bộ ứng dụng
 * 
 * @example
 * ```jsx
 * // Toast thông báo thành công
 * <Toast message="Lưu thành công!" type="success" />
 * 
 * // Toast thông báo lỗi
 * <Toast message="Đã xảy ra lỗi!" type="error" position="bottom" />
 * ```
 */
const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
  position = 'top',
  style,
  textStyle,
  testID,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(position === 'top' ? -20 : 20)).current;

  useEffect(() => {
    // Hiệu ứng hiển thị toast
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Tự động ẩn toast sau khoảng thời gian duration
    const timer = setTimeout(() => {
      hideToast();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  // Hiệu ứng ẩn toast
  const hideToast = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: position === 'top' ? -20 : 20,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose && onClose();
    });
  };

  // Xác định màu nền dựa trên type
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'warning':
        return colors.warning;
      case 'info':
      default:
        return colors.info;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        styles[`${position}Container`],
        { backgroundColor: getBackgroundColor() },
        { opacity, transform: [{ translateY }] },
        style,
      ]}
      testID={testID}
    >
      <Text style={[styles.message, textStyle]} testID={`${testID}-message`}>
        {message}
      </Text>
      <TouchableOpacity
        onPress={hideToast}
        style={styles.closeButton}
        testID={`${testID}-close`}
      >
        <Text style={styles.closeButtonText}>×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    zIndex: zIndex.toast,
  },
  topContainer: {
    top: spacing.xl,
  },
  bottomContainer: {
    bottom: spacing.xl,
  },
  message: {
    flex: 1,
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
  },
  closeButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  closeButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
  },
});

export default Toast;