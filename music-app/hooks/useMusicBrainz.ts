import { useCallback, useEffect, useRef, useState } from 'react';
import { getCoverArt, MBSong, searchSongs } from '../services/musicBrainz';

export type SongWithArt = MBSong & {
  coverArt: string | null;
  color: string;
  bg: string;
};

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

function deduplicateSongs(songs: SongWithArt[]): SongWithArt[] {
  const seen = new Set<string>();
  return songs.filter((song) => {
    if (seen.has(song.id)) return false;
    seen.add(song.id);
    return true;
  });
}

function rerankSongs(songs: SongWithArt[], query: string): SongWithArt[] {
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter(Boolean);

  const scored = songs.map((song) => {
    const title = song.title.toLowerCase();
    const artist = song.artist.toLowerCase();
    const combined = `${title} ${artist}`;
    let score = 0;

    // ── Exact matches ──
    if (title === q) score += 200;
    if (combined.trim() === q) score += 180;

    // ── Title matches ──
    if (title.startsWith(q)) score += 80;
    if (title.includes(q)) score += 60;

    // ── Artist matches ──
    if (artist === q) score += 70;
    if (artist.startsWith(q)) score += 50;
    if (artist.includes(q)) score += 30;

    // ── All words in title ──
    const allWordsInTitle = words.every((w) => title.includes(w));
    if (allWordsInTitle) score += 55;

    // ── All words in artist ──
    const allWordsInArtist = words.every((w) => artist.includes(w));
    if (allWordsInArtist) score += 45;

    // ── All words in combined ──
    const allWordsInCombined = words.every((w) => combined.includes(w));
    if (allWordsInCombined) score += 35;

    // ── Partial word matches ──
    words.forEach((w) => {
      if (title.includes(w)) score += 12;
      if (artist.includes(w)) score += 8;
    });

    // ── Word count match bonus ──
    const titleWords = title.split(/\s+/).filter(Boolean);
    if (titleWords.length === words.length) score += 10;

    // ── Penalize much longer titles ──
    if (titleWords.length > words.length + 3) score -= 15;

    // ── Metadata quality bonuses ──
    if (song.album) score += 6;
    if (song.year) score += 4;
    score += Math.min((song.genres || []).length * 2, 12);

    // ── Duration sanity check ──
    if (song.duration && song.duration !== '0:00') {
      const parts = song.duration.split(':');
      const mins = parseInt(parts[0], 10);
      if (mins >= 2 && mins <= 7) score += 5;
    }

    return { song, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.song);
}

const PAGE_SIZE = 10;

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
      const reranked = rerankSongs(mapped, q);
      const deduped = deduplicateSongs(reranked);

      setResults(deduped);
      setTotal(t);
      setHasMore(t > PAGE_SIZE);
      setOffset(PAGE_SIZE);
      setLoading(false);

      fetchCoverArt(deduped, 0);
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
      const reranked = rerankSongs(mapped, query);
      const startIndex = results.length;

      // Single setResults with deduplication across all pages
      setResults((prev) => {
        const combined = [...prev, ...reranked];
        const seen = new Set<string>();
        return combined.filter((song) => {
          if (seen.has(song.id)) return false;
          seen.add(song.id);
          return true;
        });
      });

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