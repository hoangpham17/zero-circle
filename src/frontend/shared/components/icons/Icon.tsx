import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../styles/theme';

// Định nghĩa các loại icon có thể sử dụng
export type IconName =
  | 'meditation'
  | 'dharma'
  | 'community'
  | 'profile'
  | 'settings'
  | 'play'
  | 'pause'
  | 'stop'
  | 'forward'
  | 'backward'
  | 'heart'
  | 'heart-filled'
  | 'bookmark'
  | 'bookmark-filled'
  | 'share'
  | 'comment'
  | 'notification'
  | 'search'
  | 'close'
  | 'check'
  | 'arrow-left'
  | 'arrow-right'
  | 'arrow-up'
  | 'arrow-down'
  | 'plus'
  | 'minus'
  | 'edit'
  | 'delete'
  | 'calendar'
  | 'time'
  | 'audio'
  | 'video'
  | 'download'
  | 'upload'
  | 'menu'
  | 'filter'
  | 'sort';

export interface IconProps {
  /**
   * Tên icon cần hiển thị
   */
  name: IconName;
  /**
   * Kích thước icon
   * @default 24
   */
  size?: number;
  /**
   * Màu sắc icon
   * @default colors.text
   */
  color?: string;
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
 * Component Icon dùng chung cho toàn bộ ứng dụng
 * 
 * @example
 * ```jsx
 * <Icon name="meditation" size={24} color={colors.primary} />
 * ```
 * 
 * Lưu ý: Đây là component mẫu, cần tích hợp với thư viện icon thực tế như
 * react-native-vector-icons hoặc custom SVG icons.
 */
const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = colors.text,
  style,
  testID,
}) => {
  // Placeholder component - cần thay thế bằng thư viện icon thực tế
  // Ví dụ: react-native-vector-icons hoặc custom SVG icons
  
  // Trong thực tế, bạn sẽ import và sử dụng thư viện icon như sau:
  // import Icon from 'react-native-vector-icons/MaterialIcons';
  // return <Icon name={name} size={size} color={color} style={style} testID={testID} />;
  
  return (
    <View
      style={[
        styles.placeholder,
        { width: size, height: size, backgroundColor: color },
        style,
      ]}
      testID={testID}
    />
  );
};

const styles = StyleSheet.create({
  placeholder: {
    borderRadius: 4,
  },
});

export default Icon;

/**
 * Lưu ý cho việc triển khai thực tế:
 * 
 * 1. Sử dụng thư viện icon như react-native-vector-icons:
 *    - Cài đặt: npm install react-native-vector-icons
 *    - Link: npx react-native link react-native-vector-icons
 *    - Import: import Icon from 'react-native-vector-icons/MaterialIcons';
 * 
 * 2. Hoặc sử dụng SVG icons:
 *    - Cài đặt: npm install react-native-svg
 *    - Tạo các component SVG riêng cho từng icon
 *    - Tạo một wrapper component để quản lý tất cả các icon
 * 
 * 3. Hoặc sử dụng thư viện như react-native-heroicons:
 *    - Cài đặt: npm install react-native-heroicons react-native-svg
 *    - Import: import { HeartIcon } from 'react-native-heroicons/solid';
 */