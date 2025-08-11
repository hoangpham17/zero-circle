import { useState, useEffect } from 'react';
import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';
import * as FileSystem from 'expo-file-system';

type AudioState = {
  sound: Audio.Sound | null;
  isPlaying: boolean;
  duration: number;
  position: number;
  isLoaded: boolean;
  isBuffering: boolean;
  rate: number;
  volume: number;
  isMuted: boolean;
};

type AudioControls = {
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  replay: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  setRate: (rate: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  toggleMute: () => Promise<void>;
  unload: () => Promise<void>;
};

export const useAudio = (uri?: string): [AudioState, AudioControls] => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [audioState, setAudioState] = useState<AudioState>({
    sound: null,
    isPlaying: false,
    duration: 0,
    position: 0,
    isLoaded: false,
    isBuffering: false,
    rate: 1.0,
    volume: 1.0,
    isMuted: false,
  });

  // Load sound when URI changes
  useEffect(() => {
    const loadSound = async () => {
      if (!uri) return;

      try {
        // Unload any existing sound
        if (sound) {
          await sound.unloadAsync();
        }

        // Check if the file exists locally (for local files)
        if (uri.startsWith('file://')) {
          const fileInfo = await FileSystem.getInfoAsync(uri);
          if (!fileInfo.exists) {
            console.error('Audio file does not exist:', uri);
            return;
          }
        }

        // Load the sound
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: false },
          onPlaybackStatusUpdate
        );

        setSound(newSound);
      } catch (error) {
        console.error('Error loading sound:', error);
      }
    };

    loadSound();

    // Cleanup function
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [uri]);

  // Handle playback status updates
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    const isPlaying = status.isPlaying;
    const duration = status.durationMillis || 0;
    const position = status.positionMillis || 0;
    const isBuffering = status.isBuffering || false;
    const rate = status.rate;
    const volume = status.volume;
    const isMuted = status.isMuted;

    setAudioState(prev => ({
      ...prev,
      isPlaying,
      duration,
      position,
      isLoaded: true,
      isBuffering,
      rate,
      volume,
      isMuted,
    }));
  };

  // Audio controls
  const play = async () => {
    if (!sound) return;
    try {
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const pause = async () => {
    if (!sound) return;
    try {
      await sound.pauseAsync();
    } catch (error) {
      console.error('Error pausing sound:', error);
    }
  };

  const stop = async () => {
    if (!sound) return;
    try {
      await sound.stopAsync();
    } catch (error) {
      console.error('Error stopping sound:', error);
    }
  };

  const replay = async () => {
    if (!sound) return;
    try {
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch (error) {
      console.error('Error replaying sound:', error);
    }
  };

  const seekTo = async (position: number) => {
    if (!sound) return;
    try {
      await sound.setPositionAsync(position);
    } catch (error) {
      console.error('Error seeking sound:', error);
    }
  };

  const setRate = async (rate: number) => {
    if (!sound) return;
    try {
      await sound.setRateAsync(rate, true);
    } catch (error) {
      console.error('Error setting rate:', error);
    }
  };

  const setVolume = async (volume: number) => {
    if (!sound) return;
    try {
      await sound.setVolumeAsync(volume);
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  };

  const toggleMute = async () => {
    if (!sound) return;
    try {
      await sound.setIsMutedAsync(!audioState.isMuted);
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const unload = async () => {
    if (!sound) return;
    try {
      await sound.unloadAsync();
      setSound(null);
      setAudioState(prev => ({
        ...prev,
        sound: null,
        isPlaying: false,
        duration: 0,
        position: 0,
        isLoaded: false,
        isBuffering: false,
      }));
    } catch (error) {
      console.error('Error unloading sound:', error);
    }
  };

  const controls: AudioControls = {
    play,
    pause,
    stop,
    replay,
    seekTo,
    setRate,
    setVolume,
    toggleMute,
    unload,
  };

  return [{ ...audioState, sound }, controls];
};

// Hook to manage background audio
export const useBackgroundAudio = (uri?: string) => {
  const [audioState, controls] = useAudio(uri);
  
  // Set up audio mode for background playback
  useEffect(() => {
    const setupAudioMode = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error('Error setting audio mode:', error);
      }
    };
    
    setupAudioMode();
  }, []);
  
  return [audioState, controls] as const;
};