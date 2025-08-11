import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetworkState } from './useAppState';
import { useAnalytics } from './useAnalytics';
import { useNotificationSystem } from './useNotificationSystem';

// Types for user levels and progress
export interface UserLevel {
  level: number;
  title: string;
  description: string;
  minExperience: number;
  maxExperience: number;
  icon: string;
  color: string;
  benefits: string[];
}

export interface UserProgress {
  currentLevel: number;
  experience: number;
  experienceToNextLevel: number;
  totalMeditationMinutes: number;
  totalMeditationSessions: number;
  totalContentCompleted: number;
  longestStreak: number;
  currentStreak: number;
  lastMeditationDate?: string;
  achievements: string[]; // IDs of completed achievements
  completedGoals: string[]; // IDs of completed goals
  customStats: Record<string, any>; // For any additional stats
}

// Storage keys
const USER_PROGRESS_STORAGE_KEY = 'zero_circle_user_progress';

/**
 * Hook for managing user progress and levels
 */
export const useUserProgress = () => {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [levels, setLevels] = useState<UserLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { isConnected } = useNetworkState();
  const { trackCustomEvent } = useAnalytics();
  const { scheduleNotification } = useNotificationSystem();
  
  // Initialize levels
  useEffect(() => {
    setLevels(getDefaultLevels());
  }, []);
  
  // Load user progress from storage on mount
  useEffect(() => {
    const loadUserProgress = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const storedProgress = await AsyncStorage.getItem(USER_PROGRESS_STORAGE_KEY);
        
        if (storedProgress) {
          setUserProgress(JSON.parse(storedProgress));
        } else {
          // Initialize with default progress if none exists
          const defaultProgress = getDefaultUserProgress();
          setUserProgress(defaultProgress);
          await AsyncStorage.setItem(USER_PROGRESS_STORAGE_KEY, JSON.stringify(defaultProgress));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load user progress'));
        console.error('Failed to load user progress:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserProgress();
  }, []);
  
  // Save user progress to storage whenever it changes
  useEffect(() => {
    if (!isLoading && userProgress) {
      const saveUserProgress = async () => {
        try {
          await AsyncStorage.setItem(USER_PROGRESS_STORAGE_KEY, JSON.stringify(userProgress));
        } catch (err) {
          console.error('Failed to save user progress:', err);
        }
      };
      
      saveUserProgress();
    }
  }, [userProgress, isLoading]);
  
  // Get default user levels
  const getDefaultLevels = (): UserLevel[] => {
    return [
      {
        level: 1,
        title: 'Novice',
        description: 'Beginning your journey of mindfulness',
        minExperience: 0,
        maxExperience: 100,
        icon: 'seedling',
        color: '#8BC34A',
        benefits: ['Access to basic meditations'],
      },
      {
        level: 2,
        title: 'Apprentice',
        description: 'Building a foundation of mindfulness',
        minExperience: 100,
        maxExperience: 300,
        icon: 'leaf',
        color: '#4CAF50',
        benefits: ['Access to intermediate meditations', 'Daily streak tracking'],
      },
      {
        level: 3,
        title: 'Practitioner',
        description: 'Developing a consistent practice',
        minExperience: 300,
        maxExperience: 600,
        icon: 'tree',
        color: '#009688',
        benefits: ['Access to advanced meditations', 'Custom meditation timer'],
      },
      {
        level: 4,
        title: 'Adept',
        description: 'Deepening your mindfulness practice',
        minExperience: 600,
        maxExperience: 1000,
        icon: 'mountain',
        color: '#3F51B5',
        benefits: ['Access to all meditation content', 'Offline downloads'],
      },
      {
        level: 5,
        title: 'Master',
        description: 'Mastering the art of mindfulness',
        minExperience: 1000,
        maxExperience: 1500,
        icon: 'lotus',
        color: '#673AB7',
        benefits: ['Access to exclusive content', 'Advanced statistics'],
      },
      {
        level: 6,
        title: 'Sage',
        description: 'Embodying wisdom and compassion',
        minExperience: 1500,
        maxExperience: 2100,
        icon: 'dharmachakra',
        color: '#9C27B0',
        benefits: ['Guided courses access', 'Community features'],
      },
      {
        level: 7,
        title: 'Enlightened',
        description: 'Living with profound awareness',
        minExperience: 2100,
        maxExperience: 2800,
        icon: 'sun',
        color: '#E91E63',
        benefits: ['All premium features', 'Early access to new content'],
      },
      {
        level: 8,
        title: 'Transcendent',
        description: 'Transcending limitations',
        minExperience: 2800,
        maxExperience: 3600,
        icon: 'universe',
        color: '#FF5722',
        benefits: ['Personalized meditation paths', 'Advanced insights'],
      },
      {
        level: 9,
        title: 'Bodhisattva',
        description: 'Helping others on their path',
        minExperience: 3600,
        maxExperience: 4500,
        icon: 'hands-helping',
        color: '#FF9800',
        benefits: ['Mentor features', 'Content sharing'],
      },
      {
        level: 10,
        title: 'Buddha',
        description: 'Complete awakening and compassion',
        minExperience: 4500,
        maxExperience: Infinity,
        icon: 'buddha',
        color: '#FFC107',
        benefits: ['All features unlocked', 'Special recognition'],
      },
    ];
  };
  
  // Get default user progress
  const getDefaultUserProgress = (): UserProgress => {
    return {
      currentLevel: 1,
      experience: 0,
      experienceToNextLevel: 100,
      totalMeditationMinutes: 0,
      totalMeditationSessions: 0,
      totalContentCompleted: 0,
      longestStreak: 0,
      currentStreak: 0,
      achievements: [],
      completedGoals: [],
      customStats: {},
    };
  };
  
  // Get current level data
  const getCurrentLevelData = useCallback(() => {
    if (!userProgress) return null;
    
    return levels.find(level => level.level === userProgress.currentLevel) || null;
  }, [userProgress, levels]);
  
  // Get next level data
  const getNextLevelData = useCallback(() => {
    if (!userProgress) return null;
    
    return levels.find(level => level.level === userProgress.currentLevel + 1) || null;
  }, [userProgress, levels]);
  
  // Calculate level progress percentage
  const getLevelProgressPercentage = useCallback(() => {
    if (!userProgress) return 0;
    
    const currentLevel = levels.find(level => level.level === userProgress.currentLevel);
    if (!currentLevel) return 0;
    
    const levelRange = currentLevel.maxExperience - currentLevel.minExperience;
    const userProgressInLevel = userProgress.experience - currentLevel.minExperience;
    
    return Math.min(100, Math.round((userProgressInLevel / levelRange) * 100));
  }, [userProgress, levels]);
  
  // Add experience points
  const addExperience = useCallback((points: number, source: string) => {
    if (!userProgress) return;
    
    setUserProgress(prevProgress => {
      if (!prevProgress) return prevProgress;
      
      const currentLevel = levels.find(level => level.level === prevProgress.currentLevel);
      if (!currentLevel) return prevProgress;
      
      let newExperience = prevProgress.experience + points;
      let newLevel = prevProgress.currentLevel;
      let leveledUp = false;
      
      // Check if user leveled up
      while (newExperience >= currentLevel.maxExperience && newLevel < levels.length) {
        newLevel++;
        leveledUp = true;
      }
      
      // If leveled up, get the new level data
      const newLevelData = levels.find(level => level.level === newLevel);
      const experienceToNextLevel = newLevelData ? 
        (newLevelData.maxExperience - newExperience) : 
        0;
      
      // If leveled up, track the event and send notification
      if (leveledUp) {
        trackCustomEvent('level_up', {
          previous_level: prevProgress.currentLevel,
          new_level: newLevel,
          experience: newExperience,
        });
        
        scheduleNotification({
          title: 'Level Up!',
          body: `Congratulations! You've reached level ${newLevel}: ${newLevelData?.title}`,
          data: {
            screen: 'Profile',
            tab: 'Progress',
          },
        }, null);
      }
      
      // Track experience gain
      trackCustomEvent('experience_gained', {
        amount: points,
        source,
        new_total: newExperience,
      });
      
      return {
        ...prevProgress,
        currentLevel: newLevel,
        experience: newExperience,
        experienceToNextLevel,
      };
    });
  }, [userProgress, levels, trackCustomEvent, scheduleNotification]);
  
  // Update meditation stats
  const updateMeditationStats = useCallback((minutes: number, isNewSession: boolean = true) => {
    if (!userProgress) return;
    
    setUserProgress(prevProgress => {
      if (!prevProgress) return prevProgress;
      
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const lastMeditationDate = prevProgress.lastMeditationDate?.split('T')[0];
      
      // Calculate streak
      let newStreak = prevProgress.currentStreak;
      
      if (isNewSession) {
        // If this is the first meditation of the day
        if (lastMeditationDate !== today) {
          // Check if the last meditation was yesterday
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayString = yesterday.toISOString().split('T')[0];
          
          if (lastMeditationDate === yesterdayString) {
            // Continuing the streak
            newStreak += 1;
          } else if (lastMeditationDate !== today) {
            // Streak broken, starting a new one
            newStreak = 1;
          }
        }
      }
      
      // Update longest streak if needed
      const newLongestStreak = Math.max(prevProgress.longestStreak, newStreak);
      
      // Add experience points for meditation (1 point per minute)
      // This will be handled by the addExperience function separately
      
      return {
        ...prevProgress,
        totalMeditationMinutes: prevProgress.totalMeditationMinutes + minutes,
        totalMeditationSessions: isNewSession ? 
          prevProgress.totalMeditationSessions + 1 : 
          prevProgress.totalMeditationSessions,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastMeditationDate: now.toISOString(),
      };
    });
    
    // Add experience for meditation (1 point per minute)
    addExperience(minutes, 'meditation');
    
    // Track meditation stats update
    trackCustomEvent('meditation_stats_updated', {
      minutes_added: minutes,
      is_new_session: isNewSession,
    });
  }, [userProgress, addExperience, trackCustomEvent]);
  
  // Update content completion stats
  const updateContentStats = useCallback((count: number = 1) => {
    if (!userProgress) return;
    
    setUserProgress(prevProgress => {
      if (!prevProgress) return prevProgress;
      
      return {
        ...prevProgress,
        totalContentCompleted: prevProgress.totalContentCompleted + count,
      };
    });
    
    // Add experience for content completion (5 points per content)
    addExperience(5 * count, 'content_completion');
    
    // Track content stats update
    trackCustomEvent('content_stats_updated', {
      count_added: count,
    });
  }, [userProgress, addExperience, trackCustomEvent]);
  
  // Add completed achievement
  const addCompletedAchievement = useCallback((achievementId: string) => {
    if (!userProgress) return;
    
    setUserProgress(prevProgress => {
      if (!prevProgress) return prevProgress;
      
      // Check if achievement is already completed
      if (prevProgress.achievements.includes(achievementId)) {
        return prevProgress;
      }
      
      return {
        ...prevProgress,
        achievements: [...prevProgress.achievements, achievementId],
      };
    });
    
    // Add experience for achievement completion (10 points per achievement)
    addExperience(10, 'achievement_completion');
    
    // Track achievement completion
    trackCustomEvent('achievement_added_to_progress', {
      achievement_id: achievementId,
    });
  }, [userProgress, addExperience, trackCustomEvent]);
  
  // Add completed goal
  const addCompletedGoal = useCallback((goalId: string) => {
    if (!userProgress) return;
    
    setUserProgress(prevProgress => {
      if (!prevProgress) return prevProgress;
      
      // Check if goal is already completed
      if (prevProgress.completedGoals.includes(goalId)) {
        return prevProgress;
      }
      
      return {
        ...prevProgress,
        completedGoals: [...prevProgress.completedGoals, goalId],
      };
    });
    
    // Add experience for goal completion (5 points per goal)
    addExperience(5, 'goal_completion');
    
    // Track goal completion
    trackCustomEvent('goal_added_to_progress', {
      goal_id: goalId,
    });
  }, [userProgress, addExperience, trackCustomEvent]);
  
  // Update custom stat
  const updateCustomStat = useCallback((key: string, value: any) => {
    if (!userProgress) return;
    
    setUserProgress(prevProgress => {
      if (!prevProgress) return prevProgress;
      
      return {
        ...prevProgress,
        customStats: {
          ...prevProgress.customStats,
          [key]: value,
        },
      };
    });
    
    // Track custom stat update
    trackCustomEvent('custom_stat_updated', {
      stat_key: key,
      stat_value: value,
    });
  }, [userProgress, trackCustomEvent]);
  
  // Reset user progress
  const resetUserProgress = useCallback(async () => {
    try {
      const defaultProgress = getDefaultUserProgress();
      setUserProgress(defaultProgress);
      await AsyncStorage.setItem(USER_PROGRESS_STORAGE_KEY, JSON.stringify(defaultProgress));
      
      // Track progress reset
      trackCustomEvent('progress_reset', {});
      
      return true;
    } catch (err) {
      console.error('Failed to reset user progress:', err);
      return false;
    }
  }, [trackCustomEvent]);
  
  // Sync user progress with server
  const syncUserProgress = useCallback(async () => {
    if (!isConnected || !userProgress) {
      return { synced: false, error: 'No internet connection or no progress data' };
    }
    
    try {
      // TODO: Implement actual API call to sync user progress with server
      // For now, just simulate syncing
      console.log('Syncing user progress with server');
      
      // Track sync attempt
      trackCustomEvent('progress_sync_attempted', {
        success: true,
      });
      
      return { synced: true };
    } catch (err) {
      console.error('Failed to sync user progress:', err);
      
      // Track sync failure
      trackCustomEvent('progress_sync_attempted', {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
      
      return { synced: false, error: err };
    }
  }, [isConnected, userProgress, trackCustomEvent]);
  
  return {
    userProgress,
    levels,
    isLoading,
    error,
    getCurrentLevelData,
    getNextLevelData,
    getLevelProgressPercentage,
    addExperience,
    updateMeditationStats,
    updateContentStats,
    addCompletedAchievement,
    addCompletedGoal,
    updateCustomStat,
    resetUserProgress,
    syncUserProgress,
  };
};

/**
 * Hook for managing user streaks specifically
 */
export const useUserStreaks = () => {
  const { 
    userProgress, 
    updateMeditationStats,
    updateCustomStat,
  } = useUserProgress();
  
  const { trackCustomEvent } = useAnalytics();
  
  // Get current streak
  const getCurrentStreak = useCallback(() => {
    return userProgress?.currentStreak || 0;
  }, [userProgress]);
  
  // Get longest streak
  const getLongestStreak = useCallback(() => {
    return userProgress?.longestStreak || 0;
  }, [userProgress]);
  
  // Check if user meditated today
  const hasMeditatedToday = useCallback(() => {
    if (!userProgress?.lastMeditationDate) return false;
    
    const today = new Date().toISOString().split('T')[0];
    const lastMeditationDate = userProgress.lastMeditationDate.split('T')[0];
    
    return lastMeditationDate === today;
  }, [userProgress]);
  
  // Get days since last meditation
  const getDaysSinceLastMeditation = useCallback(() => {
    if (!userProgress?.lastMeditationDate) return null;
    
    const today = new Date();
    const lastMeditation = new Date(userProgress.lastMeditationDate);
    
    const diffTime = Math.abs(today.getTime() - lastMeditation.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }, [userProgress]);
  
  // Record a meditation for today (to maintain streak)
  const recordMeditationForToday = useCallback(() => {
    // If already meditated today, do nothing
    if (hasMeditatedToday()) return;
    
    // Record a minimal meditation (1 minute) to maintain streak
    updateMeditationStats(1, true);
    
    // Track streak maintenance
    trackCustomEvent('streak_maintained', {
      current_streak: userProgress?.currentStreak || 0,
    });
  }, [userProgress, hasMeditatedToday, updateMeditationStats, trackCustomEvent]);
  
  // Get streak history (last 30 days)
  const getStreakHistory = useCallback(() => {
    // This would typically come from a more detailed history stored in customStats
    // For now, we'll return a placeholder
    const streakHistory = userProgress?.customStats?.streakHistory || [];
    
    // If no history exists, return empty array
    if (!streakHistory.length) {
      return [];
    }
    
    return streakHistory;
  }, [userProgress]);
  
  // Update streak history
  const updateStreakHistory = useCallback((date: string, didMeditate: boolean) => {
    const history = userProgress?.customStats?.streakHistory || [];
    
    // Add or update the entry for this date
    const updatedHistory = [
      ...history.filter(entry => entry.date !== date),
      { date, didMeditate },
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Keep only the last 30 days
    const last30Days = updatedHistory.slice(-30);
    
    // Update the custom stat
    updateCustomStat('streakHistory', last30Days);
  }, [userProgress, updateCustomStat]);
  
  return {
    getCurrentStreak,
    getLongestStreak,
    hasMeditatedToday,
    getDaysSinceLastMeditation,
    recordMeditationForToday,
    getStreakHistory,
    updateStreakHistory,
  };
};