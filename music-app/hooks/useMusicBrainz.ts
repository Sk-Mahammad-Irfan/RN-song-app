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

  // ── Smart re-ranking after MusicBrainz returns results ──
  function rerankSongs(songs: SongWithArt[], query: string): SongWithArt[] {
    const q = query.toLowerCase().trim();
    const words = q.split(' ').filter(Boolean);

    const scored = songs.map((song) => {
      const title = song.title.toLowerCase();
      const artist = song.artist.toLowerCase();
      const combined = `${title} ${artist}`;
      let score = 0;

      // Exact title match — highest priority
      if (title === q) score += 100;

      // Title starts with query
      if (title.startsWith(q)) score += 60;

      // Title contains full query
      if (title.includes(q)) score += 40;

      // Artist contains full query
      if (artist.includes(q)) score += 30;

      // All query words found in title
      const allWordsInTitle = words.every((w) => title.includes(w));
      if (allWordsInTitle) score += 35;

      // All query words found in combined title+artist
      const allWordsInCombined = words.every((w) => combined.includes(w));
      if (allWordsInCombined) score += 20;

      // Word-by-word partial match
      words.forEach((w) => {
        if (title.includes(w)) score += 8;
        if (artist.includes(w)) score += 4;
      });

      // Bonus for songs that have an album (more established recordings)
      if (song.album) score += 5;

      // Bonus for songs with a year (more complete metadata = more known)
      if (song.year) score += 3;

      // Bonus for songs with genre tags (well-catalogued = popular)
      score += Math.min((song.genres || []).length * 2, 10);

      // Bonus if duration looks like a real song (2–6 minutes)
      if (song.duration && song.duration !== '0:00') {
        const parts = song.duration.split(':');
        const mins = parseInt(parts[0], 10);
        if (mins >= 2 && mins <= 6) score += 4;
      }

      return { song, score };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);
    return scored.map((s) => s.song);
  }

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

      // ← Re-rank before setting results
      const reranked = rerankSongs(mapped, q);

      setResults(reranked);
      setTotal(t);
      setHasMore(t > PAGE_SIZE);
      setOffset(PAGE_SIZE);
      setLoading(false);

      fetchCoverArt(reranked, 0);
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

      // ← Re-rank the new page too
      const reranked = rerankSongs(mapped, query);
      const startIndex = results.length;

      setResults((prev) => [...prev, ...reranked]);
      setTotal(t);
      setHasMore(offset + PAGE_SIZE < t);
      setOffset((prev) => prev + PAGE_SIZE);
      setLoadingMore(false);

      fetchCoverArt(reranked, startIndex);
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