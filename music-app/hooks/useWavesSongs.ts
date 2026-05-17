// hooks/useWavesSongs.ts
import { useEffect, useState } from 'react';
import { searchSongs } from '../services/musicBrainz';
import { Song } from '../store/playerStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'waveform:waves_cache';
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

async function loadCache() {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return;
    const { data, timestamp } = JSON.parse(raw);
    // Only use cache if less than 1 hour old
    if (Date.now() - timestamp < CACHE_TTL) {
      Object.entries(data).forEach(([key, val]) => {
        cache.set(key, val as Song[]);
      });
    }
  } catch { }
}

async function saveCache() {
  try {
    const data = Object.fromEntries(cache.entries());
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch { }
}

export type WavePlaylist = {
  id: string;
  name: string;
  tags: string[];
  color: string;
  bg: string;
  query: string;
  songs: Song[];
  duration: string;
};

export type AutoPlaylist = {
  id: string;
  name: string;
  color: string;
  bg: string;
  songs: Song[];
};

const PLAYLIST_DEFS = [
  { id: 'p1', name: 'Morning ritual', tags: ['acoustic', 'lo-fi'], color: '#1d9e75', bg: '#0e1f1a', query: 'acoustic morning indie folk', duration: '1h 12m' },
  { id: 'p2', name: 'Gym mode', tags: ['high energy'], color: '#d85a30', bg: '#1e1010', query: 'hip hop trap workout high energy', duration: '2h 04m' },
  { id: 'p3', name: '3am thoughts', tags: ['slow', 'late night'], color: '#888780', bg: '#101018', query: 'ambient slow late night jazz instrumental', duration: '38m' },
];

const AUTO_QUERIES = [
  { id: 'a1', name: 'Time capsule', color: '#d4537e', bg: '#1e1020', query: '2000s pop nostalgic hits' },
  { id: 'a2', name: 'Mood mix', color: '#ba7517', bg: '#1a1008', query: 'indie alternative mixed mood' },
  { id: 'a3', name: 'Deep cuts', color: '#5a4be8', bg: '#13102a', query: 'underground alternative deep cuts' },
];

function genreToColor(genres: string[], fallback: { color: string; bg: string }) {
  const g = genres.join(' ').toLowerCase();
  if (g.includes('electronic') || g.includes('dance')) return { color: '#d85a30', bg: '#1e1010' };
  if (g.includes('jazz') || g.includes('soul')) return { color: '#888780', bg: '#101018' };
  if (g.includes('pop') || g.includes('indie')) return { color: '#1d9e75', bg: '#0e1f1a' };
  if (g.includes('classical') || g.includes('ambient')) return { color: '#5a4be8', bg: '#13102a' };
  if (g.includes('hip') || g.includes('rap')) return { color: '#d4537e', bg: '#1e1020' };
  return fallback;
}

function mapSongs(songs: any[], prefix: string, fallback: { color: string; bg: string }): Song[] {
  return songs
    .filter((s) => s.title && s.artist)
    .slice(0, 8)
    .map((s, i) => ({
      id: `${prefix}-${i}-${s.id}`,
      title: s.title,
      artist: s.artist,
      duration: s.duration,
      album: s.album,
      releaseId: s.releaseId,
      ...genreToColor(s.genres, fallback),
    }));
}

// ── Simple in-memory cache ──
const cache = new Map<string, Song[]>();

async function fetchWithCache(query: string, limit: number, prefix: string, fallback: { color: string; bg: string }): Promise<Song[]> {
  if (cache.has(query)) return cache.get(query)!;
  try {
    const { songs } = await searchSongs(query, limit);
    const mapped = mapSongs(songs, prefix, fallback);
    cache.set(query, mapped);
    return mapped;
  } catch {
    return [];
  }
}

export function useWavesSongs() {
  const [playlists, setPlaylists] = useState<WavePlaylist[]>(
    PLAYLIST_DEFS.map((p) => ({ ...p, songs: [] }))
  );
  const [autoPlaylists, setAutoPlaylists] = useState<AutoPlaylist[]>(
    AUTO_QUERIES.map((a) => ({ ...a, songs: [] }))
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      await loadCache(); 

      // Check if all queries already cached
      const allCached =
        PLAYLIST_DEFS.every((d) => cache.has(d.query)) &&
        AUTO_QUERIES.every((a) => cache.has(a.query));

      if (allCached) {
        // Instant — serve from cache
        setPlaylists(PLAYLIST_DEFS.map((def) => ({ ...def, songs: cache.get(def.query)! })));
        setAutoPlaylists(AUTO_QUERIES.map((auto) => ({ ...auto, songs: cache.get(auto.query)! })));
        setLoading(false);
        return;
      }

      setLoading(true);

      const [playlistResults, autoResults] = await Promise.all([
        Promise.all(PLAYLIST_DEFS.map((def) =>
          fetchWithCache(def.query, 10, def.id, { color: def.color, bg: def.bg })
        )),
        Promise.all(AUTO_QUERIES.map((auto) =>
          fetchWithCache(auto.query, 8, auto.id, { color: auto.color, bg: auto.bg })
        )),
      ]);

      if (cancelled) return;

      setPlaylists(PLAYLIST_DEFS.map((def, i) => ({ ...def, songs: playlistResults[i] })));
      setAutoPlaylists(AUTO_QUERIES.map((auto, i) => ({ ...auto, songs: autoResults[i] })));
      setLoading(false);

      await saveCache();
    }

    fetchAll();
    return () => { cancelled = true; };
  }, []);

  return { playlists, autoPlaylists, loading };
}