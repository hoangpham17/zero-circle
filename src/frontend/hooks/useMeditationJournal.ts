import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetworkState } from './useAppState';
import { useAnalytics } from './useAnalytics';
import { useUserProgress } from './useUserProgress';

// Types for meditation journal entries
export interface MoodRating {
  before?: number; // 1-5 scale
  after?: number; // 1-5 scale
}

export interface JournalEntry {
  id: string;
  date: string; // ISO string
  title: string;
  content: string;
  tags: string[];
  mood: MoodRating;
  meditationId?: string; // Optional reference to a meditation session
  meditationDuration?: number; // In minutes
  meditationType?: string; // Type of meditation
  isPrivate: boolean;
  isFavorite: boolean;
  customFields?: Record<string, any>; // For any additional fields
}

export interface MeditationSession {
  id: string;
  date: string; // ISO string
  duration: number; // In minutes
  completedDuration: number; // Actual completed duration
  type: string; // Guided, timer, etc.
  contentId?: string; // If it's a guided meditation
  contentTitle?: string;
  notes?: string;
  tags: string[];
  mood: MoodRating;
  journalEntryId?: string; // Optional reference to a journal entry
  customData?: Record<string, any>; // For any additional data
}

// Storage keys
const JOURNAL_ENTRIES_STORAGE_KEY = 'zero_circle_journal_entries';
const MEDITATION_SESSIONS_STORAGE_KEY = 'zero_circle_meditation_sessions';

/**
 * Hook for managing meditation journal entries
 */
