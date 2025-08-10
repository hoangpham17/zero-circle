import React, { useEffect } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { animation as animationConfig } from '../styles/theme';

export type SlideDirection = 'left' | 'right' | 'up' | 'down';

export interface SlideAnimationProps {
  /**
   * Nội dung cần áp dụng animation
   */
  children: React.ReactNode;
  /**
   * Trạng thái hiển thị
   * @default true
   */
  visible?: boolean;
  /**
   * Hướng slide
   * @default 'left'
   */
  direction?: SlideDirection;
  /**
   * Thời gian animation (ms)
   * @default 300
   */
  duration?: number;
  /**
   * Khoảng cách slide (px)
   * @default 100
   */
  distance?: number;
  /**
   * Style tùy chỉnh
   */
  style?: ViewStyle;
  /**
   * Callback khi animation hoàn thành
   */
  onAnimationComplete?: () => void;
}

/**
 * Component SlideAnimation - Hiệu ứng slide in/out
 * 
 * @example
 * ```jsx
 * // Slide in/out từ bên trái
 * const [visible, setVisible] = useState(false);
 * 
 * <Button onPress={() => setVisible(!visible)}>Toggle</Button>
 * 
 * <SlideAnimation visible={visible} direction="left">
 *   <View style={styles.content}>
 *     <Text>Nội dung với hiệu ứng slide</Text>
 *   </View>
 * </SlideAnimation>
 * ```
 */
const SlideAnimation: React.FC<SlideAnimationProps> = ({
  children,
  visible = true,
  direction = 'left',
  duration = animationConfig.normal,
  distance = 100,
  style,
  onAnimationComplete,
}) => {
  // Xác định trục và giá trị ban đầu dựa trên hướng
  const getTransformProperty = () => {
    switch (direction) {
      case 'left':
        return { translateX: visible ? 0 : -distance };
      case 'right':
        return { translateX: visible ? 0 : distance };
      case 'up':
        return { translateY: visible ? 0 : -distance };
      case 'down':
        return { translateY: visible ? 0 : distance };
      default:
        return { translateX: visible ? 0 : -distance };
    }
  };

  // Animated value cho transform
  const translateValue = React.useRef(
    new Animated.Value(
      visible ? 0 : direction === 'left' || direction === 'up' ? -distance : distance
    )
  ).current;

  useEffect(() => {
    const toValue = visible ? 0 : direction === 'left' || direction === 'up' ? -distance : distance;

    Animated.timing(translateValue, {
      toValue,
      duration,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && onAnimationComplete) {
        onAnimationComplete();
      }
    });
  }, [visible, direction, duration, distance, translateValue, onAnimationComplete]);

  // Xác định transform style dựa trên hướng
  const getTransformStyle = () => {
    if (direction === 'left' || direction === 'right') {
      return { transform: [{ translateX: translateValue }] };
    } else {
      return { transform: [{ translateY: translateValue }] };
    }
  };

  return (
    <Animated.View style={[getTransformStyle(), style]}>
      {children}
    </Animated.View>
  );
};

export default SlideAnimation;