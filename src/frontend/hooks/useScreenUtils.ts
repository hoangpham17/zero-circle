import { useState, useEffect, useCallback } from 'react';
import { Dimensions, ScaledSize, Keyboard, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

// Hook to handle screen dimensions and orientation changes
export const useScreenDimensions = () => {
  const [dimensions, setDimensions] = useState<{
    window: ScaledSize;
    screen: ScaledSize;
    isPortrait: boolean;
  }>({
    window: Dimensions.get('window'),
    screen: Dimensions.get('screen'),
    isPortrait: Dimensions.get('window').height > Dimensions.get('window').width,
  });

  useEffect(() => {
    const onChange = ({ window, screen }: { window: ScaledSize; screen: ScaledSize }) => {
      const isPortrait = window.height > window.width;
      setDimensions({ window, screen, isPortrait });
    };

    const subscription = Dimensions.addEventListener('change', onChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return dimensions;
};

// Hook to handle keyboard visibility
export const useKeyboard = () => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setKeyboardVisible(true);
        setKeyboardHeight(event.endCoordinates.height);
      }
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return { keyboardVisible, keyboardHeight, dismissKeyboard };
};

// Hook to handle safe area insets and header height
export const useScreenInsets = () => {
  const insets = useSafeAreaInsets();
  const { headerHeight } = useNavigation().getState().routes[0]?.params || { headerHeight: 0 };

  return {
    ...insets,
    headerHeight: headerHeight || 0,
    // Calculate content padding that accounts for insets and header
    contentPadding: {
      paddingTop: insets.top + (headerHeight || 0),
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },
  };
};

// Hook to handle screen focus and blur events
export const useScreenFocus = () => {
  const navigation = useNavigation();
  const [isFocused, setIsFocused] = useState(navigation.isFocused());

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => setIsFocused(true));
    const unsubscribeBlur = navigation.addListener('blur', () => setIsFocused(false));

    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigation]);

  return { isFocused };
};

// Hook to handle screen transitions and animations
export const useScreenTransition = () => {
  const navigation = useNavigation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const unsubscribeTransitionStart = navigation.addListener('transitionStart', () => {
      setIsTransitioning(true);
    });

    const unsubscribeTransitionEnd = navigation.addListener('transitionEnd', () => {
      setIsTransitioning(false);
    });

    return () => {
      unsubscribeTransitionStart();
      unsubscribeTransitionEnd();
    };
  }, [navigation]);

  return { isTransitioning };
};

// Hook to handle screen parameters
export const useScreenParams = <T extends object>() => {
  const route = useRoute();
  return route.params as T | undefined;
};

// Hook to handle status bar configuration
export const useStatusBar = () => {
  const setStatusBarStyle = useCallback((style: 'light-content' | 'dark-content') => {
    StatusBar.setBarStyle(style);
  }, []);

  const setStatusBarHidden = useCallback((hidden: boolean, animation: 'fade' | 'slide' | 'none' = 'fade') => {
    StatusBar.setHidden(hidden, animation);
  }, []);

  const setStatusBarTranslucent = useCallback((translucent: boolean) => {
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(translucent);
    }
  }, []);

  const setStatusBarColor = useCallback((color: string) => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(color);
    }
  }, []);

  return {
    setStatusBarStyle,
    setStatusBarHidden,
    setStatusBarTranslucent,
    setStatusBarColor,
  };
};