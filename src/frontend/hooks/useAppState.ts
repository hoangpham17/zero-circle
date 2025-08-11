import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import * as Application from 'expo-application';
import * as Updates from 'expo-updates';

// Hook to track app state (foreground, background, inactive)
export const useAppState = () => {
  const appStateRef = useRef(AppState.currentState);
  const [appState, setAppState] = useState(appStateRef.current);
  const [lastActiveAt, setLastActiveAt] = useState<Date | null>(new Date());
  const [inactiveTime, setInactiveTime] = useState(0);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // Calculate inactive time when app comes to foreground
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        lastActiveAt
      ) {
        const now = new Date();
        const diffMs = now.getTime() - lastActiveAt.getTime();
        setInactiveTime(diffMs);
        setLastActiveAt(now);
      } else if (nextAppState.match(/inactive|background/) && appStateRef.current === 'active') {
        // Update last active time when app goes to background
        setLastActiveAt(new Date());
      }

      appStateRef.current = nextAppState;
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [lastActiveAt]);

  return {
    appState,
    isActive: appState === 'active',
    isBackground: appState === 'background',
    isInactive: appState === 'inactive',
    lastActiveAt,
    inactiveTime,
  };
};

// Hook to track network connectivity
export const useNetworkState = () => {
  const [networkState, setNetworkState] = useState<NetInfoState | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkState(state);
    });

    // Get initial state
    NetInfo.fetch().then(state => {
      setNetworkState(state);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const refresh = useCallback(async () => {
    const state = await NetInfo.fetch();
    setNetworkState(state);
    return state;
  }, []);

  return {
    ...networkState,
    isConnected: networkState?.isConnected ?? false,
    isInternetReachable: networkState?.isInternetReachable ?? false,
    type: networkState?.type ?? 'unknown',
    refresh,
  };
};

// Hook for app version and updates
export const useAppVersion = () => {
  const [checking, setChecking] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const appVersion = Platform.OS === 'ios'
    ? Application.nativeApplicationVersion
    : Application.nativeBuildVersion;

  const appName = Application.applicationName;
  const appId = Application.applicationId;

  const checkForUpdates = useCallback(async () => {
    if (!Updates.isAvailableAsync || !Updates.checkForUpdateAsync) {
      setError(new Error('Updates API not available'));
      return false;
    }

    try {
      setChecking(true);
      setError(null);

      const isAvailable = await Updates.isAvailableAsync();
      if (isAvailable) {
        const update = await Updates.checkForUpdateAsync();
        setUpdateAvailable(update.isAvailable);
        return update.isAvailable;
      }
      
      setUpdateAvailable(false);
      return false;
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
      return false;
    } finally {
      setChecking(false);
    }
  }, []);

  const downloadUpdate = useCallback(async () => {
    if (!updateAvailable || !Updates.fetchUpdateAsync) {
      return false;
    }

    try {
      setChecking(true);
      setError(null);
      await Updates.fetchUpdateAsync();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
      return false;
    } finally {
      setChecking(false);
    }
  }, [updateAvailable]);

  const reloadApp = useCallback(async () => {
    try {
      await Updates.reloadAsync();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
      return false;
    }
  }, []);

  return {
    appVersion,
    appName,
    appId,
    checking,
    updateAvailable,
    error,
    checkForUpdates,
    downloadUpdate,
    reloadApp,
  };
};

// Hook for app session tracking
export const useAppSession = () => {
  const [sessionStartTime] = useState(new Date());
  const [sessionDuration, setSessionDuration] = useState(0);
  const { appState } = useAppState();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Update session duration every second when app is active
  useEffect(() => {
    if (appState === 'active') {
      timerRef.current = setInterval(() => {
        const now = new Date();
        const diffMs = now.getTime() - sessionStartTime.getTime();
        setSessionDuration(diffMs);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [appState, sessionStartTime]);

  return {
    sessionStartTime,
    sessionDuration,
    sessionDurationSeconds: Math.floor(sessionDuration / 1000),
    sessionDurationMinutes: Math.floor(sessionDuration / (1000 * 60)),
  };
};