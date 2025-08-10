import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Hook để lưu trữ và đọc dữ liệu từ AsyncStorage
 * 
 * @param key - Khóa để lưu trữ dữ liệu
 * @param initialValue - Giá trị ban đầu nếu không có dữ liệu trong storage
 * @returns Tuple gồm giá trị hiện tại và hàm để cập nhật giá trị
 * 
 * @example
 * ```jsx
 * // Lưu trữ thông tin người dùng
 * const [user, setUser] = useLocalStorage('user', null);
 * 
 * // Cập nhật thông tin người dùng
 * const updateUser = (newUserData) => {
 *   setUser(newUserData);
 * };
 * 
 * // Xóa thông tin người dùng (đăng xuất)
 * const logout = () => {
 *   setUser(null);
 * };
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => Promise<void>, boolean, Error | null] {
  // State để lưu trữ giá trị hiện tại
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  // State để theo dõi trạng thái loading
  const [loading, setLoading] = useState(true);
  // State để lưu trữ lỗi nếu có
  const [error, setError] = useState<Error | null>(null);

  // Đọc dữ liệu từ AsyncStorage khi component mount
  useEffect(() => {
    const getStoredValue = async () => {
      try {
        setLoading(true);
        const item = await AsyncStorage.getItem(key);
        
        // Nếu không có dữ liệu, sử dụng giá trị ban đầu
        if (item === null) {
          setStoredValue(initialValue);
        } else {
          // Parse dữ liệu JSON
          setStoredValue(JSON.parse(item));
        }
        
        setError(null);
      } catch (e) {
        console.error('Error reading from AsyncStorage:', e);
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        setLoading(false);
      }
    };

    getStoredValue();
  }, [key, initialValue]);

  // Hàm để cập nhật giá trị trong AsyncStorage
  const setValue = async (value: T | ((val: T) => T)) => {
    try {
      // Cho phép giá trị là một hàm như setState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // Lưu vào state và AsyncStorage
      setStoredValue(valueToStore);
      await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
      setError(null);
    } catch (e) {
      console.error('Error writing to AsyncStorage:', e);
      setError(e instanceof Error ? e : new Error(String(e)));
    }
  };

  return [storedValue, setValue, loading, error];
}

/**
 * Lưu ý cho việc triển khai thực tế:
 * 
 * 1. Cài đặt AsyncStorage:
 *    - npm install @react-native-async-storage/async-storage
 *    - npx pod-install (cho iOS)
 * 
 * 2. Xử lý dữ liệu lớn:
 *    - Nên tránh lưu trữ dữ liệu quá lớn trong AsyncStorage
 *    - Có thể sử dụng thư viện như WatermelonDB cho dữ liệu phức tạp
 * 
 * 3. Bảo mật:
 *    - AsyncStorage không mã hóa dữ liệu
 *    - Sử dụng react-native-keychain cho dữ liệu nhạy cảm
 */