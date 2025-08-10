import { useState, useEffect, useRef } from 'react';

// Định nghĩa kiểu dữ liệu cho media source
export interface MediaSource {
  /**
   * ID của media
   */
  id: string;
  /**
   * URL của file audio/video
   */
  url: string;
  /**
   * Tiêu đề của media
   */
  title: string;
  /**
   * Mô tả của media
   */
  description?: string;
  /**
   * URL của hình ảnh
   */
  imageUrl?: string;
  /**
   * Thời lượng của media (giây)
   */
  duration?: number;
  /**
   * Tác giả của media
   */
  author?: string;
}

// Định nghĩa kiểu dữ liệu cho trạng thái player
export type PlayerStatus = 'loading' | 'playing' | 'paused' | 'stopped' | 'error';

/**
 * Hook quản lý media player (audio/video)
 * 
 * @param initialSource - Media source ban đầu (optional)
 * @returns Các phương thức và trạng thái để điều khiển media player
 * 
 * @example
 * ```jsx
 * const {
 *   currentMedia,
 *   status,
 *   progress,
 *   duration,
 *   load,
 *   play,
 *   pause,
 *   stop,
 *   seek,
 *   setVolume,
 *   setPlaybackRate,
 * } = useMediaPlayer();
 * 
 * // Load media
 * useEffect(() => {
 *   load({
 *     id: '123',
 *     url: 'https://example.com/meditation.mp3',
 *     title: 'Thiền buổi sáng',
 *   });
 * }, []);
 * ```
 */
export const useMediaPlayer = (initialSource?: MediaSource) => {
  // State cho media hiện tại
  const [currentMedia, setCurrentMedia] = useState<MediaSource | null>(initialSource || null);
  // State cho trạng thái player
  const [status, setStatus] = useState<PlayerStatus>('stopped');
  // State cho tiến trình phát (0-1)
  const [progress, setProgress] = useState(0);
  // State cho thời lượng (giây)
  const [duration, setDuration] = useState(0);
  // State cho âm lượng (0-1)
  const [volume, setVolume] = useState(1);
  // State cho tốc độ phát (0.5-2)
  const [playbackRate, setPlaybackRate] = useState(1);
  // State cho lỗi
  const [error, setError] = useState<string | null>(null);

  // Ref cho interval cập nhật tiến trình
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  // Ref cho thời gian hiện tại (giây)
  const currentTimeRef = useRef(0);

  // Trong thực tế, bạn sẽ sử dụng thư viện như react-native-track-player
  // hoặc react-native-video để xử lý media

  /**
   * Load media mới
   */
  const load = (source: MediaSource) => {
    // Reset state
    setCurrentMedia(source);
    setStatus('loading');
    setProgress(0);
    currentTimeRef.current = 0;
    setError(null);

    // Giả lập việc load media
    setTimeout(() => {
      setStatus('paused');
      setDuration(source.duration || 0);
    }, 500);
  };

  /**
   * Phát media
   */
  const play = () => {
    if (!currentMedia) return;

    setStatus('playing');
    startProgressTracking();
  };

  /**
   * Tạm dừng media
   */
  const pause = () => {
    if (status !== 'playing') return;

    setStatus('paused');
    stopProgressTracking();
  };

  /**
   * Dừng và reset media
   */
  const stop = () => {
    setStatus('stopped');
    setProgress(0);
    currentTimeRef.current = 0;
    stopProgressTracking();
  };

  /**
   * Tua đến vị trí cụ thể (giây)
   */
  const seek = (time: number) => {
    if (!currentMedia) return;

    // Đảm bảo time nằm trong khoảng hợp lệ
    const validTime = Math.max(0, Math.min(time, duration));
    currentTimeRef.current = validTime;
    setProgress(duration > 0 ? validTime / duration : 0);
  };

  /**
   * Bắt đầu theo dõi tiến trình phát
   */
  const startProgressTracking = () => {
    stopProgressTracking();

    progressInterval.current = setInterval(() => {
      if (currentTimeRef.current < duration) {
        currentTimeRef.current += 0.1 * playbackRate;
        setProgress(duration > 0 ? currentTimeRef.current / duration : 0);
      } else {
        // Kết thúc media
        currentTimeRef.current = 0;
        setProgress(0);
        setStatus('stopped');
        stopProgressTracking();
      }
    }, 100);
  };

  /**
   * Dừng theo dõi tiến trình phát
   */
  const stopProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      stopProgressTracking();
    };
  }, []);

  // Load initial source nếu có
  useEffect(() => {
    if (initialSource) {
      load(initialSource);
    }
  }, []);

  return {
    currentMedia,
    status,
    progress,
    duration,
    volume,
    playbackRate,
    error,
    currentTime: currentTimeRef.current,
    load,
    play,
    pause,
    stop,
    seek,
    setVolume,
    setPlaybackRate,
  };
};

/**
 * Lưu ý cho việc triển khai thực tế:
 * 
 * 1. Sử dụng thư viện react-native-track-player cho audio:
 *    - Cài đặt: npm install react-native-track-player
 *    - Link: npx react-native link react-native-track-player
 *    - Tham khảo: https://react-native-track-player.js.org/
 * 
 * 2. Hoặc sử dụng react-native-video cho video:
 *    - Cài đặt: npm install react-native-video
 *    - Link: npx react-native link react-native-video
 *    - Tham khảo: https://github.com/react-native-video/react-native-video
 */