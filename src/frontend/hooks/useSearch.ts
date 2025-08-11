import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetworkState } from './useAppState';
import { useAnalytics } from './useAnalytics';
import { useBuddhistContent, BuddhistContent } from './useBuddhistContent';

// Types
export interface SearchHistory {
  id: string;
  query: string;
  timestamp: string;
  resultCount: number;
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'history' | 'popular' | 'trending' | 'tag' | 'category' | 'author';
  weight: number; // For ranking suggestions
}

// Storage keys
const SEARCH_HISTORY_STORAGE_KEY = 'zero_circle_search_history';

/**
 * Hook for managing search functionality
 */
export const useSearch = () => {
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { isConnected } = useNetworkState();
  const { trackCustomEvent } = useAnalytics();
  const { 
    contentList, 
    searchContent, 
    getAllTags, 
    getAllCategories, 
    getAllAuthors 
  } = useBuddhistContent();
  
  // Load search history from storage on mount
  useEffect(() => {
    const loadSearchHistory = async () => {
      try {
        const storedHistory = await AsyncStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
        
        if (storedHistory) {
          setSearchHistory(JSON.parse(storedHistory));
        } else {
          // Initialize with empty array if none exist
          setSearchHistory([]);
          await AsyncStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify([]));
        }
      } catch (err) {
        console.error('Failed to load search history:', err);
      }
    };
    
    loadSearchHistory();
    fetchPopularSearches();
    fetchTrendingSearches();
  }, []);
  
  // Save search history to storage whenever it changes
  useEffect(() => {
    const saveSearchHistory = async () => {
      try {
        await AsyncStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(searchHistory));
      } catch (err) {
        console.error('Failed to save search history:', err);
      }
    };
    
    if (searchHistory.length > 0) {
      saveSearchHistory();
    }
  }, [searchHistory]);
  
  // Fetch popular searches
  const fetchPopularSearches = useCallback(async () => {
    if (!isConnected) return;
    
    try {
      // TODO: Implement actual API call to fetch popular searches
      // For now, just simulate fetching with mock data
      console.log('Fetching popular searches');
      
      // Simulate API response delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock data for testing
      const mockPopularSearches = [
        'meditation',
        'mindfulness',
        'four noble truths',
        'eightfold path',
        'zen',
        'compassion',
        'loving-kindness',
        'impermanence',
      ];
      
      setPopularSearches(mockPopularSearches);
    } catch (err) {
      console.error('Failed to fetch popular searches:', err);
    }
  }, [isConnected]);
  
  // Fetch trending searches
  const fetchTrendingSearches = useCallback(async () => {
    if (!isConnected) return;
    
    try {
      // TODO: Implement actual API call to fetch trending searches
      // For now, just simulate fetching with mock data
      console.log('Fetching trending searches');
      
      // Simulate API response delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock data for testing
      const mockTrendingSearches = [
        'buddhist psychology',
        'meditation for anxiety',
        'mindful eating',
        'dharma talks',
        'metta meditation',
      ];
      
      setTrendingSearches(mockTrendingSearches);
    } catch (err) {
      console.error('Failed to fetch trending searches:', err);
    }
  }, [isConnected]);
  
  // Perform search
  const performSearch = useCallback((query: string) => {
    if (!query.trim()) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Search content
      const results = searchContent(query);
      
      // Add to search history
      const timestamp = new Date().toISOString();
      const searchId = `search_${timestamp}`;
      
      setSearchHistory(prevHistory => {
        // Remove if same query exists
        const filteredHistory = prevHistory.filter(item => item.query.toLowerCase() !== query.toLowerCase());
        
        // Add to beginning of array (most recent first)
        const newHistory = [
          {
            id: searchId,
            query,
            timestamp,
            resultCount: results.length,
          },
          ...filteredHistory,
        ];
        
        // Limit to 50 most recent
        return newHistory.slice(0, 50);
      });
      
      // Track search
      trackCustomEvent('search_performed', {
        query,
        result_count: results.length,
      });
      
      setIsLoading(false);
      return results;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Search failed');
      setError(error);
      console.error('Search failed:', err);
      setIsLoading(false);
      return [];
    }
  }, [searchContent, trackCustomEvent]);
  
  // Clear search history
  const clearSearchHistory = useCallback(async () => {
    try {
      setSearchHistory([]);
      await AsyncStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify([]));
      
      // Track clear history
      trackCustomEvent('search_history_cleared', {});
      
      return true;
    } catch (err) {
      console.error('Failed to clear search history:', err);
      return false;
    }
  }, [trackCustomEvent]);
  
  // Delete a single search history item
  const deleteSearchHistoryItem = useCallback(async (id: string) => {
    try {
      setSearchHistory(prevHistory => {
        const newHistory = prevHistory.filter(item => item.id !== id);
        return newHistory;
      });
      
      // Track delete history item
      trackCustomEvent('search_history_item_deleted', {
        history_item_id: id,
      });
      
      return true;
    } catch (err) {
      console.error('Failed to delete search history item:', err);
      return false;
    }
  }, [trackCustomEvent]);
  
  // Get search suggestions based on input
  const getSearchSuggestions = useCallback((input: string): SearchSuggestion[] => {
    if (!input.trim()) return [];
    
    const lowerInput = input.toLowerCase();
    const suggestions: SearchSuggestion[] = [];
    
    // Add matching history items
    searchHistory
      .filter(item => item.query.toLowerCase().includes(lowerInput))
      .slice(0, 3) // Limit to 3 history suggestions
      .forEach(item => {
        suggestions.push({
          id: `history_${item.id}`,
          text: item.query,
          type: 'history',
          weight: 100, // High weight for history items
        });
      });
    
    // Add matching popular searches
    popularSearches
      .filter(item => item.toLowerCase().includes(lowerInput))
      .slice(0, 2) // Limit to 2 popular suggestions
      .forEach(item => {
        suggestions.push({
          id: `popular_${item}`,
          text: item,
          type: 'popular',
          weight: 80, // Medium-high weight for popular items
        });
      });
    
    // Add matching trending searches
    trendingSearches
      .filter(item => item.toLowerCase().includes(lowerInput))
      .slice(0, 2) // Limit to 2 trending suggestions
      .forEach(item => {
        suggestions.push({
          id: `trending_${item}`,
          text: item,
          type: 'trending',
          weight: 70, // Medium weight for trending items
        });
      });
    
    // Add matching tags
    getAllTags()
      .filter(tag => tag.toLowerCase().includes(lowerInput))
      .slice(0, 3) // Limit to 3 tag suggestions
      .forEach(tag => {
        suggestions.push({
          id: `tag_${tag}`,
          text: tag,
          type: 'tag',
          weight: 60, // Medium-low weight for tags
        });
      });
    
    // Add matching categories
    getAllCategories()
      .filter(category => category.toLowerCase().includes(lowerInput))
      .slice(0, 2) // Limit to 2 category suggestions
      .forEach(category => {
        suggestions.push({
          id: `category_${category}`,
          text: category,
          type: 'category',
          weight: 50, // Low weight for categories
        });
      });
    
    // Add matching authors
    getAllAuthors()
      .filter(author => author.toLowerCase().includes(lowerInput))
      .slice(0, 2) // Limit to 2 author suggestions
      .forEach(author => {
        suggestions.push({
          id: `author_${author}`,
          text: author,
          type: 'author',
          weight: 40, // Lowest weight for authors
        });
      });
    
    // Sort by weight (highest first)
    return suggestions.sort((a, b) => b.weight - a.weight);
  }, [searchHistory, popularSearches, trendingSearches, getAllTags, getAllCategories, getAllAuthors]);
  
  return {
    searchHistory,
    popularSearches,
    trendingSearches,
    isLoading,
    error,
    performSearch,
    clearSearchHistory,
    deleteSearchHistoryItem,
    getSearchSuggestions,
    fetchPopularSearches,
    fetchTrendingSearches,
  };
};

