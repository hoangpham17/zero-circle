import { useRef, useEffect, useState } from 'react';
import { Animated, Easing, LayoutAnimation, Platform, UIManager } from 'react-native';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Hook for fade animation
export const useFadeAnimation = (initialValue: number = 0, duration: number = 300) => {
  const fadeAnim = useRef(new Animated.Value(initialValue)).current;

  const fadeIn = (callback?: () => void) => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start(callback ? { finished: callback } : undefined);
  };

  const fadeOut = (callback?: () => void) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start(callback ? { finished: callback } : undefined);
  };

  return { fadeAnim, fadeIn, fadeOut };
};

// Hook for slide animation
export const useSlideAnimation = (
  initialValue: number = 100,
  duration: number = 300,
  direction: 'horizontal' | 'vertical' = 'vertical'
) => {
  const slideAnim = useRef(new Animated.Value(initialValue)).current;

  const slideIn = (callback?: () => void) => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start(callback ? { finished: callback } : undefined);
  };

  const slideOut = (callback?: () => void) => {
    Animated.timing(slideAnim, {
      toValue: initialValue,
      duration,
      useNativeDriver: true,
      easing: Easing.in(Easing.ease),
    }).start(callback ? { finished: callback } : undefined);
  };

  const slideStyle = direction === 'horizontal'
    ? { transform: [{ translateX: slideAnim }] }
    : { transform: [{ translateY: slideAnim }] };

  return { slideAnim, slideIn, slideOut, slideStyle };
};

// Hook for scale animation
export const useScaleAnimation = (initialValue: number = 0, duration: number = 300) => {
  const scaleAnim = useRef(new Animated.Value(initialValue)).current;

  const scaleTo = (value: number, callback?: () => void) => {
    Animated.timing(scaleAnim, {
      toValue: value,
      duration,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start(callback ? { finished: callback } : undefined);
  };

  const scaleIn = (callback?: () => void) => scaleTo(1, callback);
  const scaleOut = (callback?: () => void) => scaleTo(initialValue, callback);

  const scaleStyle = { transform: [{ scale: scaleAnim }] };

  return { scaleAnim, scaleIn, scaleOut, scaleTo, scaleStyle };
};

// Hook for rotation animation
export const useRotationAnimation = (duration: number = 1000, loop: boolean = false) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const startRotation = (callback?: () => void) => {
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration,
      useNativeDriver: true,
      easing: Easing.linear,
    }).start(({ finished }) => {
      if (finished && loop) {
        rotateAnim.setValue(0);
        startRotation(callback);
      } else if (callback) {
        callback();
      }
    });
  };

  const stopRotation = () => {
    rotateAnim.stopAnimation();
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rotateStyle = { transform: [{ rotate: rotateInterpolate }] };

  return { rotateAnim, startRotation, stopRotation, rotateStyle };
};

// Hook for sequence animation
export const useSequenceAnimation = () => {
  const animations = useRef<Animated.CompositeAnimation[]>([]);

  const addAnimation = (animation: Animated.CompositeAnimation) => {
    animations.current.push(animation);
    return animations.current.length - 1; // Return index for potential removal
  };

  const removeAnimation = (index: number) => {
    if (index >= 0 && index < animations.current.length) {
      animations.current.splice(index, 1);
      return true;
    }
    return false;
  };

  const clearAnimations = () => {
    animations.current = [];
  };

  const runSequence = (callback?: () => void) => {
    Animated.sequence(animations.current).start(callback ? { finished: callback } : undefined);
  };

  return { addAnimation, removeAnimation, clearAnimations, runSequence };
};

// Hook for layout animation
export const useLayoutAnimation = () => {
  const configureNext = (config: LayoutAnimation.Config = LayoutAnimation.Presets.easeInEaseOut, onAnimationDidEnd?: () => void) => {
    LayoutAnimation.configureNext(config, onAnimationDidEnd);
  };

  const createAnimation = (type: keyof typeof LayoutAnimation.Types, property: keyof typeof LayoutAnimation.Properties, duration: number = 300) => {
    return {
      duration,
      create: {
        type: LayoutAnimation.Types[type],
        property: LayoutAnimation.Properties[property],
      },
      update: {
        type: LayoutAnimation.Types[type],
        property: LayoutAnimation.Properties[property],
      },
      delete: {
        type: LayoutAnimation.Types[type],
        property: LayoutAnimation.Properties[property],
      },
    };
  };

  return {
    configureNext,
    createAnimation,
    presets: {
      easeInEaseOut: LayoutAnimation.Presets.easeInEaseOut,
      linear: LayoutAnimation.Presets.linear,
      spring: LayoutAnimation.Presets.spring,
    },
  };
};

// Hook for spring animation
export const useSpringAnimation = (initialValue: number = 0) => {
  const springAnim = useRef(new Animated.Value(initialValue)).current;

  const spring = (toValue: number, config: Animated.SpringAnimationConfig = {}, callback?: () => void) => {
    Animated.spring(springAnim, {
      toValue,
      useNativeDriver: true,
      friction: 7,
      tension: 40,
      ...config,
    }).start(callback ? { finished: callback } : undefined);
  };

  return { springAnim, spring };
};

// Hook for stagger animation
export const useStaggerAnimation = (count: number, initialValue: number = 0) => {
  const [staggerAnims] = useState(() => 
    Array(count).fill(0).map(() => new Animated.Value(initialValue))
  );

  const stagger = (
    toValue: number,
    duration: number = 300,
    delay: number = 50,
    callback?: () => void
  ) => {
    Animated.stagger(
      delay,
      staggerAnims.map(anim =>
        Animated.timing(anim, {
          toValue,
          duration,
          useNativeDriver: true,
          easing: Easing.ease,
        })
      )
    ).start(callback ? { finished: callback } : undefined);
  };

  return { staggerAnims, stagger };
};