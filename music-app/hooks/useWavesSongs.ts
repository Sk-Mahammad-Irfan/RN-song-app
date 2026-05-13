import { useEffect, useState } from 'react';
import { searchSongs } from '../services/musicBrainz';
import { Song } from '../store/playerStore';

// Playlist definitions with real search queries
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

const PLAYLIST_DEFS = [
  {
    id: 'p1',
    name: 'Morning ritual',
    tags: ['acoustic', 'lo-fi'],
    color: '#1d9e75',
    bg: '#0e1f1a',
    query: 'acoustic morning indie folk',
    duration: '1h 12m',
  },
  {
    id: 'p2',
    name: 'Gym mode',
    tags: ['high energy'],
    color: '#d85a30',
    bg: '#1e1010',
    query: 'hip hop trap workout high energy',
    duration: '2h 04m',
  },
  {
    id: 'p3',
    name: '3am thoughts',
    tags: ['slow', 'late night'],
    color: '#888780',
    bg: '#101018',
    query: 'ambient slow late night jazz instrumental',
    duration: '38m',
  },
];

const AUTO_QUERIES = [
  { id: 'a1', name: 'Time capsule', color: '#d4537e', bg: '#1e1020', query: '2000s pop nostalgic hits' },
  { id: 'a2', name: 'Mood mix', color: '#ba7517', bg: '#1a1008', query: 'indie alternative mixed mood' },
  { id: 'a3', name: 'Deep cuts', color: '#5a4be8', bg: '#13102a', query: 'underground alternative deep cuts' },
];

function genreToColor(
  genres: string[],
  fallback: { color: string; bg: string }
): { color: string; bg: string } {
  const g = genres.join(' ').toLowerCase();
  if (g.includes('electronic') || g.includes('dance')) return { color: '#d85a30', bg: '#1e1010' };
  if (g.includes('jazz') || g.includes('soul')) return { color: '#888780', bg: '#101018' };
  if (g.includes('pop') || g.includes('indie')) return { color: '#1d9e75', bg: '#0e1f1a' };
  if (g.includes('classical') || g.includes('ambient')) return { color: '#5a4be8', bg: '#13102a' };
  if (g.includes('hip') || g.includes('rap')) return { color: '#d4537e', bg: '#1e1020' };
  return fallback;
}

export type AutoPlaylist = {
  id: string;
  name: string;
  color: string;
  bg: string;
  songs: Song[];
};

export function useWavesSongs() {
  const [playlists, setPlaylists] = useState<WavePlaylist[]>(
    PLAYLIST_DEFS.map((p) => ({ ...p, songs: [] }))
  );
  const [autoPlaylists, setAutoPlaylists] = useState<AutoPlaylist[]>(
    AUTO_QUERIES.map((a) => ({ ...a, songs: [] }))
  );
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      setLoading(true);

      // Fetch liked songs
      try {
        const { songs } = await searchSongs('popular hits 2024', 8);
        if (!cancelled) {
          setLikedSongs(
            songs.filter((s) => s.title && s.artist).slice(0, 8).map((s, i) => ({
              id: `liked-${i}-${s.id}`,
              title: s.title,
              artist: s.artist,
              duration: s.duration,
              album: s.album,
              releaseId: s.releaseId,
              ...genreToColor(s.genres, { color: '#5a4be8', bg: '#13102a' }),
            }))
          );
        }
      } catch {}

      // Fetch playlist songs
      for (const def of PLAYLIST_DEFS) {
        try {
          const { songs } = await searchSongs(def.query, 10);
          if (cancelled) return;
          const mapped: Song[] = songs
            .filter((s) => s.title && s.artist)
            .slice(0, 8)
            .map((s, i) => ({
              id: `${def.id}-${i}-${s.id}`,
              title: s.title,
              artist: s.artist,
              duration: s.duration,
              album: s.album,
              releaseId: s.releaseId,
              ...genreToColor(s.genres, { color: def.color, bg: def.bg }),
            }));

          setPlaylists((prev) =>
            prev.map((p) =>
              p.id === def.id ? { ...p, songs: mapped } : p
            )
          );
        } catch {}
      }

      // Fetch auto-generated songs
      for (const auto of AUTO_QUERIES) {
        try {
          const { songs } = await searchSongs(auto.query, 8);
          if (cancelled) return;
          const mapped: Song[] = songs
            .filter((s) => s.title && s.artist)
            .slice(0, 6)
            .map((s, i) => ({
              id: `${auto.id}-${i}-${s.id}`,
              title: s.title,
              artist: s.artist,
              duration: s.duration,
              album: s.album,
              releaseId: s.releaseId,
              ...genreToColor(s.genres, { color: auto.color, bg: auto.bg }),
            }));

          setAutoPlaylists((prev) =>
            prev.map((a) =>
              a.id === auto.id ? { ...a, songs: mapped } : a
            )
          );
        } catch {}
      }

      if (!cancelled) setLoading(false);
    }

    fetchAll();
    return () => { cancelled = true; };
  }, []);

  return { playlists, autoPlaylists, likedSongs, loading };
}