import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetworkState } from './useAppState';
import { useAnalytics } from './useAnalytics';
import { useOfflineData } from './useOfflineData';
import { useUserProgress } from './useUserProgress';

// Types for Buddhist content
export interface BuddhistContent {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'audio' | 'quote' | 'practice' | 'course';
  category: 'meditation' | 'mindfulness' | 'philosophy' | 'ethics' | 'psychology' | 'history' | 'practice';
  tags: string[];
  author?: string;
  source?: string;
  content: string; // HTML content or markdown
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  duration?: number; // In minutes for audio/video content
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  relatedContentIds: string[];
  isFeatured: boolean;
  isPremium: boolean;
  publishedDate: string; // ISO string
  lastUpdated: string; // ISO string
  viewCount: number;
  likeCount: number;
  bookmarkCount: number;
  customData?: Record<string, any>;
}

export interface ContentCollection {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  contentIds: string[];
  category: string;
  tags: string[];
  isFeatured: boolean;
  isPremium: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  customData?: Record<string, any>;
}

export interface ContentProgress {
  contentId: string;
  progress: number; // 0-100
  completed: boolean;
  lastAccessedAt: string; // ISO string
  completedAt?: string; // ISO string
  bookmarked: boolean;
  liked: boolean;
  notes?: string;
  customData?: Record<string, any>;
}

// Storage keys
const CONTENT_PROGRESS_STORAGE_KEY = 'zero_circle_content_progress';
const RECENT_CONTENT_STORAGE_KEY = 'zero_circle_recent_content';
const BOOKMARKED_CONTENT_STORAGE_KEY = 'zero_circle_bookmarked_content';

/**
 * Hook for managing Buddhist content
 */
