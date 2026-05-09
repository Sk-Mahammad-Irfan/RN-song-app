// hooks/useMusicBrainz.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { getCoverArt, MBSong, searchSongs } from '../services/musicBrainz';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type SongWithArt = MBSong & {
  coverArt: string | null;
  // mood color mapped from genre for WaveformBars
  color: string;
  bg: string;
};

// ─────────────────────────────────────────────
// Genre → mood color mapping
// ─────────────────────────────────────────────

function genreToColor(genres: string[]): { color: string; bg: string } {
  const g = genres.join(' ').toLowerCase();
  if (g.includes('electronic') || g.includes('edm') || g.includes('house')) {
    return { color: '#d85a30', bg: '#1e1010' };
  }
  if (g.includes('jazz') || g.includes('soul') || g.includes('blues')) {
    return { color: '#888780', bg: '#101018' };
  }
  if (g.includes('pop') || g.includes('r&b') || g.includes('rnb')) {
    return { color: '#d4537e', bg: '#1e1020' };
  }
  if (g.includes('folk') || g.includes('acoustic') || g.includes('indie')) {
    return { color: '#1d9e75', bg: '#0e1f1a' };
  }
  if (g.includes('hip') || g.includes('rap') || g.includes('trap')) {
    return { color: '#ba7517', bg: '#1a1008' };
  }
  // default purple
  return { color: '#5a4be8', bg: '#13102a' };
}

// ─────────────────────────────────────────────
// Main hook
// ─────────────────────────────────────────────

export function useMusicBrainz() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SongWithArt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { songs } = await searchSongs(q, 10);

      // Map genre to color immediately so UI can render
      const withColors: SongWithArt[] = songs.map((song) => ({
        ...song,
        coverArt: null,
        ...genreToColor(song.genres),
      }));

      setResults(withColors);
      setLoading(false);

      // Fetch cover art in background — update each card as art loads
      withColors.forEach(async (song, index) => {
        if (!song.releaseId) return;
        const art = await getCoverArt(song.releaseId);
        if (art) {
          setResults((prev) =>
            prev.map((s, i) => (i === index ? { ...s, coverArt: art } : s))
          );
        }
      });
    } catch (err) {
      setError('Search failed. Try again.');
      setLoading(false);
    }
  }, []);

  // Debounce — wait 600ms after user stops typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      search(query);
    }, 600);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clear,
    hasResults: results.length > 0,
    noResults: !loading && query.trim().length > 0 && results.length === 0,
  };
}