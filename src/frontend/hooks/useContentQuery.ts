import { useQuery } from '@tanstack/react-query';
import { contentService } from '../services/contentService';

// Content Search Query
export const useContentSearch = (query: string, contentType?: string, category?: string) => {
  return useQuery({
    queryKey: ['contentSearch', query, contentType, category],
    queryFn: () => contentService.searchContent(query, contentType, category),
    enabled: !!query,
  });
};

// Featured Content Query
export const useFeaturedContent = () => {
  return useQuery({
    queryKey: ['featuredContent'],
    queryFn: contentService.getFeaturedContent,
  });
};

// Recommended Content Query
export const useRecommendedContent = (userId: string) => {
  return useQuery({
    queryKey: ['recommendedContent', userId],
    queryFn: () => contentService.getRecommendedContent(userId),
    enabled: !!userId,
  });
};