export const useJournal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { isConnected } = useNetworkState();
  const { trackCustomEvent } = useAnalytics();
  
  // Load journal entries from storage on mount
  useEffect(() => {
    const loadEntries = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const storedEntries = await AsyncStorage.getItem(JOURNAL_ENTRIES_STORAGE_KEY);
        
        if (storedEntries) {
          setEntries(JSON.parse(storedEntries));
        } else {
          // Initialize with empty array if none exist
          setEntries([]);
          await AsyncStorage.setItem(JOURNAL_ENTRIES_STORAGE_KEY, JSON.stringify([]));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load journal entries'));
        console.error('Failed to load journal entries:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEntries();
  }, []);
  
  // Save journal entries to storage whenever they change
  useEffect(() => {
    if (!isLoading) {
      const saveEntries = async () => {
        try {
          await AsyncStorage.setItem(JOURNAL_ENTRIES_STORAGE_KEY, JSON.stringify(entries));
        } catch (err) {
          console.error('Failed to save journal entries:', err);
        }
      };
      
      saveEntries();
    }
  }, [entries, isLoading]);
  
  // Create a new journal entry
  const createEntry = useCallback((entry: Omit<JournalEntry, 'id'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: `journal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
    
    setEntries(prevEntries => [newEntry, ...prevEntries]);
    
    // Track entry creation
    trackCustomEvent('journal_entry_created', {
      entry_id: newEntry.id,
      has_meditation: !!newEntry.meditationId,
      has_tags: newEntry.tags.length > 0,
      content_length: newEntry.content.length,
    });
    
    return newEntry;
  }, [trackCustomEvent]);
  
  // Update an existing journal entry
  const updateEntry = useCallback((id: string, updates: Partial<Omit<JournalEntry, 'id'>>) => {
    setEntries(prevEntries => {
      return prevEntries.map(entry => {
        if (entry.id === id) {
          const updatedEntry = { ...entry, ...updates };
          
          // Track entry update
          trackCustomEvent('journal_entry_updated', {
            entry_id: id,
            updated_fields: Object.keys(updates),
          });
          
          return updatedEntry;
        }
        return entry;
      });
    });
  }, [trackCustomEvent]);
  
  // Delete a journal entry
  const deleteEntry = useCallback((id: string) => {
    setEntries(prevEntries => {
      const filteredEntries = prevEntries.filter(entry => entry.id !== id);
      
      // Track entry deletion
      trackCustomEvent('journal_entry_deleted', {
        entry_id: id,
      });
      
      return filteredEntries;
    });
  }, [trackCustomEvent]);
  
  // Get a journal entry by ID
  const getEntryById = useCallback((id: string) => {
    return entries.find(entry => entry.id === id) || null;
  }, [entries]);
  
  // Get journal entries by date range
  const getEntriesByDateRange = useCallback((startDate: string, endDate: string) => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.date).getTime();
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      
      return entryDate >= start && entryDate <= end;
    });
  }, [entries]);
  
  // Get journal entries by tags
  const getEntriesByTags = useCallback((tags: string[]) => {
    return entries.filter(entry => {
      return tags.some(tag => entry.tags.includes(tag));
    });
  }, [entries]);
  
  // Get favorite journal entries
  const getFavoriteEntries = useCallback(() => {
    return entries.filter(entry => entry.isFavorite);
  }, [entries]);
  
  // Toggle favorite status of an entry
  const toggleFavorite = useCallback((id: string) => {
    setEntries(prevEntries => {
      return prevEntries.map(entry => {
        if (entry.id === id) {
          const updatedEntry = { ...entry, isFavorite: !entry.isFavorite };
          
          // Track favorite toggle
          trackCustomEvent('journal_entry_favorite_toggled', {
            entry_id: id,
            is_favorite: updatedEntry.isFavorite,
          });
          
          return updatedEntry;
        }
        return entry;
      });
    });
  }, [trackCustomEvent]);
  
  // Search journal entries
  const searchEntries = useCallback((query: string) => {
    const lowerCaseQuery = query.toLowerCase();
    
    return entries.filter(entry => {
      return (
        entry.title.toLowerCase().includes(lowerCaseQuery) ||
        entry.content.toLowerCase().includes(lowerCaseQuery) ||
        entry.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery))
      );
    });
  }, [entries]);
  
  // Get all unique tags from entries
  const getAllTags = useCallback(() => {
    const tagsSet = new Set<string>();
    
    entries.forEach(entry => {
      entry.tags.forEach(tag => tagsSet.add(tag));
    });
    
    return Array.from(tagsSet).sort();
  }, [entries]);
  
  // Export journal entries as JSON
  const exportEntries = useCallback(() => {
    return JSON.stringify(entries, null, 2);
  }, [entries]);
  
  // Import journal entries from JSON
  const importEntries = useCallback(async (jsonData: string) => {
    try {
      const importedEntries = JSON.parse(jsonData) as JournalEntry[];
      
      // Validate imported data
      if (!Array.isArray(importedEntries)) {
        throw new Error('Invalid journal data format');
      }
      
      // Merge with existing entries, avoiding duplicates by ID
      setEntries(prevEntries => {
        const existingIds = new Set(prevEntries.map(entry => entry.id));
        const newEntries = importedEntries.filter(entry => !existingIds.has(entry.id));
        
        const mergedEntries = [...prevEntries, ...newEntries];
        
        // Sort by date, newest first
        return mergedEntries.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
      });
      
      // Track import
      trackCustomEvent('journal_entries_imported', {
        count: importedEntries.length,
      });
      
      return { success: true, count: importedEntries.length };
    } catch (err) {
      console.error('Failed to import journal entries:', err);
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }, [trackCustomEvent]);
  
  // Sync journal entries with server
  const syncEntries = useCallback(async () => {
    if (!isConnected) {
      return { synced: false, error: 'No internet connection' };
    }
    
    try {
      // TODO: Implement actual API call to sync journal entries with server
      // For now, just simulate syncing
      console.log('Syncing journal entries with server');
      
      // Track sync attempt
      trackCustomEvent('journal_entries_sync_attempted', {
        success: true,
        count: entries.length,
      });
      
      return { synced: true, count: entries.length };
    } catch (err) {
      console.error('Failed to sync journal entries:', err);
      
      // Track sync failure
      trackCustomEvent('journal_entries_sync_attempted', {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
      
      return { synced: false, error: err };
    }
  }, [isConnected, entries, trackCustomEvent]);
  
  return {
    entries,
    isLoading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    getEntryById,
    getEntriesByDateRange,
    getEntriesByTags,
    getFavoriteEntries,
    toggleFavorite,
    searchEntries,
    getAllTags,
    exportEntries,
    importEntries,
    syncEntries,
  };
};

/**
 * Hook for managing meditation sessions
 */
export const useMeditationSessions = () => {
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { isConnected } = useNetworkState();
  const { trackCustomEvent } = useAnalytics();
  const { updateMeditationStats } = useUserProgress();
  const { createEntry } = useJournal();
  
  // Load meditation sessions from storage on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const storedSessions = await AsyncStorage.getItem(MEDITATION_SESSIONS_STORAGE_KEY);
        
        if (storedSessions) {
          setSessions(JSON.parse(storedSessions));
        } else {
          // Initialize with empty array if none exist
          setSessions([]);
          await AsyncStorage.setItem(MEDITATION_SESSIONS_STORAGE_KEY, JSON.stringify([]));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load meditation sessions'));
        console.error('Failed to load meditation sessions:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSessions();
  }, []);
  
  // Save meditation sessions to storage whenever they change
  useEffect(() => {
    if (!isLoading) {
      const saveSessions = async () => {
        try {
          await AsyncStorage.setItem(MEDITATION_SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
        } catch (err) {
          console.error('Failed to save meditation sessions:', err);
        }
      };
      
      saveSessions();
    }
  }, [sessions, isLoading]);
  
  // Create a new meditation session
  const createSession = useCallback((session: Omit<MeditationSession, 'id'>) => {
    const newSession: MeditationSession = {
      ...session,
      id: `meditation_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
    
    setSessions(prevSessions => [newSession, ...prevSessions]);
    
    // Update meditation stats
    updateMeditationStats(newSession.completedDuration, true);
    
    // Track session creation
    trackCustomEvent('meditation_session_created', {
      session_id: newSession.id,
      duration: newSession.duration,
      completed_duration: newSession.completedDuration,
      type: newSession.type,
      has_content: !!newSession.contentId,
    });
    
    return newSession;
  }, [trackCustomEvent, updateMeditationStats]);
  
  // Create a journal entry from a meditation session
  const createJournalFromSession = useCallback((sessionId: string, journalData: Partial<JournalEntry>) => {
    const session = sessions.find(s => s.id === sessionId);
    
    if (!session) {
      console.error('Session not found:', sessionId);
      return null;
    }
    
    // Create a new journal entry linked to this session
    const entry = createEntry({
      date: session.date,
      title: journalData.title || `Meditation: ${session.contentTitle || session.type}`,
      content: journalData.content || '',
      tags: journalData.tags || session.tags || [],
      mood: journalData.mood || session.mood || { before: undefined, after: undefined },
      meditationId: session.id,
      meditationDuration: session.completedDuration,
      meditationType: session.type,
      isPrivate: journalData.isPrivate !== undefined ? journalData.isPrivate : true,
      isFavorite: journalData.isFavorite || false,
      customFields: journalData.customFields || {},
    });
    
    // Update the session to link to this journal entry
    if (entry) {
      setSessions(prevSessions => {
        return prevSessions.map(s => {
          if (s.id === sessionId) {
            return { ...s, journalEntryId: entry.id };
          }
          return s;
        });
      });
    }
    
    // Track journal creation from session
    trackCustomEvent('journal_created_from_session', {
      session_id: sessionId,
      journal_id: entry?.id,
    });
    
    return entry;
  }, [sessions, createEntry, trackCustomEvent]);
  
  // Update an existing meditation session
  const updateSession = useCallback((id: string, updates: Partial<Omit<MeditationSession, 'id'>>) => {
    setSessions(prevSessions => {
      return prevSessions.map(session => {
        if (session.id === id) {
          const updatedSession = { ...session, ...updates };
          
          // Track session update
          trackCustomEvent('meditation_session_updated', {
            session_id: id,
            updated_fields: Object.keys(updates),
          });
          
          return updatedSession;
        }
        return session;
      });
    });
  }, [trackCustomEvent]);
  
  // Delete a meditation session
  const deleteSession = useCallback((id: string) => {
    setSessions(prevSessions => {
      const filteredSessions = prevSessions.filter(session => session.id !== id);
      
      // Track session deletion
      trackCustomEvent('meditation_session_deleted', {
        session_id: id,
      });
      
      return filteredSessions;
    });
  }, [trackCustomEvent]);
  
  // Get a meditation session by ID
  const getSessionById = useCallback((id: string) => {
    return sessions.find(session => session.id === id) || null;
  }, [sessions]);
  
  // Get meditation sessions by date range
  const getSessionsByDateRange = useCallback((startDate: string, endDate: string) => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.date).getTime();
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      
      return sessionDate >= start && sessionDate <= end;
    });
  }, [sessions]);
  
  // Get meditation sessions by type
  const getSessionsByType = useCallback((type: string) => {
    return sessions.filter(session => session.type === type);
  }, [sessions]);
  
  // Get meditation sessions by content ID
  const getSessionsByContentId = useCallback((contentId: string) => {
    return sessions.filter(session => session.contentId === contentId);
  }, [sessions]);
  
  // Get meditation sessions by tags
  const getSessionsByTags = useCallback((tags: string[]) => {
    return sessions.filter(session => {
      return tags.some(tag => session.tags.includes(tag));
    });
  }, [sessions]);
  
  // Get total meditation time
  const getTotalMeditationTime = useCallback(() => {
    return sessions.reduce((total, session) => total + session.completedDuration, 0);
  }, [sessions]);
  
  // Get average meditation time
  const getAverageMeditationTime = useCallback(() => {
    if (sessions.length === 0) return 0;
    return getTotalMeditationTime() / sessions.length;
  }, [sessions, getTotalMeditationTime]);
  
  // Get meditation streak (consecutive days)
  const getMeditationStreak = useCallback(() => {
    if (sessions.length === 0) return 0;
    
    // Sort sessions by date, newest first
    const sortedSessions = [...sessions].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    // Get unique dates (in YYYY-MM-DD format)
    const uniqueDates = new Set<string>();
    sortedSessions.forEach(session => {
      const dateStr = new Date(session.date).toISOString().split('T')[0];
      uniqueDates.add(dateStr);
    });
    
    // Convert to array and sort
    const dates = Array.from(uniqueDates).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });
    
    if (dates.length === 0) return 0;
    
    // Check if most recent date is today or yesterday
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const mostRecentDate = new Date(dates[0]);
    mostRecentDate.setHours(0, 0, 0, 0);
    
    if (mostRecentDate.getTime() !== today.getTime() && 
        mostRecentDate.getTime() !== yesterday.getTime()) {
      return 0; // Streak broken if not meditated today or yesterday
    }
    
    // Count consecutive days
    let streak = 1;
    for (let i = 1; i < dates.length; i++) {
      const currentDate = new Date(dates[i-1]);
      const prevDate = new Date(dates[i]);
      
      // Check if dates are consecutive
      const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
      } else {
        break; // Streak broken
      }
    }
    
    return streak;
  }, [sessions]);
  
  // Get meditation statistics
  const getMeditationStats = useCallback(() => {
    const totalSessions = sessions.length;
    const totalTime = getTotalMeditationTime();
    const averageTime = getAverageMeditationTime();
    const streak = getMeditationStreak();
    
    // Get sessions by type
    const sessionsByType: Record<string, number> = {};
    sessions.forEach(session => {
      sessionsByType[session.type] = (sessionsByType[session.type] || 0) + 1;
    });
    
    // Get most used type
    let mostUsedType = '';
    let mostUsedTypeCount = 0;
    
    Object.entries(sessionsByType).forEach(([type, count]) => {
      if (count > mostUsedTypeCount) {
        mostUsedType = type;
        mostUsedTypeCount = count;
      }
    });
    
    // Get mood improvement stats
    const sessionsWithMoodChange = sessions.filter(
      session => session.mood.before !== undefined && session.mood.after !== undefined
    );
    
    const moodImprovement = sessionsWithMoodChange.reduce((sum, session) => {
      const before = session.mood.before || 0;
      const after = session.mood.after || 0;
      return sum + (after - before);
    }, 0);
    
    const averageMoodImprovement = sessionsWithMoodChange.length > 0 ?
      moodImprovement / sessionsWithMoodChange.length : 0;
    
    return {
      totalSessions,
      totalTime,
      averageTime,
      streak,
      sessionsByType,
      mostUsedType,
      mostUsedTypeCount,
      sessionsWithMoodChange: sessionsWithMoodChange.length,
      averageMoodImprovement,
    };
  }, [sessions, getTotalMeditationTime, getAverageMeditationTime, getMeditationStreak]);
  
  // Export meditation sessions as JSON
  const exportSessions = useCallback(() => {
    return JSON.stringify(sessions, null, 2);
  }, [sessions]);
  
  // Import meditation sessions from JSON
  const importSessions = useCallback(async (jsonData: string) => {
    try {
      const importedSessions = JSON.parse(jsonData) as MeditationSession[];
      
      // Validate imported data
      if (!Array.isArray(importedSessions)) {
        throw new Error('Invalid meditation sessions data format');
      }
      
      // Merge with existing sessions, avoiding duplicates by ID
      setSessions(prevSessions => {
        const existingIds = new Set(prevSessions.map(session => session.id));
        const newSessions = importedSessions.filter(session => !existingIds.has(session.id));
        
        const mergedSessions = [...prevSessions, ...newSessions];
        
        // Sort by date, newest first
        return mergedSessions.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
      });
      
      // Track import
      trackCustomEvent('meditation_sessions_imported', {
        count: importedSessions.length,
      });
      
      return { success: true, count: importedSessions.length };
    } catch (err) {
      console.error('Failed to import meditation sessions:', err);
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }, [trackCustomEvent]);
  
  // Sync meditation sessions with server
  const syncSessions = useCallback(async () => {
    if (!isConnected) {
      return { synced: false, error: 'No internet connection' };
    }
    
    try {
      // TODO: Implement actual API call to sync meditation sessions with server
      // For now, just simulate syncing
      console.log('Syncing meditation sessions with server');
      
      // Track sync attempt
      trackCustomEvent('meditation_sessions_sync_attempted', {
        success: true,
        count: sessions.length,
      });
      
      return { synced: true, count: sessions.length };
    } catch (err) {
      console.error('Failed to sync meditation sessions:', err);
      
      // Track sync failure
      trackCustomEvent('meditation_sessions_sync_attempted', {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
      
      return { synced: false, error: err };
    }
  }, [isConnected, sessions, trackCustomEvent]);
  
  return {
    sessions,
    isLoading,
    error,
    createSession,
    createJournalFromSession,
    updateSession,
    deleteSession,
    getSessionById,
    getSessionsByDateRange,
    getSessionsByType,
    getSessionsByContentId,
    getSessionsByTags,
    getTotalMeditationTime,
    getAverageMeditationTime,
    getMeditationStreak,
    getMeditationStats,
    exportSessions,
    importSessions,
    syncSessions,
  };
};

/**
 * Hook for managing mood tracking
 */
export const useMoodTracking = () => {
  const { sessions } = useMeditationSessions();
  const { entries } = useJournal();
  
  // Get mood data for visualization
  const getMoodData = useCallback((days: number = 30) => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days);
    
    // Collect mood data from meditation sessions
    const moodData: Array<{
      date: string;
      before?: number;
      after?: number;
      source: 'meditation' | 'journal';
      id: string;
    }> = [];
    
    // Add mood data from meditation sessions
    sessions.forEach(session => {
      const sessionDate = new Date(session.date);
      if (sessionDate >= startDate && sessionDate <= today) {
        if (session.mood.before !== undefined || session.mood.after !== undefined) {
          moodData.push({
            date: session.date,
            before: session.mood.before,
            after: session.mood.after,
            source: 'meditation',
            id: session.id,
          });
        }
      }
    });
    
    // Add mood data from journal entries
    entries.forEach(entry => {
      const entryDate = new Date(entry.date);
      if (entryDate >= startDate && entryDate <= today) {
        if (entry.mood.before !== undefined || entry.mood.after !== undefined) {
          // Only add if not already added from a linked meditation session
          if (!entry.meditationId || !moodData.some(data => 
            data.source === 'meditation' && data.id === entry.meditationId
          )) {
            moodData.push({
              date: entry.date,
              before: entry.mood.before,
              after: entry.mood.after,
              source: 'journal',
              id: entry.id,
            });
          }
        }
      }
    });
    
    // Sort by date
    return moodData.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [sessions, entries]);
  
  // Get average mood improvement
  const getAverageMoodImprovement = useCallback(() => {
    const moodData = getMoodData();
    
    const dataWithBeforeAfter = moodData.filter(
      data => data.before !== undefined && data.after !== undefined
    );
    
    if (dataWithBeforeAfter.length === 0) return 0;
    
    const totalImprovement = dataWithBeforeAfter.reduce((sum, data) => {
      return sum + ((data.after || 0) - (data.before || 0));
    }, 0);
    
    return totalImprovement / dataWithBeforeAfter.length;
  }, [getMoodData]);
  
  // Get mood trends by time of day
  const getMoodTrendsByTimeOfDay = useCallback(() => {
    const moodData = getMoodData();
    
    // Group by time of day: morning (5-12), afternoon (12-17), evening (17-22), night (22-5)
    const timeGroups: Record<string, Array<{ before?: number; after?: number }>> = {
      morning: [],
      afternoon: [],
      evening: [],
      night: [],
    };
    
    moodData.forEach(data => {
      const date = new Date(data.date);
      const hour = date.getHours();
      
      let timeGroup: string;
      if (hour >= 5 && hour < 12) {
        timeGroup = 'morning';
      } else if (hour >= 12 && hour < 17) {
        timeGroup = 'afternoon';
      } else if (hour >= 17 && hour < 22) {
        timeGroup = 'evening';
      } else {
        timeGroup = 'night';
      }
      
      timeGroups[timeGroup].push({
        before: data.before,
        after: data.after,
      });
    });
    
    // Calculate averages for each time group
    const result: Record<string, { 
      averageBefore: number; 
      averageAfter: number; 
      improvement: number; 
      count: number;
    }> = {};
    
    Object.entries(timeGroups).forEach(([timeGroup, data]) => {
      const validData = data.filter(d => d.before !== undefined && d.after !== undefined);
      
      if (validData.length === 0) {
        result[timeGroup] = {
          averageBefore: 0,
          averageAfter: 0,
          improvement: 0,
          count: 0,
        };
        return;
      }
      
      const totalBefore = validData.reduce((sum, d) => sum + (d.before || 0), 0);
      const totalAfter = validData.reduce((sum, d) => sum + (d.after || 0), 0);
      
      const averageBefore = totalBefore / validData.length;
      const averageAfter = totalAfter / validData.length;
      
      result[timeGroup] = {
        averageBefore,
        averageAfter,
        improvement: averageAfter - averageBefore,
        count: validData.length,
      };
    });
    
    return result;
  }, [getMoodData]);
  
  // Get best time of day for meditation based on mood improvement
  const getBestTimeForMeditation = useCallback(() => {
    const trends = getMoodTrendsByTimeOfDay();
    
    let bestTime = '';
    let bestImprovement = -Infinity;
    
    Object.entries(trends).forEach(([timeGroup, data]) => {
      if (data.count > 0 && data.improvement > bestImprovement) {
        bestTime = timeGroup;
        bestImprovement = data.improvement;
      }
    });
    
    return { bestTime, improvement: bestImprovement };
  }, [getMoodTrendsByTimeOfDay]);
  
  return {
    getMoodData,
    getAverageMoodImprovement,
    getMoodTrendsByTimeOfDay,
    getBestTimeForMeditation,
  };
};