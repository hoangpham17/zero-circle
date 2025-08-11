import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';

type SyncItem = {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  data: any;
  timestamp: number;
};

type SyncQueueState = {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: number | null;
};

export const useOfflineSync = () => {
  const [state, setState] = useState<SyncQueueState>({
    isOnline: true,
    isSyncing: false,
    pendingCount: 0,
    lastSyncTime: null,
  });
  const queryClient = useQueryClient();

  // Initialize and load pending sync items
  useEffect(() => {
    const loadPendingCount = async () => {
      try {
        const syncQueueJson = await AsyncStorage.getItem('syncQueue');
        if (syncQueueJson) {
          const syncQueue: SyncItem[] = JSON.parse(syncQueueJson);
          setState(prev => ({ ...prev, pendingCount: syncQueue.length }));
        }
      } catch (error) {
        console.error('Error loading sync queue:', error);
      }
    };

    loadPendingCount();
  }, []);

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected ?? false;
      setState(prev => ({ ...prev, isOnline: isConnected }));

      // Attempt to sync when connection is restored
      if (isConnected && prev.pendingCount > 0 && !prev.isSyncing) {
        syncPendingItems();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [state.pendingCount, state.isSyncing]);

  // Add an item to the sync queue
  const addToSyncQueue = async (endpoint: string, method: 'POST' | 'PUT' | 'DELETE', data: any) => {
    try {
      // Generate a unique ID for this sync item
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const syncItem: SyncItem = {
        id,
        endpoint,
        method,
        data,
        timestamp: Date.now(),
      };

      // Get current queue
      const syncQueueJson = await AsyncStorage.getItem('syncQueue');
      const syncQueue: SyncItem[] = syncQueueJson ? JSON.parse(syncQueueJson) : [];
      
      // Add new item to queue
      syncQueue.push(syncItem);
      
      // Save updated queue
      await AsyncStorage.setItem('syncQueue', JSON.stringify(syncQueue));
      
      // Update state
      setState(prev => ({ ...prev, pendingCount: syncQueue.length }));
      
      // Try to sync immediately if online
      if (state.isOnline && !state.isSyncing) {
        syncPendingItems();
      }
      
      return id;
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      return null;
    }
  };

  // Sync pending items with the server
  const syncPendingItems = useCallback(async () => {
    if (state.isSyncing || !state.isOnline) return;

    setState(prev => ({ ...prev, isSyncing: true }));

    try {
      // Get current queue
      const syncQueueJson = await AsyncStorage.getItem('syncQueue');
      if (!syncQueueJson) {
        setState(prev => ({ ...prev, isSyncing: false, lastSyncTime: Date.now() }));
        return;
      }

      const syncQueue: SyncItem[] = JSON.parse(syncQueueJson);
      if (syncQueue.length === 0) {
        setState(prev => ({ ...prev, isSyncing: false, lastSyncTime: Date.now() }));
        return;
      }

      // Process each item in the queue
      const remainingItems: SyncItem[] = [];
      const apiClient = queryClient.getQueryData(['apiClient']);

      if (!apiClient) {
        setState(prev => ({ ...prev, isSyncing: false }));
        return;
      }

      for (const item of syncQueue) {
        try {
          // Attempt to sync with server
          if (item.method === 'POST') {
            await apiClient.post(item.endpoint, item.data);
          } else if (item.method === 'PUT') {
            await apiClient.put(item.endpoint, item.data);
          } else if (item.method === 'DELETE') {
            await apiClient.delete(item.endpoint);
          }
          
          // Invalidate related queries
          const endpointParts = item.endpoint.split('/');
          const resourceType = endpointParts[1]; // e.g., 'users', 'meditation', etc.
          queryClient.invalidateQueries({ queryKey: [resourceType] });
          
        } catch (error) {
          console.error(`Error syncing item ${item.id}:`, error);
          // Keep failed items in the queue for retry
          remainingItems.push(item);
        }
      }

      // Update the queue with remaining items
      await AsyncStorage.setItem('syncQueue', JSON.stringify(remainingItems));
      
      // Update state
      setState(prev => ({
        ...prev,
        isSyncing: false,
        pendingCount: remainingItems.length,
        lastSyncTime: Date.now(),
      }));
      
    } catch (error) {
      console.error('Error syncing pending items:', error);
      setState(prev => ({ ...prev, isSyncing: false }));
    }
  }, [state.isSyncing, state.isOnline, queryClient]);

  // Clear the sync queue
  const clearSyncQueue = async () => {
    try {
      await AsyncStorage.removeItem('syncQueue');
      setState(prev => ({ ...prev, pendingCount: 0 }));
    } catch (error) {
      console.error('Error clearing sync queue:', error);
    }
  };

  // Force a sync attempt
  const forceSync = async () => {
    if (state.pendingCount > 0 && !state.isSyncing) {
      await syncPendingItems();
    }
  };

  return {
    ...state,
    addToSyncQueue,
    syncPendingItems,
    clearSyncQueue,
    forceSync,
  };
};