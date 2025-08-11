import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetworkState } from './useAppState';
import { useAnalytics } from './useAnalytics';
import { useNotificationSystem } from './useNotificationSystem';

// Types for achievements and goals
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'meditation' | 'learning' | 'streak' | 'engagement' | 'special';
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  progress: number; // 0-100
  completed: boolean;
  completedAt?: string;
  requirements: {
    type: 'meditation_minutes' | 'meditation_sessions' | 'content_completed' | 'streak_days' | 'custom';
    target: number;
    current: number;
  };
  reward?: {
    type: 'badge' | 'content_unlock' | 'feature_unlock';
    value: string;
  };
  hidden: boolean; // Some achievements are hidden until unlocked
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'meditation' | 'learning' | 'streak' | 'custom';
  target: number;
  current: number;
  unit: string;
  startDate: string;
  endDate?: string; // Optional end date for time-bound goals
  completed: boolean;
  completedAt?: string;
  recurring: 'daily' | 'weekly' | 'monthly' | 'none';
  reminderEnabled: boolean;
  reminderTime?: string; // Format: 'HH:MM'
  customData?: Record<string, any>;
}

// Storage keys
const ACHIEVEMENTS_STORAGE_KEY = 'zero_circle_achievements';
const GOALS_STORAGE_KEY = 'zero_circle_goals';

/**
 * Hook for managing achievements
 */
