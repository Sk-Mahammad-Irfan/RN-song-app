// services/musicBrainz.ts
// Free API — no key needed — 1 req/sec limit
// Docs: https://musicbrainz.org/doc/MusicBrainz_API

const MB_BASE = 'https://musicbrainz.org/ws/2';
const CAA_BASE = 'https://coverartarchive.org';

// Always set this header — MusicBrainz requires it
const MB_HEADERS = {
  'User-Agent': 'WaveformApp/1.0 (waveformapp@gmail.com)',
  Accept: 'application/json',
};

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type MBSong = {
  id: string;           // MusicBrainz recording ID
  title: string;
  artist: string;
  duration: string;     // formatted mm:ss
  releaseId: string;    // for fetching cover art
  album: string;
  year: string;
  genres: string[];
};

export type MBSearchResult = {
  songs: MBSong[];
  total: number;
};

// ─────────────────────────────────────────────
// Helper — format ms duration to mm:ss
// ─────────────────────────────────────────────

function formatDuration(ms: number | null): string {
  if (!ms) return '0:00';
  const totalSec = Math.floor(ms / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ─────────────────────────────────────────────
// Rate limiter — 1 request per second max
// ─────────────────────────────────────────────

let lastRequestTime = 0;

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < 1100) {
    await new Promise((r) => setTimeout(r, 1100 - timeSinceLast));
  }
  lastRequestTime = Date.now();
  return fetch(url, { headers: MB_HEADERS });
}

// ─────────────────────────────────────────────
// Search songs by query string
// ─────────────────────────────────────────────

export async function searchSongs(query: string, limit = 10): Promise<MBSearchResult> {
  try {
    const encoded = encodeURIComponent(query);
    const url = `${MB_BASE}/recording/?query=${encoded}&limit=${limit}&fmt=json`;
    const res = await rateLimitedFetch(url);

    if (!res.ok) throw new Error(`MusicBrainz error: ${res.status}`);

    const data = await res.json();
    const recordings = data.recordings ?? [];

    const songs: MBSong[] = recordings.map((r: any) => {
      const artist = r['artist-credit']?.[0]?.artist?.name ?? 'Unknown Artist';
      const release = r.releases?.[0];
      const releaseId = release?.id ?? '';
      const album = release?.title ?? '';
      const year = release?.date?.slice(0, 4) ?? '';
      const genres: string[] = r.genres?.map((g: any) => g.name) ?? [];

      return {
        id: r.id,
        title: r.title,
        artist,
        duration: formatDuration(r.length),
        releaseId,
        album,
        year,
        genres,
      };
    });

    return { songs, total: data.count ?? 0 };
  } catch (err) {
    console.error('[MusicBrainz] searchSongs error:', err);
    return { songs: [], total: 0 };
  }
}

// ─────────────────────────────────────────────
// Get cover art URL for a release ID
// ─────────────────────────────────────────────

export async function getCoverArt(releaseId: string): Promise<string | null> {
  if (!releaseId) return null;

  try {
    const url = `${CAA_BASE}/release/${releaseId}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': MB_HEADERS['User-Agent'] },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const front = data.images?.find((img: any) => img.front) ?? data.images?.[0];
    return front?.thumbnails?.large ?? front?.image ?? null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// Get full recording detail by ID
// ─────────────────────────────────────────────

export async function getRecordingById(id: string): Promise<MBSong | null> {
  try {
    const url = `${MB_BASE}/recording/${id}?inc=artists+releases+genres&fmt=json`;
    const res = await rateLimitedFetch(url);
    if (!res.ok) return null;

    const r = await res.json();
    const artist = r['artist-credit']?.[0]?.artist?.name ?? 'Unknown Artist';
    const release = r.releases?.[0];

    return {
      id: r.id,
      title: r.title,
      artist,
      duration: formatDuration(r.length),
      releaseId: release?.id ?? '',
      album: release?.title ?? '',
      year: release?.date?.slice(0, 4) ?? '',
      genres: r.genres?.map((g: any) => g.name) ?? [],
    };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// Search artists
// ─────────────────────────────────────────────

export async function searchArtist(name: string) {
  try {
    const url = `${MB_BASE}/artist/?query=${encodeURIComponent(name)}&limit=5&fmt=json`;
    const res = await rateLimitedFetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    return (data.artists ?? []).map((a: any) => ({
      id: a.id,
      name: a.name,
      country: a.country ?? '',
      genres: a.genres?.map((g: any) => g.name) ?? [],
    }));
  } catch {
    return [];
  }
}