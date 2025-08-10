import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Định nghĩa kiểu dữ liệu cho hàng đợi đồng bộ
interface SyncQueueItem {
  /**
   * ID duy nhất cho item trong hàng đợi
   */
  id: string;
  /**
   * Endpoint API
   */
  endpoint: string;
  /**
   * Phương thức HTTP
   */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /**
   * Dữ liệu gửi lên server
   */
  data?: any;
  /**
   * Thời gian tạo
   */
  createdAt: number;
  /**
   * Số lần thử lại
   */
  retries?: number;
}

/**
 * Hook quản lý đồng bộ hóa dữ liệu khi offline
 * 
 * @param syncQueueKey - Khóa để lưu trữ hàng đợi đồng bộ trong AsyncStorage
 * @param apiBaseUrl - URL cơ sở của API
 * @param maxRetries - Số lần thử lại tối đa cho mỗi item
 * @returns Các phương thức và trạng thái để quản lý đồng bộ hóa offline
 * 
 * @example
 * ```jsx
 * const {
 *   isOnline,
 *   isSyncing,
 *   queueLength,
 *   addToSyncQueue,
 *   processSyncQueue,
 *   clearSyncQueue
 * } = useOfflineSync('meditation-sync-queue', 'https://api.zerocircle.com');
 * 
 * // Thêm một hành động vào hàng đợi đồng bộ
 * const saveMeditationProgress = (sessionData) => {
 *   addToSyncQueue({
 *     endpoint: '/meditation/progress',
 *     method: 'POST',
 *     data: sessionData
 *   });
 * };
 * ```
 */
export const useOfflineSync = (
  syncQueueKey: string = 'offline-sync-queue',
  apiBaseUrl: string,
  maxRetries: number = 3
) => {
  // State cho trạng thái kết nối
  const [isOnline, setIsOnline] = useState<boolean>(true);
  // State cho trạng thái đồng bộ
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  // State cho hàng đợi đồng bộ
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);

  // Theo dõi trạng thái kết nối
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const online = state.isConnected !== false && state.isInternetReachable !== false;
      setIsOnline(online);

      // Tự động đồng bộ khi có kết nối trở lại
      if (online && syncQueue.length > 0 && !isSyncing) {
        processSyncQueue();
      }
    });

    // Khởi tạo: Đọc hàng đợi từ AsyncStorage
    loadSyncQueue();

    return () => {
      unsubscribe();
    };
  }, []);

  // Đọc hàng đợi đồng bộ từ AsyncStorage
  const loadSyncQueue = async () => {
    try {
      const queueData = await AsyncStorage.getItem(syncQueueKey);
      if (queueData) {
        const parsedQueue = JSON.parse(queueData) as SyncQueueItem[];
        setSyncQueue(parsedQueue);
      }
    } catch (error) {
      console.error('Error loading sync queue:', error);
    }
  };

  // Lưu hàng đợi đồng bộ vào AsyncStorage
  const saveSyncQueue = async (queue: SyncQueueItem[]) => {
    try {
      await AsyncStorage.setItem(syncQueueKey, JSON.stringify(queue));
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  };

  // Thêm một item vào hàng đợi đồng bộ
  const addToSyncQueue = useCallback(
    async ({
      endpoint,
      method,
      data,
    }: {
      endpoint: string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      data?: any;
    }) => {
      const newItem: SyncQueueItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        endpoint,
        method,
        data,
        createdAt: Date.now(),
        retries: 0,
      };

      const updatedQueue = [...syncQueue, newItem];
      setSyncQueue(updatedQueue);
      await saveSyncQueue(updatedQueue);

      // Nếu đang online, thử đồng bộ ngay lập tức
      if (isOnline && !isSyncing) {
        processSyncQueue();
      }

      return newItem.id;
    },
    [syncQueue, isOnline, isSyncing]
  );

  // Xử lý hàng đợi đồng bộ
  const processSyncQueue = useCallback(async () => {
    if (syncQueue.length === 0 || isSyncing || !isOnline) {
      return;
    }

    setIsSyncing(true);

    let currentQueue = [...syncQueue];
    let updatedQueue = [...syncQueue];

    for (const item of currentQueue) {
      try {
        // Gọi API
        const response = await fetch(`${apiBaseUrl}${item.endpoint}`, {
          method: item.method,
          headers: {
            'Content-Type': 'application/json',
            // Thêm headers khác nếu cần (ví dụ: Authorization)
          },
          body: item.data ? JSON.stringify(item.data) : undefined,
        });

        if (response.ok) {
          // Nếu thành công, xóa item khỏi hàng đợi
          updatedQueue = updatedQueue.filter((qItem) => qItem.id !== item.id);
        } else {
          // Nếu thất bại, tăng số lần thử lại
          if ((item.retries || 0) < maxRetries) {
            updatedQueue = updatedQueue.map((qItem) =>
              qItem.id === item.id
                ? { ...qItem, retries: (qItem.retries || 0) + 1 }
                : qItem
            );
          } else {
            // Đã vượt quá số lần thử lại, xóa khỏi hàng đợi
            updatedQueue = updatedQueue.filter((qItem) => qItem.id !== item.id);
            // Có thể thêm logic để lưu các item thất bại vào một nơi khác
          }
        }
      } catch (error) {
        console.error('Error processing sync item:', error);
        // Tăng số lần thử lại nếu lỗi mạng
        if ((item.retries || 0) < maxRetries) {
          updatedQueue = updatedQueue.map((qItem) =>
            qItem.id === item.id
              ? { ...qItem, retries: (qItem.retries || 0) + 1 }
              : qItem
          );
        } else {
          // Đã vượt quá số lần thử lại, xóa khỏi hàng đợi
          updatedQueue = updatedQueue.filter((qItem) => qItem.id !== item.id);
        }
      }
    }

    // Cập nhật hàng đợi
    setSyncQueue(updatedQueue);
    await saveSyncQueue(updatedQueue);

    setIsSyncing(false);
  }, [syncQueue, isSyncing, isOnline, apiBaseUrl, maxRetries]);

  // Xóa toàn bộ hàng đợi đồng bộ
  const clearSyncQueue = useCallback(async () => {
    setSyncQueue([]);
    await saveSyncQueue([]);
  }, []);

  return {
    isOnline,
    isSyncing,
    queueLength: syncQueue.length,
    syncQueue,
    addToSyncQueue,
    processSyncQueue,
    clearSyncQueue,
  };
};

/**
 * Lưu ý cho việc triển khai thực tế:
 * 
 * 1. Cài đặt NetInfo:
 *    - npm install @react-native-community/netinfo
 *    - npx pod-install (cho iOS)
 * 
 * 2. Xử lý xác thực:
 *    - Cần lưu ý về việc xử lý token xác thực khi đồng bộ
 *    - Có thể cần refresh token trước khi đồng bộ
 * 
 * 3. Xử lý xung đột:
 *    - Cần có chiến lược xử lý xung đột dữ liệu
 *    - Có thể sử dụng timestamp hoặc version để xác định phiên bản mới nhất
 * 
 * 4. Tối ưu hóa:
 *    - Nên giới hạn kích thước hàng đợi
 *    - Có thể gộp các request tương tự để giảm số lượng request
 */