export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { isConnected } = useNetworkState();
  const { trackCustomEvent } = useAnalytics();
  const { scheduleNotification } = useNotificationSystem();
  
  // Load achievements from storage on mount
  useEffect(() => {
    const loadAchievements = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const storedAchievements = await AsyncStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
        
        if (storedAchievements) {
          setAchievements(JSON.parse(storedAchievements));
        } else {
          // Initialize with default achievements if none exist
          const defaultAchievements = getDefaultAchievements();
          setAchievements(defaultAchievements);
          await AsyncStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(defaultAchievements));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load achievements'));
        console.error('Failed to load achievements:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAchievements();
  }, []);
  
  // Save achievements to storage whenever they change
  useEffect(() => {
    if (!isLoading && achievements.length > 0) {
      const saveAchievements = async () => {
        try {
          await AsyncStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(achievements));
        } catch (err) {
          console.error('Failed to save achievements:', err);
        }
      };
      
      saveAchievements();
    }
  }, [achievements, isLoading]);
  
  // Get default achievements
  const getDefaultAchievements = (): Achievement[] => {
    return [
      // Meditation achievements
      {
        id: 'meditation_first',
        title: 'First Meditation',
        description: 'Complete your first meditation session',
        icon: 'meditation',
        category: 'meditation',
        level: 'bronze',
        progress: 0,
        completed: false,
        requirements: {
          type: 'meditation_sessions',
          target: 1,
          current: 0,
        },
        reward: {
          type: 'badge',
          value: 'first_meditation',
        },
        hidden: false,
      },
      {
        id: 'meditation_10_minutes',
        title: 'Mindful Minutes',
        description: 'Meditate for a total of 10 minutes',
        icon: 'timer',
        category: 'meditation',
        level: 'bronze',
        progress: 0,
        completed: false,
        requirements: {
          type: 'meditation_minutes',
          target: 10,
          current: 0,
        },
        reward: {
          type: 'badge',
          value: 'mindful_minutes',
        },
        hidden: false,
      },
      {
        id: 'meditation_100_minutes',
        title: 'Meditation Enthusiast',
        description: 'Meditate for a total of 100 minutes',
        icon: 'timer',
        category: 'meditation',
        level: 'silver',
        progress: 0,
        completed: false,
        requirements: {
          type: 'meditation_minutes',
          target: 100,
          current: 0,
        },
        reward: {
          type: 'badge',
          value: 'meditation_enthusiast',
        },
        hidden: false,
      },
      
      // Streak achievements
      {
        id: 'streak_3_days',
        title: 'Getting Started',
        description: 'Maintain a 3-day meditation streak',
        icon: 'fire',
        category: 'streak',
        level: 'bronze',
        progress: 0,
        completed: false,
        requirements: {
          type: 'streak_days',
          target: 3,
          current: 0,
        },
        reward: {
          type: 'badge',
          value: 'streak_starter',
        },
        hidden: false,
      },
      {
        id: 'streak_7_days',
        title: 'Week Warrior',
        description: 'Maintain a 7-day meditation streak',
        icon: 'fire',
        category: 'streak',
        level: 'silver',
        progress: 0,
        completed: false,
        requirements: {
          type: 'streak_days',
          target: 7,
          current: 0,
        },
        reward: {
          type: 'badge',
          value: 'week_warrior',
        },
        hidden: false,
      },
      
      // Learning achievements
      {
        id: 'learning_first_content',
        title: 'First Steps',
        description: 'Complete your first Buddhist content',
        icon: 'book',
        category: 'learning',
        level: 'bronze',
        progress: 0,
        completed: false,
        requirements: {
          type: 'content_completed',
          target: 1,
          current: 0,
        },
        reward: {
          type: 'badge',
          value: 'first_steps',
        },
        hidden: false,
      },
    ];
  };
  
  // Update achievement progress
  const updateAchievementProgress = useCallback((
    achievementId: string,
    progress: number
  ) => {
    setAchievements(prevAchievements => {
      return prevAchievements.map(achievement => {
        if (achievement.id === achievementId) {
          const newProgress = Math.min(100, progress);
          const wasCompleted = achievement.completed;
          const isNowCompleted = newProgress >= 100;
          
          // If achievement is newly completed
          if (!wasCompleted && isNowCompleted) {
            // Track achievement completion
            trackCustomEvent('achievement_completed', {
              achievement_id: achievement.id,
              achievement_title: achievement.title,
              achievement_category: achievement.category,
              achievement_level: achievement.level,
            });
            
            // Send notification for achievement completion
            scheduleNotification({
              title: 'Achievement Unlocked!',
              body: `Congratulations! You've earned the "${achievement.title}" achievement.`,
              data: {
                screen: 'Achievements',
                achievementId: achievement.id,
              },
            }, null);
          }
          
          return {
            ...achievement,
            progress: newProgress,
            completed: isNowCompleted,
            completedAt: isNowCompleted && !wasCompleted ? new Date().toISOString() : achievement.completedAt,
            requirements: {
              ...achievement.requirements,
              current: Math.min(
                achievement.requirements.target,
                Math.floor((newProgress / 100) * achievement.requirements.target)
              ),
            },
          };
        }
        return achievement;
      });
    });
  }, [trackCustomEvent, scheduleNotification]);
  
  // Update meditation minutes
  const updateMeditationMinutes = useCallback((minutes: number) => {
    setAchievements(prevAchievements => {
      return prevAchievements.map(achievement => {
        if (achievement.requirements.type === 'meditation_minutes') {
          const current = achievement.requirements.current + minutes;
          const target = achievement.requirements.target;
          const progress = Math.min(100, (current / target) * 100);
          const wasCompleted = achievement.completed;
          const isNowCompleted = progress >= 100;
          
          // If achievement is newly completed
          if (!wasCompleted && isNowCompleted) {
            // Track achievement completion
            trackCustomEvent('achievement_completed', {
              achievement_id: achievement.id,
              achievement_title: achievement.title,
              achievement_category: achievement.category,
              achievement_level: achievement.level,
            });
            
            // Send notification for achievement completion
            scheduleNotification({
              title: 'Achievement Unlocked!',
              body: `Congratulations! You've earned the "${achievement.title}" achievement.`,
              data: {
                screen: 'Achievements',
                achievementId: achievement.id,
              },
            }, null);
          }
          
          return {
            ...achievement,
            progress,
            completed: isNowCompleted,
            completedAt: isNowCompleted && !wasCompleted ? new Date().toISOString() : achievement.completedAt,
            requirements: {
              ...achievement.requirements,
              current: Math.min(target, current),
            },
          };
        }
        return achievement;
      });
    });
  }, [trackCustomEvent, scheduleNotification]);
  
  // Update meditation sessions
  const updateMeditationSessions = useCallback((count: number = 1) => {
    setAchievements(prevAchievements => {
      return prevAchievements.map(achievement => {
        if (achievement.requirements.type === 'meditation_sessions') {
          const current = achievement.requirements.current + count;
          const target = achievement.requirements.target;
          const progress = Math.min(100, (current / target) * 100);
          const wasCompleted = achievement.completed;
          const isNowCompleted = progress >= 100;
          
          // If achievement is newly completed
          if (!wasCompleted && isNowCompleted) {
            // Track achievement completion
            trackCustomEvent('achievement_completed', {
              achievement_id: achievement.id,
              achievement_title: achievement.title,
              achievement_category: achievement.category,
              achievement_level: achievement.level,
            });
            
            // Send notification for achievement completion
            scheduleNotification({
              title: 'Achievement Unlocked!',
              body: `Congratulations! You've earned the "${achievement.title}" achievement.`,
              data: {
                screen: 'Achievements',
                achievementId: achievement.id,
              },
            }, null);
          }
          
          return {
            ...achievement,
            progress,
            completed: isNowCompleted,
            completedAt: isNowCompleted && !wasCompleted ? new Date().toISOString() : achievement.completedAt,
            requirements: {
              ...achievement.requirements,
              current: Math.min(target, current),
            },
          };
        }
        return achievement;
      });
    });
  }, [trackCustomEvent, scheduleNotification]);
  
  // Update streak days
  const updateStreakDays = useCallback((days: number) => {
    setAchievements(prevAchievements => {
      return prevAchievements.map(achievement => {
        if (achievement.requirements.type === 'streak_days') {
          const target = achievement.requirements.target;
          const progress = Math.min(100, (days / target) * 100);
          const wasCompleted = achievement.completed;
          const isNowCompleted = days >= target;
          
          // If achievement is newly completed
          if (!wasCompleted && isNowCompleted) {
            // Track achievement completion
            trackCustomEvent('achievement_completed', {
              achievement_id: achievement.id,
              achievement_title: achievement.title,
              achievement_category: achievement.category,
              achievement_level: achievement.level,
            });
            
            // Send notification for achievement completion
            scheduleNotification({
              title: 'Achievement Unlocked!',
              body: `Congratulations! You've earned the "${achievement.title}" achievement.`,
              data: {
                screen: 'Achievements',
                achievementId: achievement.id,
              },
            }, null);
          }
          
          return {
            ...achievement,
            progress,
            completed: isNowCompleted,
            completedAt: isNowCompleted && !wasCompleted ? new Date().toISOString() : achievement.completedAt,
            requirements: {
              ...achievement.requirements,
              current: Math.min(target, days),
            },
          };
        }
        return achievement;
      });
    });
  }, [trackCustomEvent, scheduleNotification]);
  
  // Update content completed
  const updateContentCompleted = useCallback((count: number = 1) => {
    setAchievements(prevAchievements => {
      return prevAchievements.map(achievement => {
        if (achievement.requirements.type === 'content_completed') {
          const current = achievement.requirements.current + count;
          const target = achievement.requirements.target;
          const progress = Math.min(100, (current / target) * 100);
          const wasCompleted = achievement.completed;
          const isNowCompleted = progress >= 100;
          
          // If achievement is newly completed
          if (!wasCompleted && isNowCompleted) {
            // Track achievement completion
            trackCustomEvent('achievement_completed', {
              achievement_id: achievement.id,
              achievement_title: achievement.title,
              achievement_category: achievement.category,
              achievement_level: achievement.level,
            });
            
            // Send notification for achievement completion
            scheduleNotification({
              title: 'Achievement Unlocked!',
              body: `Congratulations! You've earned the "${achievement.title}" achievement.`,
              data: {
                screen: 'Achievements',
                achievementId: achievement.id,
              },
            }, null);
          }
          
          return {
            ...achievement,
            progress,
            completed: isNowCompleted,
            completedAt: isNowCompleted && !wasCompleted ? new Date().toISOString() : achievement.completedAt,
            requirements: {
              ...achievement.requirements,
              current: Math.min(target, current),
            },
          };
        }
        return achievement;
      });
    });
  }, [trackCustomEvent, scheduleNotification]);
  
  // Get achievements by category
  const getAchievementsByCategory = useCallback((category: Achievement['category']) => {
    return achievements.filter(achievement => achievement.category === category);
  }, [achievements]);
  
  // Get completed achievements
  const getCompletedAchievements = useCallback(() => {
    return achievements.filter(achievement => achievement.completed);
  }, [achievements]);
  
  // Get visible achievements (not hidden or completed)
  const getVisibleAchievements = useCallback(() => {
    return achievements.filter(achievement => !achievement.hidden || achievement.completed);
  }, [achievements]);
  
  // Reset all achievements
  const resetAllAchievements = useCallback(async () => {
    try {
      const defaultAchievements = getDefaultAchievements();
      setAchievements(defaultAchievements);
      await AsyncStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(defaultAchievements));
      return true;
    } catch (err) {
      console.error('Failed to reset achievements:', err);
      return false;
    }
  }, []);
  
  // Sync achievements with server
  const syncAchievements = useCallback(async () => {
    if (!isConnected) {
      return { synced: false, error: 'No internet connection' };
    }
    
    try {
      // TODO: Implement actual API call to sync achievements with server
      // For now, just simulate syncing
      console.log('Syncing achievements with server');
      
      return { synced: true };
    } catch (err) {
      console.error('Failed to sync achievements:', err);
      return { synced: false, error: err };
    }
  }, [isConnected]);
  
  return {
    achievements,
    isLoading,
    error,
    updateAchievementProgress,
    updateMeditationMinutes,
    updateMeditationSessions,
    updateStreakDays,
    updateContentCompleted,
    getAchievementsByCategory,
    getCompletedAchievements,
    getVisibleAchievements,
    resetAllAchievements,
    syncAchievements,
  };
};