export const useBuddhistContent = () => {
  const [contentList, setContentList] = useState<BuddhistContent[]>([]);
  const [collections, setCollections] = useState<ContentCollection[]>([]);
  const [contentProgress, setContentProgress] = useState<ContentProgress[]>([]);
  const [recentContentIds, setRecentContentIds] = useState<string[]>([]);
  const [bookmarkedContentIds, setBookmarkedContentIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { isConnected } = useNetworkState();
  const { trackCustomEvent } = useAnalytics();
  const { isContentAvailableOffline, downloadContent } = useOfflineData();
  const { updateContentStats } = useUserProgress();
  
  // Load content progress from storage on mount
  useEffect(() => {
    const loadContentProgress = async () => {
      try {
        const storedProgress = await AsyncStorage.getItem(CONTENT_PROGRESS_STORAGE_KEY);
        
        if (storedProgress) {
          setContentProgress(JSON.parse(storedProgress));
        } else {
          // Initialize with empty array if none exist
          setContentProgress([]);
          await AsyncStorage.setItem(CONTENT_PROGRESS_STORAGE_KEY, JSON.stringify([]));
        }
      } catch (err) {
        console.error('Failed to load content progress:', err);
      }
    };
    
    const loadRecentContent = async () => {
      try {
        const storedRecentContent = await AsyncStorage.getItem(RECENT_CONTENT_STORAGE_KEY);
        
        if (storedRecentContent) {
          setRecentContentIds(JSON.parse(storedRecentContent));
        } else {
          // Initialize with empty array if none exist
          setRecentContentIds([]);
          await AsyncStorage.setItem(RECENT_CONTENT_STORAGE_KEY, JSON.stringify([]));
        }
      } catch (err) {
        console.error('Failed to load recent content:', err);
      }
    };
    
    const loadBookmarkedContent = async () => {
      try {
        const storedBookmarkedContent = await AsyncStorage.getItem(BOOKMARKED_CONTENT_STORAGE_KEY);
        
        if (storedBookmarkedContent) {
          setBookmarkedContentIds(JSON.parse(storedBookmarkedContent));
        } else {
          // Initialize with empty array if none exist
          setBookmarkedContentIds([]);
          await AsyncStorage.setItem(BOOKMARKED_CONTENT_STORAGE_KEY, JSON.stringify([]));
        }
      } catch (err) {
        console.error('Failed to load bookmarked content:', err);
      }
    };
    
    const loadAllData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load content and collections from API
        await fetchContent();
        await fetchCollections();
        
        // Load local data
        await Promise.all([
          loadContentProgress(),
          loadRecentContent(),
          loadBookmarkedContent(),
        ]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load Buddhist content'));
        console.error('Failed to load Buddhist content:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAllData();
  }, []);
  
  // Save content progress to storage whenever it changes
  useEffect(() => {
    if (!isLoading && contentProgress.length > 0) {
      const saveContentProgress = async () => {
        try {
          await AsyncStorage.setItem(CONTENT_PROGRESS_STORAGE_KEY, JSON.stringify(contentProgress));
        } catch (err) {
          console.error('Failed to save content progress:', err);
        }
      };
      
      saveContentProgress();
    }
  }, [contentProgress, isLoading]);
  
  // Save recent content to storage whenever it changes
  useEffect(() => {
    if (!isLoading && recentContentIds.length > 0) {
      const saveRecentContent = async () => {
        try {
          await AsyncStorage.setItem(RECENT_CONTENT_STORAGE_KEY, JSON.stringify(recentContentIds));
        } catch (err) {
          console.error('Failed to save recent content:', err);
        }
      };
      
      saveRecentContent();
    }
  }, [recentContentIds, isLoading]);
  
  // Save bookmarked content to storage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      const saveBookmarkedContent = async () => {
        try {
          await AsyncStorage.setItem(BOOKMARKED_CONTENT_STORAGE_KEY, JSON.stringify(bookmarkedContentIds));
        } catch (err) {
          console.error('Failed to save bookmarked content:', err);
        }
      };
      
      saveBookmarkedContent();
    }
  }, [bookmarkedContentIds, isLoading]);
  
  // Fetch content from API
  const fetchContent = useCallback(async () => {
    if (!isConnected) {
      return { success: false, error: 'No internet connection' };
    }
    
    try {
      // TODO: Implement actual API call to fetch content
      // For now, just simulate fetching with mock data
      console.log('Fetching Buddhist content from API');
      
      // Simulate API response delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data for testing
      const mockContent: BuddhistContent[] = [
        {
          id: 'content_1',
          title: 'Introduction to Mindfulness',
          description: 'Learn the basics of mindfulness meditation',
          type: 'article',
          category: 'meditation',
          tags: ['mindfulness', 'beginner', 'meditation'],
          author: 'Thich Nhat Hanh',
          content: '<p>Mindfulness is the practice of being fully present and engaged in the moment...</p>',
          imageUrl: 'https://example.com/images/mindfulness.jpg',
          difficulty: 'beginner',
          relatedContentIds: ['content_2', 'content_3'],
          isFeatured: true,
          isPremium: false,
          publishedDate: '2023-01-15T00:00:00Z',
          lastUpdated: '2023-01-15T00:00:00Z',
          viewCount: 1250,
          likeCount: 320,
          bookmarkCount: 180,
        },
        {
          id: 'content_2',
          title: 'The Four Noble Truths',
          description: 'Understanding the core teachings of Buddhism',
          type: 'article',
          category: 'philosophy',
          tags: ['philosophy', 'core teachings', 'noble truths'],
          author: 'Dalai Lama',
          content: '<p>The Four Noble Truths are the foundation of Buddhist philosophy...</p>',
          imageUrl: 'https://example.com/images/noble_truths.jpg',
          difficulty: 'beginner',
          relatedContentIds: ['content_1', 'content_4'],
          isFeatured: false,
          isPremium: false,
          publishedDate: '2023-02-10T00:00:00Z',
          lastUpdated: '2023-02-10T00:00:00Z',
          viewCount: 980,
          likeCount: 245,
          bookmarkCount: 150,
        },
        {
          id: 'content_3',
          title: 'Loving-Kindness Meditation',
          description: 'Develop compassion through metta meditation',
          type: 'audio',
          category: 'meditation',
          tags: ['metta', 'compassion', 'meditation'],
          author: 'Sharon Salzberg',
          content: '<p>This guided meditation will help you develop loving-kindness...</p>',
          imageUrl: 'https://example.com/images/loving_kindness.jpg',
          audioUrl: 'https://example.com/audio/loving_kindness.mp3',
          duration: 15,
          difficulty: 'intermediate',
          relatedContentIds: ['content_1', 'content_5'],
          isFeatured: true,
          isPremium: true,
          publishedDate: '2023-03-05T00:00:00Z',
          lastUpdated: '2023-03-05T00:00:00Z',
          viewCount: 750,
          likeCount: 210,
          bookmarkCount: 130,
        },
        {
          id: 'content_4',
          title: 'The Eightfold Path',
          description: 'A guide to ethical and mental development in Buddhism',
          type: 'article',
          category: 'ethics',
          tags: ['eightfold path', 'ethics', 'practice'],
          author: 'Bhikkhu Bodhi',
          content: '<p>The Eightfold Path is a practical guideline for ethical and mental development...</p>',
          imageUrl: 'https://example.com/images/eightfold_path.jpg',
          difficulty: 'intermediate',
          relatedContentIds: ['content_2', 'content_6'],
          isFeatured: false,
          isPremium: false,
          publishedDate: '2023-04-20T00:00:00Z',
          lastUpdated: '2023-04-20T00:00:00Z',
          viewCount: 620,
          likeCount: 180,
          bookmarkCount: 95,
        },
        {
          id: 'content_5',
          title: 'Introduction to Zen Meditation',
          description: 'Learn the basics of Zen meditation practice',
          type: 'video',
          category: 'meditation',
          tags: ['zen', 'meditation', 'practice'],
          author: 'Shunryu Suzuki',
          content: '<p>This video introduces the fundamentals of Zen meditation...</p>',
          imageUrl: 'https://example.com/images/zen_meditation.jpg',
          videoUrl: 'https://example.com/videos/zen_meditation.mp4',
          duration: 25,
          difficulty: 'beginner',
          relatedContentIds: ['content_1', 'content_3'],
          isFeatured: true,
          isPremium: true,
          publishedDate: '2023-05-12T00:00:00Z',
          lastUpdated: '2023-05-12T00:00:00Z',
          viewCount: 890,
          likeCount: 260,
          bookmarkCount: 140,
        },
      ];
      
      setContentList(mockContent);
      
      // Track content fetch
      trackCustomEvent('content_fetched', {
        count: mockContent.length,
      });
      
      return { success: true, count: mockContent.length };
    } catch (err) {
      console.error('Failed to fetch content:', err);
      return { success: false, error: err };
    }
  }, [isConnected, trackCustomEvent]);
  
  // Fetch collections from API
  const fetchCollections = useCallback(async () => {
    if (!isConnected) {
      return { success: false, error: 'No internet connection' };
    }
    
    try {
      // TODO: Implement actual API call to fetch collections
      // For now, just simulate fetching with mock data
      console.log('Fetching content collections from API');
      
      // Simulate API response delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data for testing
      const mockCollections: ContentCollection[] = [
        {
          id: 'collection_1',
          title: 'Beginner Meditation Guide',
          description: 'Start your meditation journey with these beginner-friendly resources',
          imageUrl: 'https://example.com/images/beginner_meditation.jpg',
          contentIds: ['content_1', 'content_5'],
          category: 'meditation',
          tags: ['beginner', 'meditation', 'guide'],
          isFeatured: true,
          isPremium: false,
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
        {
          id: 'collection_2',
          title: 'Buddhist Philosophy Essentials',
          description: 'Core philosophical teachings of Buddhism',
          imageUrl: 'https://example.com/images/buddhist_philosophy.jpg',
          contentIds: ['content_2', 'content_4'],
          category: 'philosophy',
          tags: ['philosophy', 'core teachings'],
          isFeatured: false,
          isPremium: false,
          createdAt: '2023-02-01T00:00:00Z',
          updatedAt: '2023-02-01T00:00:00Z',
        },
        {
          id: 'collection_3',
          title: 'Premium Meditation Practices',
          description: 'Advanced meditation techniques for dedicated practitioners',
          imageUrl: 'https://example.com/images/premium_meditation.jpg',
          contentIds: ['content_3', 'content_5'],
          category: 'meditation',
          tags: ['premium', 'advanced', 'meditation'],
          isFeatured: true,
          isPremium: true,
          createdAt: '2023-03-01T00:00:00Z',
          updatedAt: '2023-03-01T00:00:00Z',
        },
      ];
      
      setCollections(mockCollections);
      
      // Track collections fetch
      trackCustomEvent('collections_fetched', {
        count: mockCollections.length,
      });
      
      return { success: true, count: mockCollections.length };
    } catch (err) {
      console.error('Failed to fetch collections:', err);
      return { success: false, error: err };
    }
  }, [isConnected, trackCustomEvent]);
  
  // Get content by ID
  const getContentById = useCallback((id: string) => {
    return contentList.find(content => content.id === id) || null;
  }, [contentList]);
  
  // Get collection by ID
  const getCollectionById = useCallback((id: string) => {
    return collections.find(collection => collection.id === id) || null;
  }, [collections]);
  
  // Get content by category
  const getContentByCategory = useCallback((category: string) => {
    return contentList.filter(content => content.category === category);
  }, [contentList]);
  
  // Get content by type
  const getContentByType = useCallback((type: string) => {
    return contentList.filter(content => content.type === type);
  }, [contentList]);
  
  // Get content by tags
  const getContentByTags = useCallback((tags: string[]) => {
    return contentList.filter(content => {
      return tags.some(tag => content.tags.includes(tag));
    });
  }, [contentList]);
  
  // Get featured content
  const getFeaturedContent = useCallback(() => {
    return contentList.filter(content => content.isFeatured);
  }, [contentList]);
  
  // Get premium content
  const getPremiumContent = useCallback(() => {
    return contentList.filter(content => content.isPremium);
  }, [contentList]);
  
  // Get related content
  const getRelatedContent = useCallback((contentId: string) => {
    const content = getContentById(contentId);
    if (!content) return [];
    
    return contentList.filter(item => 
      content.relatedContentIds.includes(item.id) && item.id !== contentId
    );
  }, [contentList, getContentById]);
  
  // Get collections by category
  const getCollectionsByCategory = useCallback((category: string) => {
    return collections.filter(collection => collection.category === category);
  }, [collections]);
  
  // Get featured collections
  const getFeaturedCollections = useCallback(() => {
    return collections.filter(collection => collection.isFeatured);
  }, [collections]);
  
  // Get premium collections
  const getPremiumCollections = useCallback(() => {
    return collections.filter(collection => collection.isPremium);
  }, [collections]);
  
  // Get content for a collection
  const getCollectionContent = useCallback((collectionId: string) => {
    const collection = getCollectionById(collectionId);
    if (!collection) return [];
    
    return contentList.filter(content => collection.contentIds.includes(content.id));
  }, [contentList, getCollectionById]);
  
  // Get content progress
  const getContentProgress = useCallback((contentId: string) => {
    return contentProgress.find(progress => progress.contentId === contentId) || null;
  }, [contentProgress]);
  
  // Update content progress
  const updateProgress = useCallback((contentId: string, progress: number) => {
    const now = new Date().toISOString();
    const content = getContentById(contentId);
    
    if (!content) return null;
    
    setContentProgress(prevProgress => {
      const existingProgress = prevProgress.find(p => p.contentId === contentId);
      
      if (existingProgress) {
        // Update existing progress
        const completed = progress >= 100;
        const wasCompleted = existingProgress.completed;
        
        // If newly completed, update user progress stats
        if (completed && !wasCompleted) {
          updateContentStats(1);
        }
        
        return prevProgress.map(p => {
          if (p.contentId === contentId) {
            return {
              ...p,
              progress: Math.min(100, progress),
              completed,
              lastAccessedAt: now,
              completedAt: completed && !wasCompleted ? now : p.completedAt,
            };
          }
          return p;
        });
      } else {
        // Create new progress entry
        const completed = progress >= 100;
        
        // If completed on first view, update user progress stats
        if (completed) {
          updateContentStats(1);
        }
        
        return [
          ...prevProgress,
          {
            contentId,
            progress: Math.min(100, progress),
            completed,
            lastAccessedAt: now,
            completedAt: completed ? now : undefined,
            bookmarked: false,
            liked: false,
          },
        ];
      }
    });
    
    // Add to recent content
    addToRecentContent(contentId);
    
    // Track progress update
    trackCustomEvent('content_progress_updated', {
      content_id: contentId,
      content_title: content.title,
      content_type: content.type,
      progress,
    });
    
    return true;
  }, [contentProgress, getContentById, updateContentStats, trackCustomEvent]);
  
  // Mark content as viewed
  const markContentViewed = useCallback((contentId: string) => {
    const content = getContentById(contentId);
    if (!content) return false;
    
    // Update content view count (in a real app, this would be an API call)
    setContentList(prevList => {
      return prevList.map(item => {
        if (item.id === contentId) {
          return {
            ...item,
            viewCount: item.viewCount + 1,
          };
        }
        return item;
      });
    });
    
    // Add to recent content
    addToRecentContent(contentId);
    
    // Track content view
    trackCustomEvent('content_viewed', {
      content_id: contentId,
      content_title: content.title,
      content_type: content.type,
    });
    
    return true;
  }, [contentList, getContentById, trackCustomEvent]);
  
  // Add to recent content
  const addToRecentContent = useCallback((contentId: string) => {
    setRecentContentIds(prevIds => {
      // Remove if already exists
      const filteredIds = prevIds.filter(id => id !== contentId);
      
      // Add to beginning of array (most recent first)
      const newIds = [contentId, ...filteredIds];
      
      // Limit to 20 most recent
      return newIds.slice(0, 20);
    });
  }, []);
  
  // Get recent content
  const getRecentContent = useCallback(() => {
    return recentContentIds
      .map(id => getContentById(id))
      .filter((content): content is BuddhistContent => content !== null);
  }, [recentContentIds, getContentById]);
  
  // Toggle bookmark status
  const toggleBookmark = useCallback((contentId: string) => {
    const content = getContentById(contentId);
    if (!content) return false;
    
    // Check if already bookmarked
    const isBookmarked = bookmarkedContentIds.includes(contentId);
    
    if (isBookmarked) {
      // Remove from bookmarks
      setBookmarkedContentIds(prevIds => prevIds.filter(id => id !== contentId));
      
      // Update content bookmark count
      setContentList(prevList => {
        return prevList.map(item => {
          if (item.id === contentId) {
            return {
              ...item,
              bookmarkCount: Math.max(0, item.bookmarkCount - 1),
            };
          }
          return item;
        });
      });
      
      // Update progress entry if exists
      setContentProgress(prevProgress => {
        return prevProgress.map(p => {
          if (p.contentId === contentId) {
            return {
              ...p,
              bookmarked: false,
            };
          }
          return p;
        });
      });
    } else {
      // Add to bookmarks
      setBookmarkedContentIds(prevIds => [...prevIds, contentId]);
      
      // Update content bookmark count
      setContentList(prevList => {
        return prevList.map(item => {
          if (item.id === contentId) {
            return {
              ...item,
              bookmarkCount: item.bookmarkCount + 1,
            };
          }
          return item;
        });
      });
      
      // Update progress entry if exists
      setContentProgress(prevProgress => {
        const existingProgress = prevProgress.find(p => p.contentId === contentId);
        
        if (existingProgress) {
          return prevProgress.map(p => {
            if (p.contentId === contentId) {
              return {
                ...p,
                bookmarked: true,
              };
            }
            return p;
          });
        } else {
          // Create new progress entry
          return [
            ...prevProgress,
            {
              contentId,
              progress: 0,
              completed: false,
              lastAccessedAt: new Date().toISOString(),
              bookmarked: true,
              liked: false,
            },
          ];
        }
      });
    }
    
    // Track bookmark toggle
    trackCustomEvent('content_bookmark_toggled', {
      content_id: contentId,
      content_title: content.title,
      content_type: content.type,
      is_bookmarked: !isBookmarked,
    });
    
    return true;
  }, [bookmarkedContentIds, contentList, contentProgress, getContentById, trackCustomEvent]);
  
  // Check if content is bookmarked
  const isBookmarked = useCallback((contentId: string) => {
    return bookmarkedContentIds.includes(contentId);
  }, [bookmarkedContentIds]);
  
  // Get bookmarked content
  const getBookmarkedContent = useCallback(() => {
    return bookmarkedContentIds
      .map(id => getContentById(id))
      .filter((content): content is BuddhistContent => content !== null);
  }, [bookmarkedContentIds, getContentById]);
  
  // Toggle like status
  const toggleLike = useCallback((contentId: string) => {
    const content = getContentById(contentId);
    if (!content) return false;
    
    // Check if already liked
    const progress = getContentProgress(contentId);
    const isLiked = progress?.liked || false;
    
    // Update progress entry
    setContentProgress(prevProgress => {
      const existingProgress = prevProgress.find(p => p.contentId === contentId);
      
      if (existingProgress) {
        return prevProgress.map(p => {
          if (p.contentId === contentId) {
            return {
              ...p,
              liked: !isLiked,
            };
          }
          return p;
        });
      } else {
        // Create new progress entry
        return [
          ...prevProgress,
          {
            contentId,
            progress: 0,
            completed: false,
            lastAccessedAt: new Date().toISOString(),
            bookmarked: false,
            liked: true,
          },
        ];
      }
    });
    
    // Update content like count
    setContentList(prevList => {
      return prevList.map(item => {
        if (item.id === contentId) {
          return {
            ...item,
            likeCount: isLiked ? Math.max(0, item.likeCount - 1) : item.likeCount + 1,
          };
        }
        return item;
      });
    });
    
    // Track like toggle
    trackCustomEvent('content_like_toggled', {
      content_id: contentId,
      content_title: content.title,
      content_type: content.type,
      is_liked: !isLiked,
    });
    
    return true;
  }, [contentList, getContentById, getContentProgress, trackCustomEvent]);
  
  // Check if content is liked
  const isLiked = useCallback((contentId: string) => {
    const progress = getContentProgress(contentId);
    return progress?.liked || false;
  }, [getContentProgress]);
  
  // Add notes to content
  const addContentNotes = useCallback((contentId: string, notes: string) => {
    const content = getContentById(contentId);
    if (!content) return false;
    
    setContentProgress(prevProgress => {
      const existingProgress = prevProgress.find(p => p.contentId === contentId);
      
      if (existingProgress) {
        return prevProgress.map(p => {
          if (p.contentId === contentId) {
            return {
              ...p,
              notes,
            };
          }
          return p;
        });
      } else {
        // Create new progress entry
        return [
          ...prevProgress,
          {
            contentId,
            progress: 0,
            completed: false,
            lastAccessedAt: new Date().toISOString(),
            bookmarked: false,
            liked: false,
            notes,
          },
        ];
      }
    });
    
    // Track notes added
    trackCustomEvent('content_notes_added', {
      content_id: contentId,
      content_title: content.title,
      content_type: content.type,
      notes_length: notes.length,
    });
    
    return true;
  }, [getContentById, trackCustomEvent]);
  
  // Get content notes
  const getContentNotes = useCallback((contentId: string) => {
    const progress = getContentProgress(contentId);
    return progress?.notes || '';
  }, [getContentProgress]);
  
  // Download content for offline use
  const downloadContentForOffline = useCallback(async (contentId: string) => {
    const content = getContentById(contentId);
    if (!content) return { success: false, error: 'Content not found' };
    
    try {
      // Download content
      const result = await downloadContent({
        id: content.id,
        type: 'buddhist_content',
        title: content.title,
        data: content,
        urls: [
          content.imageUrl,
          content.audioUrl,
          content.videoUrl,
        ].filter((url): url is string => !!url),
      });
      
      // Track download
      trackCustomEvent('content_downloaded', {
        content_id: contentId,
        content_title: content.title,
        content_type: content.type,
        success: result.success,
      });
      
      return result;
    } catch (err) {
      console.error('Failed to download content:', err);
      return { success: false, error: err };
    }
  }, [getContentById, downloadContent, trackCustomEvent]);
  
  // Check if content is available offline
  const isContentOffline = useCallback((contentId: string) => {
    return isContentAvailableOffline(contentId, 'buddhist_content');
  }, [isContentAvailableOffline]);
  
  // Search content
  const searchContent = useCallback((query: string) => {
    const lowerCaseQuery = query.toLowerCase();
    
    return contentList.filter(content => {
      return (
        content.title.toLowerCase().includes(lowerCaseQuery) ||
        content.description.toLowerCase().includes(lowerCaseQuery) ||
        content.content.toLowerCase().includes(lowerCaseQuery) ||
        content.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery)) ||
        (content.author && content.author.toLowerCase().includes(lowerCaseQuery))
      );
    });
  }, [contentList]);
  
  // Get all unique tags from content
  const getAllTags = useCallback(() => {
    const tagsSet = new Set<string>();
    
    contentList.forEach(content => {
      content.tags.forEach(tag => tagsSet.add(tag));
    });
    
    return Array.from(tagsSet).sort();
  }, [contentList]);
  
  // Get all unique categories from content
  const getAllCategories = useCallback(() => {
    const categoriesSet = new Set<string>();
    
    contentList.forEach(content => {
      categoriesSet.add(content.category);
    });
    
    return Array.from(categoriesSet).sort();
  }, [contentList]);
  
  // Get all unique types from content
  const getAllTypes = useCallback(() => {
    const typesSet = new Set<string>();
    
    contentList.forEach(content => {
      typesSet.add(content.type);
    });
    
    return Array.from(typesSet).sort();
  }, [contentList]);
  
  // Get all unique authors from content
  const getAllAuthors = useCallback(() => {
    const authorsSet = new Set<string>();
    
    contentList.forEach(content => {
      if (content.author) {
        authorsSet.add(content.author);
      }
    });
    
    return Array.from(authorsSet).sort();
  }, [contentList]);
  
  // Get completed content
  const getCompletedContent = useCallback(() => {
    const completedIds = contentProgress
      .filter(progress => progress.completed)
      .map(progress => progress.contentId);
    
    return contentList.filter(content => completedIds.includes(content.id));
  }, [contentList, contentProgress]);
  
  // Get in-progress content
  const getInProgressContent = useCallback(() => {
    const inProgressIds = contentProgress
      .filter(progress => progress.progress > 0 && !progress.completed)
      .map(progress => progress.contentId);
    
    return contentList.filter(content => inProgressIds.includes(content.id));
  }, [contentList, contentProgress]);
  
  // Refresh content from API
  const refreshContent = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch content and collections
      const contentResult = await fetchContent();
      const collectionsResult = await fetchCollections();
      
      return {
        success: contentResult.success && collectionsResult.success,
        contentCount: contentResult.success ? contentResult.count : 0,
        collectionsCount: collectionsResult.success ? collectionsResult.count : 0,
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh content'));
      console.error('Failed to refresh content:', err);
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }, [fetchContent, fetchCollections]);
  
  return {
    contentList,
    collections,
    contentProgress,
    isLoading,
    error,
    getContentById,
    getCollectionById,
    getContentByCategory,
    getContentByType,
    getContentByTags,
    getFeaturedContent,
    getPremiumContent,
    getRelatedContent,
    getCollectionsByCategory,
    getFeaturedCollections,
    getPremiumCollections,
    getCollectionContent,
    getContentProgress,
    updateProgress,
    markContentViewed,
    getRecentContent,
    toggleBookmark,
    isBookmarked,
    getBookmarkedContent,
    toggleLike,
    isLiked,
    addContentNotes,
    getContentNotes,
    downloadContentForOffline,
    isContentOffline,
    searchContent,
    getAllTags,
    getAllCategories,
    getAllTypes,
    getAllAuthors,
    getCompletedContent,
    getInProgressContent,
    refreshContent,
  };
};

