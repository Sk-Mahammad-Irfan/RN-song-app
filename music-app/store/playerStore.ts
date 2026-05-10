import { create } from 'zustand';

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
  isPlaying: boolean;
  progress: number;
  toggle: () => void;
  setSong: (song: Song) => void;
  setQueue: (songs: Song[], startIndex?: number) => void;
  setIsPlaying: (val: boolean) => void;
  setProgress: (val: number) => void;
  next: () => void;
  prev: () => void;
};

const defaultSong: Song = {
  id: '',
  title: '',
  artist: '',
  duration: '0:00',
  color: '#5a4be8',
  bg: '#13102a',
};

export const usePlayer = create<PlayerState>((set, get) => ({
  song: defaultSong,
  queue: [],
  isPlaying: false,
  progress: 0,

  toggle: () => set((s) => ({ isPlaying: !s.isPlaying })),

  setSong: (song) => set({ song, isPlaying: true }),

  setQueue: (songs, startIndex = 0) =>
    set({
      song: songs[startIndex],
      queue: songs,
      isPlaying: true,
    }),

  setIsPlaying: (val) => set({ isPlaying: val }),

  setProgress: (val) => set({ progress: val }),

  next: () => {
    const { song, queue } = get();
    if (!queue.length) return;
    const i = queue.findIndex((s) => s.id === song.id);
    set({ song: queue[(i + 1) % queue.length], isPlaying: true });
  },

  prev: () => {
    const { song, queue } = get();
    if (!queue.length) return;
    const i = queue.findIndex((s) => s.id === song.id);
    set({ song: queue[(i - 1 + queue.length) % queue.length], isPlaying: true });
  },
}));