/**
 * Hook for managing goals
 */
export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { isConnected } = useNetworkState();
  const { trackCustomEvent } = useAnalytics();
  const { scheduleNotification } = useNotificationSystem();
  
  // Load goals from storage on mount
  useEffect(() => {
    const loadGoals = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const storedGoals = await AsyncStorage.getItem(GOALS_STORAGE_KEY);
        
        if (storedGoals) {
          setGoals(JSON.parse(storedGoals));
        } else {
          // Initialize with default goals if none exist
          const defaultGoals = getDefaultGoals();
          setGoals(defaultGoals);
          await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(defaultGoals));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load goals'));
        console.error('Failed to load goals:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGoals();
  }, []);
  
  // Save goals to storage whenever they change
  useEffect(() => {
    if (!isLoading && goals.length > 0) {
      const saveGoals = async () => {
        try {
          await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
        } catch (err) {
          console.error('Failed to save goals:', err);
        }
      };
      
      saveGoals();
    }
  }, [goals, isLoading]);
  
  // Get default goals
  const getDefaultGoals = (): Goal[] => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay()); // Start of week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)
    
    return [
      // Daily meditation goal
      {
        id: 'daily_meditation',
        title: 'Daily Meditation',
        description: 'Meditate for at least 10 minutes today',
        icon: 'timer',
        category: 'meditation',
        target: 10,
        current: 0,
        unit: 'minutes',
        startDate: startOfDay.toISOString(),
        completed: false,
        recurring: 'daily',
        reminderEnabled: true,
        reminderTime: '08:00',
      },
      // Weekly meditation goal
      {
        id: 'weekly_meditation',
        title: 'Weekly Meditation',
        description: 'Meditate for at least 60 minutes this week',
        icon: 'timer',
        category: 'meditation',
        target: 60,
        current: 0,
        unit: 'minutes',
        startDate: startOfWeek.toISOString(),
        endDate: endOfWeek.toISOString(),
        completed: false,
        recurring: 'weekly',
        reminderEnabled: false,
      },
      // Weekly learning goal
      {
        id: 'weekly_learning',
        title: 'Weekly Learning',
        description: 'Complete at least 3 Buddhist content items this week',
        icon: 'book',
        category: 'learning',
        target: 3,
        current: 0,
        unit: 'items',
        startDate: startOfWeek.toISOString(),
        endDate: endOfWeek.toISOString(),
        completed: false,
        recurring: 'weekly',
        reminderEnabled: false,
      },
    ];
  };
  
  // Create a new goal
  const createGoal = useCallback((goal: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...goal,
      id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
    
    setGoals(prevGoals => [...prevGoals, newGoal]);
    
    // Track goal creation
    trackCustomEvent('goal_created', {
      goal_id: newGoal.id,
      goal_title: newGoal.title,
      goal_category: newGoal.category,
      goal_target: newGoal.target,
      goal_unit: newGoal.unit,
      goal_recurring: newGoal.recurring,
    });
    
    // Schedule reminder if enabled
    if (newGoal.reminderEnabled && newGoal.reminderTime) {
      const [hour, minute] = newGoal.reminderTime.split(':').map(Number);
      
      scheduleNotification({
        title: 'Goal Reminder',
        body: `Don't forget your goal: ${newGoal.title}`,
        data: {
          screen: 'Goals',
          goalId: newGoal.id,
        },
      }, {
        hour,
        minute,
        repeats: true,
      });
    }
    
    return newGoal;
  }, [trackCustomEvent, scheduleNotification]);
  
  // Update goal progress
  const updateGoalProgress = useCallback((goalId: string, progress: number) => {
    setGoals(prevGoals => {
      return prevGoals.map(goal => {
        if (goal.id === goalId) {
          const newProgress = Math.min(goal.target, progress);
          const wasCompleted = goal.completed;
          const isNowCompleted = newProgress >= goal.target;
          
          // If goal is newly completed
          if (!wasCompleted && isNowCompleted) {
            // Track goal completion
            trackCustomEvent('goal_completed', {
              goal_id: goal.id,
              goal_title: goal.title,
              goal_category: goal.category,
              goal_target: goal.target,
              goal_unit: goal.unit,
              goal_recurring: goal.recurring,
            });
            
            // Send notification for goal completion
            scheduleNotification({
              title: 'Goal Achieved!',
              body: `Congratulations! You've completed your "${goal.title}" goal.`,
              data: {
                screen: 'Goals',
                goalId: goal.id,
              },
            }, null);
          }
          
          return {
            ...goal,
            current: newProgress,
            completed: isNowCompleted,
            completedAt: isNowCompleted && !wasCompleted ? new Date().toISOString() : goal.completedAt,
          };
        }
        return goal;
      });
    });
  }, [trackCustomEvent, scheduleNotification]);
  
  // Increment goal progress
  const incrementGoalProgress = useCallback((goalId: string, amount: number = 1) => {
    setGoals(prevGoals => {
      return prevGoals.map(goal => {
        if (goal.id === goalId) {
          const newProgress = Math.min(goal.target, goal.current + amount);
          const wasCompleted = goal.completed;
          const isNowCompleted = newProgress >= goal.target;
          
          // If goal is newly completed
          if (!wasCompleted && isNowCompleted) {
            // Track goal completion
            trackCustomEvent('goal_completed', {
              goal_id: goal.id,
              goal_title: goal.title,
              goal_category: goal.category,
              goal_target: goal.target,
              goal_unit: goal.unit,
              goal_recurring: goal.recurring,
            });
            
            // Send notification for goal completion
            scheduleNotification({
              title: 'Goal Achieved!',
              body: `Congratulations! You've completed your "${goal.title}" goal.`,
              data: {
                screen: 'Goals',
                goalId: goal.id,
              },
            }, null);
          }
          
          return {
            ...goal,
            current: newProgress,
            completed: isNowCompleted,
            completedAt: isNowCompleted && !wasCompleted ? new Date().toISOString() : goal.completedAt,
          };
        }
        return goal;
      });
    });
  }, [trackCustomEvent, scheduleNotification]);
  
  // Update meditation minutes for all meditation goals
  const updateMeditationMinutes = useCallback((minutes: number) => {
    setGoals(prevGoals => {
      return prevGoals.map(goal => {
        if (goal.category === 'meditation' && goal.unit === 'minutes') {
          const newProgress = Math.min(goal.target, goal.current + minutes);
          const wasCompleted = goal.completed;
          const isNowCompleted = newProgress >= goal.target;
          
          // If goal is newly completed
          if (!wasCompleted && isNowCompleted) {
            // Track goal completion
            trackCustomEvent('goal_completed', {
              goal_id: goal.id,
              goal_title: goal.title,
              goal_category: goal.category,
              goal_target: goal.target,
              goal_unit: goal.unit,
              goal_recurring: goal.recurring,
            });
            
            // Send notification for goal completion
            scheduleNotification({
              title: 'Goal Achieved!',
              body: `Congratulations! You've completed your "${goal.title}" goal.`,
              data: {
                screen: 'Goals',
                goalId: goal.id,
              },
            }, null);
          }
          
          return {
            ...goal,
            current: newProgress,
            completed: isNowCompleted,
            completedAt: isNowCompleted && !wasCompleted ? new Date().toISOString() : goal.completedAt,
          };
        }
        return goal;
      });
    });
  }, [trackCustomEvent, scheduleNotification]);
  
  // Update content completed for all learning goals
  const updateContentCompleted = useCallback((count: number = 1) => {
    setGoals(prevGoals => {
      return prevGoals.map(goal => {
        if (goal.category === 'learning') {
          const newProgress = Math.min(goal.target, goal.current + count);
          const wasCompleted = goal.completed;
          const isNowCompleted = newProgress >= goal.target;
          
          // If goal is newly completed
          if (!wasCompleted && isNowCompleted) {
            // Track goal completion
            trackCustomEvent('goal_completed', {
              goal_id: goal.id,
              goal_title: goal.title,
              goal_category: goal.category,
              goal_target: goal.target,
              goal_unit: goal.unit,
              goal_recurring: goal.recurring,
            });
            
            // Send notification for goal completion
            scheduleNotification({
              title: 'Goal Achieved!',
              body: `Congratulations! You've completed your "${goal.title}" goal.`,
              data: {
                screen: 'Goals',
                goalId: goal.id,
              },
            }, null);
          }
          
          return {
            ...goal,
            current: newProgress,
            completed: isNowCompleted,
            completedAt: isNowCompleted && !wasCompleted ? new Date().toISOString() : goal.completedAt,
          };
        }
        return goal;
      });
    });
  }, [trackCustomEvent, scheduleNotification]);
  
  // Delete a goal
  const deleteGoal = useCallback((goalId: string) => {
    setGoals(prevGoals => prevGoals.filter(goal => goal.id !== goalId));
    
    // Track goal deletion
    trackCustomEvent('goal_deleted', {
      goal_id: goalId,
    });
    
    return true;
  }, [trackCustomEvent]);
  
  // Reset a goal (for recurring goals)
  const resetGoal = useCallback((goalId: string) => {
    setGoals(prevGoals => {
      return prevGoals.map(goal => {
        if (goal.id === goalId) {
          const today = new Date();
          const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          
          let startDate = startOfDay.toISOString();
          let endDate = undefined;
          
          // Set appropriate date range based on recurring type
          if (goal.recurring === 'weekly') {
            const startOfWeek = new Date(startOfDay);
            startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay()); // Start of week (Sunday)
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)
            
            startDate = startOfWeek.toISOString();
            endDate = endOfWeek.toISOString();
          } else if (goal.recurring === 'monthly') {
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            
            startDate = startOfMonth.toISOString();
            endDate = endOfMonth.toISOString();
          }
          
          return {
            ...goal,
            current: 0,
            completed: false,
            completedAt: undefined,
            startDate,
            endDate,
          };
        }
        return goal;
      });
    });
    
    // Track goal reset
    trackCustomEvent('goal_reset', {
      goal_id: goalId,
    });
    
    return true;
  }, [trackCustomEvent]);
  
  // Reset all recurring goals
  const resetRecurringGoals = useCallback((recurringType: Goal['recurring']) => {
    setGoals(prevGoals => {
      return prevGoals.map(goal => {
        if (goal.recurring === recurringType) {
          const today = new Date();
          const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          
          let startDate = startOfDay.toISOString();
          let endDate = undefined;
          
          // Set appropriate date range based on recurring type
          if (recurringType === 'weekly') {
            const startOfWeek = new Date(startOfDay);
            startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay()); // Start of week (Sunday)
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)
            
            startDate = startOfWeek.toISOString();
            endDate = endOfWeek.toISOString();
          } else if (recurringType === 'monthly') {
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            
            startDate = startOfMonth.toISOString();
            endDate = endOfMonth.toISOString();
          }
          
          return {
            ...goal,
            current: 0,
            completed: false,
            completedAt: undefined,
            startDate,
            endDate,
          };
        }
        return goal;
      });
    });
    
    // Track goals reset
    trackCustomEvent('goals_reset', {
      recurring_type: recurringType,
    });
    
    return true;
  }, [trackCustomEvent]);
  
  // Get goals by category
  const getGoalsByCategory = useCallback((category: Goal['category']) => {
    return goals.filter(goal => goal.category === category);
  }, [goals]);
  
  // Get active goals (not completed)
  const getActiveGoals = useCallback(() => {
    return goals.filter(goal => !goal.completed);
  }, [goals]);
  
  // Get completed goals
  const getCompletedGoals = useCallback(() => {
    return goals.filter(goal => goal.completed);
  }, [goals]);
  
  // Reset all goals
  const resetAllGoals = useCallback(async () => {
    try {
      const defaultGoals = getDefaultGoals();
      setGoals(defaultGoals);
      await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(defaultGoals));
      return true;
    } catch (err) {
      console.error('Failed to reset goals:', err);
      return false;
    }
  }, []);
  
  // Sync goals with server
  const syncGoals = useCallback(async () => {
    if (!isConnected) {
      return { synced: false, error: 'No internet connection' };
    }
    
    try {
      // TODO: Implement actual API call to sync goals with server
      // For now, just simulate syncing
      console.log('Syncing goals with server');
      
      return { synced: true };
    } catch (err) {
      console.error('Failed to sync goals:', err);
      return { synced: false, error: err };
    }
  }, [isConnected]);
  
  return {
    goals,
    isLoading,
    error,
    createGoal,
    updateGoalProgress,
    incrementGoalProgress,
    updateMeditationMinutes,
    updateContentCompleted,
    deleteGoal,
    resetGoal,
    resetRecurringGoals,
    getGoalsByCategory,
    getActiveGoals,
    getCompletedGoals,
    resetAllGoals,
    syncGoals,
  };
};