/**
 * Hook for content recommendations
 */
export const useContentRecommendations = () => {
  const { 
    contentList, 
    getContentById, 
    getContentByCategory, 
    getContentByTags, 
    getContentProgress,
    getRecentContent,
  } = useBuddhistContent();
  
  const { trackCustomEvent } = useAnalytics();
  
  // Get personalized recommendations based on user's history
  const getPersonalizedRecommendations = useCallback((limit: number = 10): BuddhistContent[] => {
    // Get recent content
    const recentContent = getRecentContent();
    
    if (recentContent.length === 0) {
      // If no recent content, return featured content
      return contentList
        .filter(content => content.isFeatured)
        .slice(0, limit);
    }
    
    // Collect tags and categories from recent content
    const recentTags = new Set<string>();
    const recentCategories = new Set<string>();
    
    recentContent.forEach(content => {
      content.tags.forEach(tag => recentTags.add(tag));
      recentCategories.add(content.category);
    });
    
    // Score each content item based on relevance to recent activity
    const scoredContent = contentList
      .filter(content => {
        // Filter out content that user has already viewed
        const isRecent = recentContent.some(rc => rc.id === content.id);
        return !isRecent;
      })
      .map(content => {
        let score = 0;
        
        // Score based on matching tags
        content.tags.forEach(tag => {
          if (recentTags.has(tag)) {
            score += 2;
          }
        });
        
        // Score based on matching category
        if (recentCategories.has(content.category)) {
          score += 3;
        }
        
        // Bonus for featured content
        if (content.isFeatured) {
          score += 1;
        }
        
        // Penalty for premium content (to balance recommendations)
        if (content.isPremium) {
          score -= 0.5;
        }
        
        return { content, score };
      });
    
    // Sort by score (highest first) and return content
    return scoredContent
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.content);
  }, [contentList, getRecentContent]);
  
  // Get similar content to a specific content item
  const getSimilarContent = useCallback((contentId: string, limit: number = 5): BuddhistContent[] => {
    const content = getContentById(contentId);
    
    if (!content) return [];
    
    // First, try to get related content directly
    const relatedIds = content.relatedContentIds || [];
    const relatedContent = relatedIds
      .map(id => getContentById(id))
      .filter((item): item is BuddhistContent => item !== null);
    
    if (relatedContent.length >= limit) {
      return relatedContent.slice(0, limit);
    }
    
    // If not enough related content, find similar by tags and category
    const similarByTagsAndCategory = contentList
      .filter(item => {
        // Filter out the original content and already included related content
        if (item.id === contentId || relatedIds.includes(item.id)) {
          return false;
        }
        
        // Check for matching category or tags
        const categoryMatch = item.category === content.category;
        const tagsMatch = item.tags.some(tag => content.tags.includes(tag));
        
        return categoryMatch || tagsMatch;
      })
      .map(item => {
        let score = 0;
        
        // Score based on matching tags
        const matchingTags = item.tags.filter(tag => content.tags.includes(tag));
        score += matchingTags.length * 2;
        
        // Score based on matching category
        if (item.category === content.category) {
          score += 3;
        }
        
        // Score based on matching type
        if (item.type === content.type) {
          score += 2;
        }
        
        // Score based on matching difficulty
        if (item.difficulty === content.difficulty) {
          score += 1;
        }
        
        return { item, score };
      })
      .sort((a, b) => b.score - a.score)
      .map(scored => scored.item);
    
    // Combine related and similar content, removing duplicates
    const combined = [...relatedContent];
    
    for (const item of similarByTagsAndCategory) {
      if (combined.length >= limit) break;
      if (!combined.some(c => c.id === item.id)) {
        combined.push(item);
      }
    }
    
    return combined;
  }, [contentList, getContentById]);
  
  // Get "continue learning" recommendations (in-progress content)
  const getContinueLearningRecommendations = useCallback((limit: number = 5): BuddhistContent[] => {
    // Get all content with progress between 1% and 99%
    const inProgressContent = contentList
      .map(content => {
        const progress = getContentProgress(content.id);
        if (!progress) return null;
        
        const progressPercent = progress.progress;
        if (progressPercent > 0 && progressPercent < 100) {
          return {
            content,
            progress: progressPercent,
            lastAccessed: new Date(progress.lastAccessedAt).getTime(),
          };
        }
        
        return null;
      })
      .filter((item): item is { content: BuddhistContent; progress: number; lastAccessed: number } => item !== null)
      .sort((a, b) => {
        // Sort by last accessed (most recent first)
        return b.lastAccessed - a.lastAccessed;
      })
      .slice(0, limit)
      .map(item => item.content);
    
    return inProgressContent;
  }, [contentList, getContentProgress]);
  
  // Get "because you liked" recommendations based on bookmarked or liked content
  const getBecauseYouLikedRecommendations = useCallback((contentId: string, limit: number = 5): BuddhistContent[] => {
    const content = getContentById(contentId);
    if (!content) return [];
    
    // Track recommendation request
    trackCustomEvent('because_you_liked_recommendations_requested', {
      content_id: contentId,
      content_title: content.title,
    });
    
    return getSimilarContent(contentId, limit);
  }, [getContentById, getSimilarContent, trackCustomEvent]);
  
  // Get daily recommendations
  const getDailyRecommendations = useCallback((limit: number = 3): BuddhistContent[] => {
    // Use the date to create a deterministic but changing set of recommendations
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    
    // Create a deterministic seed based on the date
    let seed = 0;
    for (let i = 0; i < dateString.length; i++) {
      seed = ((seed << 5) - seed) + dateString.charCodeAt(i);
      seed |= 0; // Convert to 32bit integer
    }
    
    // Use the seed to select content
    const shuffledContent = [...contentList];
    
    // Fisher-Yates shuffle with deterministic seed
    const random = (max: number) => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280 * max;
    };
    
    for (let i = shuffledContent.length - 1; i > 0; i--) {
      const j = Math.floor(random(i + 1));
      [shuffledContent[i], shuffledContent[j]] = [shuffledContent[j], shuffledContent[i]];
    }
    
    // Prioritize featured content in the daily recommendations
    const featured = shuffledContent.filter(content => content.isFeatured);
    const nonFeatured = shuffledContent.filter(content => !content.isFeatured);
    
    // Ensure at least one featured item if available
    const recommendations = [];
    
    if (featured.length > 0) {
      recommendations.push(featured[0]);
    }
    
    // Fill the rest with a mix of featured and non-featured
    const remaining = [...featured.slice(1), ...nonFeatured];
    recommendations.push(...remaining.slice(0, limit - recommendations.length));
    
    // Track daily recommendations generated
    trackCustomEvent('daily_recommendations_generated', {
      date: dateString,
      count: recommendations.length,
    });
    
    return recommendations;
  }, [contentList, trackCustomEvent]);
  
  // Get recommendations for new users
  const getNewUserRecommendations = useCallback((limit: number = 10): BuddhistContent[] => {
    // For new users, prioritize beginner-friendly, featured, non-premium content
    const recommendations = contentList
      .filter(content => content.difficulty === 'beginner')
      .sort((a, b) => {
        // Score based on multiple factors
        let scoreA = 0;
        let scoreB = 0;
        
        // Featured content gets higher score
        if (a.isFeatured) scoreA += 3;
        if (b.isFeatured) scoreB += 3;
        
        // Non-premium content gets higher score
        if (!a.isPremium) scoreA += 2;
        if (!b.isPremium) scoreB += 2;
        
        // Articles and videos are more accessible for beginners
        if (a.type === 'article' || a.type === 'video') scoreA += 1;
        if (b.type === 'article' || b.type === 'video') scoreB += 1;
        
        return scoreB - scoreA;
      })
      .slice(0, limit);
    
    // Track new user recommendations generated
    trackCustomEvent('new_user_recommendations_generated', {
      count: recommendations.length,
    });
    
    return recommendations;
  }, [contentList, trackCustomEvent]);
  
  // Get trending content
  const getTrendingContent = useCallback((limit: number = 5): BuddhistContent[] => {
    // In a real app, this would use actual trending metrics from the API
    // For now, simulate trending by using view count and recency
    
    // Get content published in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentContent = contentList.filter(content => {
      const publishDate = new Date(content.publishedDate);
      return publishDate >= thirtyDaysAgo;
    });
    
    // If not enough recent content, use all content
    const contentToRank = recentContent.length >= limit ? recentContent : contentList;
    
    // Rank by view count
    const trending = contentToRank
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit);
    
    return trending;
  }, [contentList]);
  
  return {
    getPersonalizedRecommendations,
    getSimilarContent,
    getContinueLearningRecommendations,
    getBecauseYouLikedRecommendations,
    getDailyRecommendations,
    getNewUserRecommendations,
    getTrendingContent,
  };
};