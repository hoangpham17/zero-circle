import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';

// Hook for AsyncStorage
export const useAsyncStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load initial value from storage
  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        setLoading(true);
        const item = await AsyncStorage.getItem(key);
        const value = item ? JSON.parse(item) : initialValue;
        setStoredValue(value);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    loadStoredValue();
  }, [key, initialValue]);

  // Save value to storage
  const setValue = useCallback(
    async (value: T | ((val: T) => T)) => {
      try {
        setLoading(true);
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    },
    [key, storedValue]
  );

  // Remove value from storage
  const removeValue = useCallback(async () => {
    try {
      setLoading(true);
      await AsyncStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [key, initialValue]);

  return { storedValue, setValue, removeValue, loading, error };
};

// Hook for SecureStore
export const useSecureStore = (key: string, initialValue: string = '') => {
  const [secureValue, setSecureValue] = useState<string>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load initial value from secure storage
  useEffect(() => {
    const loadSecureValue = async () => {
      try {
        setLoading(true);
        const item = await SecureStore.getItemAsync(key);
        setSecureValue(item || initialValue);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    loadSecureValue();
  }, [key, initialValue]);

  // Save value to secure storage
  const setSecureStoreValue = useCallback(
    async (value: string | ((val: string) => string)) => {
      try {
        setLoading(true);
        const valueToStore = value instanceof Function ? value(secureValue) : value;
        setSecureValue(valueToStore);
        await SecureStore.setItemAsync(key, valueToStore);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    },
    [key, secureValue]
  );

  // Remove value from secure storage
  const removeSecureValue = useCallback(async () => {
    try {
      setLoading(true);
      await SecureStore.deleteItemAsync(key);
      setSecureValue(initialValue);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [key, initialValue]);

  return { secureValue, setSecureStoreValue, removeSecureValue, loading, error };
};

// Hook for FileSystem
export const useFileSystem = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Write to file
  const writeToFile = useCallback(async (fileUri: string, content: string) => {
    try {
      setLoading(true);
      await FileSystem.writeAsStringAsync(fileUri, content);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Read from file
  const readFromFile = useCallback(async (fileUri: string) => {
    try {
      setLoading(true);
      const content = await FileSystem.readAsStringAsync(fileUri);
      return content;
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete file
  const deleteFile = useCallback(async (fileUri: string) => {
    try {
      setLoading(true);
      await FileSystem.deleteAsync(fileUri);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if file exists
  const fileExists = useCallback(async (fileUri: string) => {
    try {
      setLoading(true);
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      return fileInfo.exists;
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create directory
  const createDirectory = useCallback(async (dirUri: string) => {
    try {
      setLoading(true);
      await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
      return true;
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // List directory contents
  const listDirectory = useCallback(async (dirUri: string) => {
    try {
      setLoading(true);
      const contents = await FileSystem.readDirectoryAsync(dirUri);
      return contents;
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Download file
  const downloadFile = useCallback(async (uri: string, fileUri: string, progressCallback?: (progress: number) => void) => {
    try {
      setLoading(true);
      const downloadResumable = FileSystem.createDownloadResumable(
        uri,
        fileUri,
        {},
        progressCallback ? (progress) => {
          const progressPercent = progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
          progressCallback(progressPercent);
        } : undefined
      );

      const result = await downloadResumable.downloadAsync();
      return result;
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get file info
  const getFileInfo = useCallback(async (fileUri: string) => {
    try {
      setLoading(true);
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      return fileInfo;
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    writeToFile,
    readFromFile,
    deleteFile,
    fileExists,
    createDirectory,
    listDirectory,
    downloadFile,
    getFileInfo,
    loading,
    error,
    clearError,
    documentDirectory: FileSystem.documentDirectory,
    cacheDirectory: FileSystem.cacheDirectory,
  };
};