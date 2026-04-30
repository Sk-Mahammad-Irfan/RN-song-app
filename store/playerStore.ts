import { create } from 'zustand';
import { SONGS } from '../constants/mockData';

type Song = (typeof SONGS)[0];

type PlayerState = {
  song: Song;
  isPlaying: boolean;
  progress: number;
  toggle: () => void;
  setSong: (song: Song) => void;
  next: () => void;
  prev: () => void;
};

export const usePlayer = create<PlayerState>((set, get) => ({
  song: SONGS[0],
  isPlaying: false,
  progress: 0.38,

  toggle: () => set((s) => ({ isPlaying: !s.isPlaying })),

  setSong: (song) => set({ song, isPlaying: true }),

  next: () => {
    const { song } = get();
    const i = SONGS.findIndex((s) => s.id === song.id);
    set({ song: SONGS[(i + 1) % SONGS.length], isPlaying: true });
  },

  prev: () => {
    const { song } = get();
    const i = SONGS.findIndex((s) => s.id === song.id);
    set({ song: SONGS[(i - 1 + SONGS.length) % SONGS.length], isPlaying: true });
  },
}));