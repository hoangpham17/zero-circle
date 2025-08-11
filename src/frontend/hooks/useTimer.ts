import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { useHaptics } from './useDevice';

const TIMER_TASK = 'BACKGROUND_TIMER_TASK';

type TimerState = {
  isRunning: boolean;
  isPaused: boolean;
  totalDuration: number; // in milliseconds
  remainingTime: number; // in milliseconds
  elapsedTime: number; // in milliseconds
  progress: number; // 0 to 1
};

type TimerControls = {
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
  setDuration: (duration: number) => void;
};

type TimerOptions = {
  duration?: number; // in milliseconds
  autoStart?: boolean;
  onComplete?: () => void;
  onTick?: (state: TimerState) => void;
  tickInterval?: number; // in milliseconds
  periodicChime?: {
    enabled: boolean;
    interval: number; // in milliseconds
    sound?: () => Promise<void>;
  };
};

// Register background task
TaskManager.defineTask(TIMER_TASK, async () => {
  try {
    // This would be where we'd update a persistent timer state
    // For now, we'll just return success
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background timer task error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const useTimer = (options: TimerOptions = {}): [TimerState, TimerControls] => {
  const {
    duration = 10 * 60 * 1000, // Default 10 minutes
    autoStart = false,
    onComplete,
    onTick,
    tickInterval = 1000, // Default 1 second
    periodicChime,
  } = options;

  const [state, setState] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    totalDuration: duration,
    remainingTime: duration,
    elapsedTime: 0,
    progress: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const lastChimeTimeRef = useRef<number>(0);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const { triggerNotification } = useHaptics();

  // Register background fetch
  useEffect(() => {
    const registerBackgroundFetch = async () => {
      try {
        await BackgroundFetch.registerTaskAsync(TIMER_TASK, {
          minimumInterval: 60, // 1 minute minimum
          stopOnTerminate: false,
          startOnBoot: true,
        });
      } catch (error) {
        console.error('Error registering background fetch:', error);
      }
    };

    registerBackgroundFetch();

    return () => {
      BackgroundFetch.unregisterTaskAsync(TIMER_TASK).catch(error => {
        console.error('Error unregistering background fetch:', error);
      });
    };
  }, []);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        state.isRunning &&
        !state.isPaused
      ) {
        // App has come to the foreground while timer was running
        // Adjust the timer to account for the time in the background
        if (startTimeRef.current !== null) {
          const now = Date.now();
          const elapsedSinceStart = now - startTimeRef.current - pausedTimeRef.current;
          const newRemainingTime = Math.max(0, state.totalDuration - elapsedSinceStart);
          
          setState(prev => ({
            ...prev,
            remainingTime: newRemainingTime,
            elapsedTime: state.totalDuration - newRemainingTime,
            progress: (state.totalDuration - newRemainingTime) / state.totalDuration,
          }));

          // If timer completed while in background
          if (newRemainingTime === 0 && onComplete) {
            onComplete();
          }
        }
      }

      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [state.isRunning, state.isPaused, state.totalDuration, onComplete]);

  // Timer tick function
  const tick = useCallback(() => {
    if (!startTimeRef.current) return;

    const now = Date.now();
    const elapsedSinceStart = now - startTimeRef.current - pausedTimeRef.current;
    const newRemainingTime = Math.max(0, state.totalDuration - elapsedSinceStart);
    const newElapsedTime = state.totalDuration - newRemainingTime;
    const newProgress = newElapsedTime / state.totalDuration;

    setState(prev => ({
      ...prev,
      remainingTime: newRemainingTime,
      elapsedTime: newElapsedTime,
      progress: newProgress,
    }));

    // Handle periodic chime
    if (
      periodicChime?.enabled &&
      periodicChime.interval > 0 &&
      newElapsedTime - lastChimeTimeRef.current >= periodicChime.interval
    ) {
      lastChimeTimeRef.current = Math.floor(newElapsedTime / periodicChime.interval) * periodicChime.interval;
      
      // Play chime sound if provided
      if (periodicChime.sound) {
        periodicChime.sound();
      }
      
      // Trigger haptic feedback
      triggerNotification();
    }

    // Call onTick callback if provided
    if (onTick) {
      onTick({
        isRunning: true,
        isPaused: false,
        totalDuration: state.totalDuration,
        remainingTime: newRemainingTime,
        elapsedTime: newElapsedTime,
        progress: newProgress,
      });
    }

    // Check if timer is complete
    if (newRemainingTime === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      setState(prev => ({
        ...prev,
        isRunning: false,
        isPaused: false,
      }));

      if (onComplete) {
        onComplete();
      }
    }
  }, [state.totalDuration, onTick, onComplete, periodicChime, triggerNotification]);

  // Start the timer
  const start = useCallback(() => {
    if (state.isRunning) return;

    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
    lastChimeTimeRef.current = 0;

    setState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      remainingTime: prev.totalDuration,
      elapsedTime: 0,
      progress: 0,
    }));

    intervalRef.current = setInterval(tick, tickInterval);
  }, [state.isRunning, tick, tickInterval]);

  // Pause the timer
  const pause = useCallback(() => {
    if (!state.isRunning || state.isPaused) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    pausedTimeRef.current = pausedTimeRef.current + (startTimeRef.current ? Date.now() - startTimeRef.current : 0);
    startTimeRef.current = null;

    setState(prev => ({
      ...prev,
      isPaused: true,
    }));
  }, [state.isRunning, state.isPaused]);

  // Resume the timer
  const resume = useCallback(() => {
    if (!state.isRunning || !state.isPaused) return;

    startTimeRef.current = Date.now();

    setState(prev => ({
      ...prev,
      isPaused: false,
    }));

    intervalRef.current = setInterval(tick, tickInterval);
  }, [state.isRunning, state.isPaused, tick, tickInterval]);

  // Stop the timer
  const stop = useCallback(() => {
    if (!state.isRunning) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    startTimeRef.current = null;
    pausedTimeRef.current = 0;

    setState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      remainingTime: prev.totalDuration,
      elapsedTime: 0,
      progress: 0,
    }));
  }, [state.isRunning]);

  // Reset the timer
  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    lastChimeTimeRef.current = 0;

    setState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      remainingTime: prev.totalDuration,
      elapsedTime: 0,
      progress: 0,
    }));
  }, []);

  // Set a new duration
  const setDuration = useCallback((newDuration: number) => {
    const wasRunning = state.isRunning;
    const wasPaused = state.isPaused;

    // Stop the timer if it's running
    if (wasRunning && !wasPaused && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      totalDuration: newDuration,
      remainingTime: newDuration,
      elapsedTime: 0,
      progress: 0,
    }));

    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    lastChimeTimeRef.current = 0;
  }, [state.isRunning, state.isPaused]);

  // Auto-start the timer if specified
  useEffect(() => {
    if (autoStart) {
      start();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoStart, start]);

  // Update duration if it changes
  useEffect(() => {
    if (duration !== state.totalDuration && !state.isRunning) {
      setState(prev => ({
        ...prev,
        totalDuration: duration,
        remainingTime: duration,
      }));
    }
  }, [duration, state.isRunning, state.totalDuration]);

  const controls: TimerControls = {
    start,
    pause,
    resume,
    stop,
    reset,
    setDuration,
  };

  return [state, controls];
};