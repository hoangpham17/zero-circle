import { useState, useEffect, useCallback, useMemo } from 'react';

// Hook for pagination
export const usePagination = <T,>(items: T[], itemsPerPage: number = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedItems, setPaginatedItems] = useState<T[]>([]);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedItems(items.slice(startIndex, endIndex));
  }, [items, currentPage, itemsPerPage]);

  useEffect(() => {
    // Reset to page 1 when items array changes
    setCurrentPage(1);
  }, [items]);

  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};

// Hook for filtering and sorting
export const useFilterSort = <T,>(items: T[], initialFilters: Record<string, any> = {}) => {
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters);
  const [sortConfig, setSortConfig] = useState<{ key: keyof T | null; direction: 'asc' | 'desc' }>({ 
    key: null, 
    direction: 'asc' 
  });

  // Apply filters and sorting
  const filteredSortedItems = useMemo(() => {
    // First apply filters
    let result = [...items];
    
    // Apply each filter
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        result = result.filter(item => {
          const itemValue = item[key as keyof T];
          
          // Handle different filter types
          if (typeof value === 'string' && typeof itemValue === 'string') {
            return itemValue.toLowerCase().includes(value.toLowerCase());
          } else if (Array.isArray(value)) {
            return value.includes(itemValue);
          } else if (typeof value === 'object' && value !== null) {
            // Range filter with min/max
            if ('min' in value && 'max' in value) {
              const numValue = Number(itemValue);
              return numValue >= value.min && numValue <= value.max;
            }
          }
          
          // Default equality check
          return itemValue === value;
        });
      }
    });
    
    // Then apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof T];
        const bValue = b[sortConfig.key as keyof T];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return result;
  }, [items, filters, sortConfig]);

  // Update a specific filter
  const setFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Set sort configuration
  const setSort = useCallback((key: keyof T) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        // Toggle direction if same key
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      // Default to ascending for new key
      return { key, direction: 'asc' };
    });
  }, []);

  // Clear sorting
  const clearSort = useCallback(() => {
    setSortConfig({ key: null, direction: 'asc' });
  }, []);

  return {
    filters,
    sortConfig,
    filteredSortedItems,
    setFilter,
    clearFilters,
    setSort,
    clearSort,
  };
};

// Hook for search functionality
export const useSearch = <T,>(items: T[], searchKeys: (keyof T)[], initialQuery: string = '') => {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Apply search to items
  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return items;
    }

    const lowerCaseQuery = debouncedQuery.toLowerCase();
    
    return items.filter(item => {
      return searchKeys.some(key => {
        const value = item[key];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(lowerCaseQuery);
        } else if (typeof value === 'number') {
          return value.toString().includes(lowerCaseQuery);
        }
        return false;
      });
    });
  }, [items, debouncedQuery, searchKeys]);

  return {
    query,
    setQuery,
    searchResults,
    isSearching: debouncedQuery.trim() !== '',
  };
};

// Hook for grouping data
export const useGroupBy = <T,>(items: T[], groupKey: keyof T) => {
  const groupedData = useMemo(() => {
    const result: Record<string, T[]> = {};
    
    items.forEach(item => {
      const key = String(item[groupKey]);
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(item);
    });
    
    return result;
  }, [items, groupKey]);

  return { groupedData };
};