/**
 * Hook for managing Buddhist quotes
 */
export const useBuddhistQuotes = () => {
  const { 
    getContentByType, 
    markContentViewed, 
    toggleBookmark, 
    isBookmarked,
    toggleLike,
    isLiked,
  } = useBuddhistContent();
  
  const { trackCustomEvent } = useAnalytics();
  
  // Get all quotes
  const getAllQuotes = useCallback(() => {
    return getContentByType('quote');
  }, [getContentByType]);
  
  // Get random quote
  const getRandomQuote = useCallback(() => {
    const quotes = getAllQuotes();
    if (quotes.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    
    // Mark as viewed
    markContentViewed(quote.id);
    
    // Track random quote viewed
    trackCustomEvent('random_quote_viewed', {
      quote_id: quote.id,
      quote_author: quote.author || 'Unknown',
    });
    
    return quote;
  }, [getAllQuotes, markContentViewed, trackCustomEvent]);
  
  // Get quote of the day
  const getQuoteOfTheDay = useCallback(() => {
    const quotes = getAllQuotes();
    if (quotes.length === 0) return null;
    
    // Use the date to determine which quote to show
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    
    // Create a deterministic index based on the date
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    
    const index = Math.abs(hash) % quotes.length;
    const quote = quotes[index];
    
    // Mark as viewed
    markContentViewed(quote.id);
    
    // Track quote of the day viewed
    trackCustomEvent('quote_of_the_day_viewed', {
      quote_id: quote.id,
      quote_author: quote.author || 'Unknown',
      date: dateString,
    });
    
    return quote;
  }, [getAllQuotes, markContentViewed, trackCustomEvent]);
  
  // Get quotes by author
  const getQuotesByAuthor = useCallback((author: string) => {
    const quotes = getAllQuotes();
    return quotes.filter(quote => quote.author === author);
  }, [getAllQuotes]);
  
  // Share quote
  const shareQuote = useCallback((quoteId: string) => {
    const quotes = getAllQuotes();
    const quote = quotes.find(q => q.id === quoteId);
    
    if (!quote) return { success: false, error: 'Quote not found' };
    
    // In a real app, this would use the Share API
    // For now, just return the formatted quote
    const shareText = `"${quote.content}" - ${quote.author || 'Unknown'}`;
    
    // Track quote shared
    trackCustomEvent('quote_shared', {
      quote_id: quoteId,
      quote_author: quote.author || 'Unknown',
    });
    
    return { success: true, shareText };
  }, [getAllQuotes, trackCustomEvent]);
  
  return {
    getAllQuotes,
    getRandomQuote,
    getQuoteOfTheDay,
    getQuotesByAuthor,
    shareQuote,
    toggleBookmark,
    isBookmarked,
    toggleLike,
    isLiked,
  };
};

/**
 * Hook for managing Buddhist courses
 */
export const useBuddhistCourses = () => {
  const { 
    getContentByType, 
    getContentById,
    updateProgress,
    getContentProgress,
    markContentViewed,
    toggleBookmark,
    isBookmarked,
  } = useBuddhistContent();
  
  const { trackCustomEvent } = useAnalytics();
  
  // Get all courses
  const getAllCourses = useCallback(() => {
    return getContentByType('course');
  }, [getContentByType]);
  
  // Get course modules (assuming course content has modules in customData)
  const getCourseModules = useCallback((courseId: string) => {
    const course = getContentById(courseId);
    if (!course) return [];
    
    return course.customData?.modules || [];
  }, [getContentById]);
  
  // Get course progress
  const getCourseProgress = useCallback((courseId: string) => {
    return getContentProgress(courseId);
  }, [getContentProgress]);
  
  // Start course
  const startCourse = useCallback((courseId: string) => {
    const course = getContentById(courseId);
    if (!course) return false;
    
    // Mark as viewed and set initial progress
    markContentViewed(courseId);
    updateProgress(courseId, 1); // 1% progress to indicate started
    
    // Track course started
    trackCustomEvent('course_started', {
      course_id: courseId,
      course_title: course.title,
    });
    
    return true;
  }, [getContentById, markContentViewed, updateProgress, trackCustomEvent]);
  
  // Complete module
  const completeModule = useCallback((courseId: string, moduleIndex: number) => {
    const course = getContentById(courseId);
    if (!course) return false;
    
    const modules = getCourseModules(courseId);
    if (moduleIndex < 0 || moduleIndex >= modules.length) return false;
    
    // Calculate new progress percentage
    const progressPerModule = 100 / modules.length;
    const newProgress = Math.min(100, (moduleIndex + 1) * progressPerModule);
    
    // Update progress
    updateProgress(courseId, newProgress);
    
    // Track module completed
    trackCustomEvent('course_module_completed', {
      course_id: courseId,
      course_title: course.title,
      module_index: moduleIndex,
      module_title: modules[moduleIndex].title,
      progress: newProgress,
    });
    
    return true;
  }, [getContentById, getCourseModules, updateProgress, trackCustomEvent]);
  
  // Get enrolled courses
  const getEnrolledCourses = useCallback(() => {
    const courses = getAllCourses();
    
    return courses.filter(course => {
      const progress = getContentProgress(course.id);
      return progress && progress.progress > 0;
    });
  }, [getAllCourses, getContentProgress]);
  
  // Get completed courses
  const getCompletedCourses = useCallback(() => {
    const courses = getAllCourses();
    
    return courses.filter(course => {
      const progress = getContentProgress(course.id);
      return progress && progress.completed;
    });
  }, [getAllCourses, getContentProgress]);
  
  return {
    getAllCourses,
    getCourseModules,
    getCourseProgress,
    startCourse,
    completeModule,
    getEnrolledCourses,
    getCompletedCourses,
    toggleBookmark,
    isBookmarked,
  };
};