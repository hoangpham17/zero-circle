import React, { useEffect } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { animation as animationConfig } from '../styles/theme';

export interface FadeAnimationProps {
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
   * Thời gian animation (ms)
   * @default 300
   */
  duration?: number;
  /**
   * Giá trị opacity ban đầu
   * @default 0
   */
  initialOpacity?: number;
  /**
   * Giá trị opacity khi hiển thị
   * @default 1
   */
  finalOpacity?: number;
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
 * Component FadeAnimation - Hiệu ứng fade in/out
 * 
 * @example
 * ```jsx
 * // Fade in/out cơ bản
 * const [visible, setVisible] = useState(false);
 * 
 * <Button onPress={() => setVisible(!visible)}>Toggle</Button>
 * 
 * <FadeAnimation visible={visible}>
 *   <View style={styles.content}>
 *     <Text>Nội dung với hiệu ứng fade</Text>
 *   </View>
 * </FadeAnimation>
 * ```
 */
const FadeAnimation: React.FC<FadeAnimationProps> = ({
  children,
  visible = true,
  duration = animationConfig.normal,
  initialOpacity = 0,
  finalOpacity = 1,
  style,
  onAnimationComplete,
}) => {
  // Animated value cho opacity
  const opacity = React.useRef(new Animated.Value(visible ? finalOpacity : initialOpacity)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? finalOpacity : initialOpacity,
      duration,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && onAnimationComplete) {
        onAnimationComplete();
      }
    });
  }, [visible, duration, initialOpacity, finalOpacity, opacity, onAnimationComplete]);

  return (
    <Animated.View style={[{ opacity }, style]}>
      {children}
    </Animated.View>
  );
};

export default FadeAnimation;