// hooks/useMusicBrainz.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { getCoverArt, MBSong, searchSongs } from '../services/musicBrainz';
import { Song } from '../store/playerStore';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type SongWithArt = MBSong & {
  coverArt: string | null;
  color: string;
  bg: string;
};

// ─────────────────────────────────────────────
// Genre → mood color mapping
// ─────────────────────────────────────────────

function genreToColor(genres: string[]): { color: string; bg: string } {
  const g = genres.join(' ').toLowerCase();
  if (g.includes('electronic') || g.includes('edm') || g.includes('house'))
    return { color: '#d85a30', bg: '#1e1010' };
  if (g.includes('jazz') || g.includes('soul') || g.includes('blues'))
    return { color: '#888780', bg: '#101018' };
  if (g.includes('pop') || g.includes('r&b') || g.includes('rnb'))
    return { color: '#d4537e', bg: '#1e1020' };
  if (g.includes('folk') || g.includes('acoustic') || g.includes('indie'))
    return { color: '#1d9e75', bg: '#0e1f1a' };
  if (g.includes('hip') || g.includes('rap') || g.includes('trap'))
    return { color: '#ba7517', bg: '#1a1008' };
  return { color: '#5a4be8', bg: '#13102a' };
}

const PAGE_SIZE = 10;

// ─────────────────────────────────────────────
// Main hook
// ─────────────────────────────────────────────

export function useMusicBrainz() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SongWithArt[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentQueryRef = useRef('');

  const mapSongs = useCallback((songs: MBSong[]): SongWithArt[] => {
    return songs.map((song) => ({
      ...song,
      coverArt: null,
      ...genreToColor(song.genres),
    }));
  }, []);

  const fetchCoverArt = useCallback((songs: SongWithArt[], startIndex: number) => {
    songs.forEach(async (song, i) => {
      if (!song.releaseId) return;
      const art = await getCoverArt(song.releaseId);
      if (art) {
        setResults((prev) =>
          prev.map((s, idx) =>
            idx === startIndex + i ? { ...s, coverArt: art } : s
          )
        );
      }
    });
  }, []);

  // ── Initial search ──
  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setOffset(0);
      setHasMore(false);
      setTotal(0);
      setError(null);
      return;
    }

    currentQueryRef.current = q;
    setLoading(true);
    setError(null);
    setOffset(0);
    setResults([]);

    try {
      const { songs, total: t } = await searchSongs(q, PAGE_SIZE, 0);
      if (currentQueryRef.current !== q) return;

      const mapped = mapSongs(songs);
      setResults(mapped);
      setTotal(t);
      setHasMore(t > PAGE_SIZE);
      setOffset(PAGE_SIZE);
      setLoading(false);

      fetchCoverArt(mapped, 0);
    } catch {
      if (currentQueryRef.current !== q) return;
      setError('Search failed. Try again.');
      setLoading(false);
    }
  }, [mapSongs, fetchCoverArt]);

  // ── Load more ──
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !query.trim()) return;

    setLoadingMore(true);

    try {
      const { songs, total: t } = await searchSongs(query, PAGE_SIZE, offset);
      const mapped = mapSongs(songs);
      const startIndex = results.length;

      setResults((prev) => [...prev, ...mapped]);
      setTotal(t);
      setHasMore(offset + PAGE_SIZE < t);
      setOffset((prev) => prev + PAGE_SIZE);
      setLoadingMore(false);

      fetchCoverArt(mapped, startIndex);
    } catch {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, query, offset, results.length, mapSongs, fetchCoverArt]);

  // ── Debounce ──
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      search(query);
    }, 600);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
    setOffset(0);
    setHasMore(false);
    setTotal(0);
    currentQueryRef.current = '';
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    loadingMore,
    error,
    hasMore,
    total,
    loadMore,
    clear,
    hasResults: results.length > 0,
    noResults: !loading && query.trim().length > 0 && results.length === 0,
  };
}