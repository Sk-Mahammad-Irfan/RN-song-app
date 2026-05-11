import { Audio, AVPlaybackStatus } from 'expo-av';
import { create } from 'zustand';
import { getStreamUrl } from '../services/stream';

export type Song = {
  id: string;
  title: string;
  artist: string;
  duration: string;
  color: string;
  bg: string;
  album?: string;
  releaseId?: string;
  coverArt?: string | null;
};

type PlayerState = {
  song: Song;
  queue: Song[];
  recentlyPlayed: Song[];
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  totalDuration: number;
  isLoading: boolean;
  error: string | null;
  // Actions
  playSong: (song: Song) => Promise<void>;
  setQueue: (songs: Song[], startIndex?: number) => Promise<void>;
  togglePlay: () => Promise<void>;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  setProgress: (val: number) => void;
  setIsPlaying: (val: boolean) => void;
  seekTo: (ratio: number) => Promise<void>;
};

const defaultSong: Song = {
  id: '',
  title: '',
  artist: '',
  duration: '0:00',
  color: '#5a4be8',
  bg: '#13102a',
};

// Sound instance lives OUTSIDE the store/component — survives navigation
let globalSound: Audio.Sound | null = null;
let currentlyLoadingId = '';

async function stopAndUnload() {
  if (globalSound) {
    try {
      await globalSound.stopAsync();
      await globalSound.unloadAsync();
    } catch { }
    globalSound = null;
  }
}

export const usePlayer = create<PlayerState>((set, get) => ({
  song: defaultSong,
  queue: [],
  recentlyPlayed: [],
  isPlaying: false,
  progress: 0,
  currentTime: 0,
  totalDuration: 0,
  isLoading: false,
  error: null,

  setProgress: (val) => set({ progress: val }),
  setIsPlaying: (val) => set({ isPlaying: val }),

  playSong: async (song: Song) => {
    // If same song is already loaded — do nothing
    if (
      get().song.id === song.id &&
      globalSound !== null &&
      currentlyLoadingId !== song.id
    ) {
      return;
    }

    // Prevent double loading
    if (currentlyLoadingId === song.id) return;
    currentlyLoadingId = song.id;

    // Update recently played
    const { recentlyPlayed } = get();
    const filtered = recentlyPlayed.filter((s) => s.id !== song.id);

    set({
      song,
      isLoading: true,
      error: null,
      progress: 0,
      currentTime: 0,
      totalDuration: 0,
      recentlyPlayed: [song, ...filtered].slice(0, 10),
    });

    try {
      await stopAndUnload();

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      const streamUrl = await getStreamUrl(song.title, song.artist);

      // Guard — another song may have been requested while fetching
      if (currentlyLoadingId !== song.id) return;

      const { sound } = await Audio.Sound.createAsync(
        { uri: streamUrl },
        { shouldPlay: true, progressUpdateIntervalMillis: 500 },
        (status: AVPlaybackStatus) => {
          if (!status.isLoaded) return;
          const pos = (status.positionMillis ?? 0) / 1000;
          const dur = (status.durationMillis ?? 0) / 1000;
          set({
            currentTime: pos,
            totalDuration: dur,
            progress: dur > 0 ? pos / dur : 0,
            isPlaying: status.isPlaying,
          });
          // Auto advance
          if (status.didJustFinish) {
            get().next();
          }
        }
      );

      globalSound = sound;
      set({ isLoading: false, isPlaying: true });

    } catch (err: any) {
      if (currentlyLoadingId !== song.id) return;
      set({ isLoading: false, isPlaying: false, error: err.message });
    }

    currentlyLoadingId = '';
  },

  setQueue: async (songs, startIndex = 0) => {
    const song = songs[startIndex];
    set({ queue: songs });
    await get().playSong(song);
  },

  togglePlay: async () => {
    if (!globalSound) return;
    try {
      if (get().isPlaying) {
        await globalSound.pauseAsync();
        set({ isPlaying: false });
      } else {
        await globalSound.playAsync();
        set({ isPlaying: true });
      }
    } catch { }
  },

  seekTo: async (ratio: number) => {
    if (!globalSound) return;
    const { totalDuration } = get();
    try {
      await globalSound.setPositionAsync(ratio * totalDuration * 1000);
    } catch { }
  },

  next: async () => {
    const { song, queue } = get();
    if (!queue.length) return;
    const i = queue.findIndex((s) => s.id === song.id);
    await get().playSong(queue[(i + 1) % queue.length]);
  },

  prev: async () => {
    const { song, queue } = get();
    if (!queue.length) return;
    const i = queue.findIndex((s) => s.id === song.id);
    await get().playSong(queue[(i - 1 + queue.length) % queue.length]);
  },
}));