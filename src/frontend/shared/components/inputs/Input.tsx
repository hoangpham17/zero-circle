import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  TextInputProps,
  Platform,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../styles/theme';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  /**
   * Label hiển thị phía trên input
   */
  label?: string;
  /**
   * Placeholder khi input trống
   */
  placeholder?: string;
  /**
   * Giá trị của input
   */
  value: string;
  /**
   * Sự kiện khi giá trị thay đổi
   */
  onChangeText: (text: string) => void;
  /**
   * Hiển thị thông báo lỗi
   */
  error?: string;
  /**
   * Hiển thị thông báo gợi ý
   */
  hint?: string;
  /**
   * Icon hiển thị bên trái
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon hiển thị bên phải
   */
  rightIcon?: React.ReactNode;
  /**
   * Sự kiện khi nhấn vào icon bên phải
   */
  onRightIconPress?: () => void;
  /**
   * Style tùy chỉnh cho container
   */
  containerStyle?: ViewStyle;
  /**
   * Style tùy chỉnh cho input
   */
  inputStyle?: TextStyle;
  /**
   * Style tùy chỉnh cho label
   */
  labelStyle?: TextStyle;
  /**
   * Thuộc tính testID cho testing
   */
  testID?: string;
}

/**
 * Component Input dùng chung cho toàn bộ ứng dụng
 * 
 * @example
 * ```jsx
 * const [email, setEmail] = useState('');
 * 
 * <Input
 *   label="Email"
 *   placeholder="Nhập email của bạn"
 *   value={email}
 *   onChangeText={setEmail}
 *   keyboardType="email-address"
 * />
 * ```
 */
const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  testID,
  secureTextEntry,
  ...restProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    restProps.onFocus && restProps.onFocus(null as any);
  };

  const handleBlur = () => {
    setIsFocused(false);
    restProps.onBlur && restProps.onBlur(null as any);
  };

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      {label && (
        <Text style={[styles.label, labelStyle]} testID={`${testID}-label`}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedInputContainer,
          error && styles.errorInputContainer,
        ]}
      >
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.gray500}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry}
          testID={`${testID}-input`}
          {...restProps}
        />

        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            testID={`${testID}-right-icon`}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {(error || hint) && (
        <Text
          style={[styles.helperText, error ? styles.errorText : styles.hintText]}
          testID={error ? `${testID}-error` : `${testID}-hint`}
        >
          {error || hint}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    width: '100%',
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    minHeight: 48,
  },
  focusedInputContainer: {
    borderColor: colors.primary,
  },
  errorInputContainer: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : 0,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  leftIconContainer: {
    paddingLeft: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconContainer: {
    paddingRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  errorText: {
    color: colors.error,
    fontFamily: typography.fontFamily.medium,
  },
  hintText: {
    color: colors.textLight,
    fontFamily: typography.fontFamily.regular,
  },
});

export default Input;