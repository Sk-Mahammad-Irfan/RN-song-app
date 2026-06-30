import { useEffect, useState } from 'react';
import { searchSongs } from '../services/musicBrainz';
import { Song } from '../store/playerStore';

export type RecoSection = {
    id: string;
    title: string;
    reason: string;
    songs: Song[];
};

function genreToColor(genres: string[], fallback: { color: string; bg: string }) {
    const g = genres.join(' ').toLowerCase();
    if (g.includes('electronic') || g.includes('dance')) return { color: '#d85a30', bg: '#1e1010' };
    if (g.includes('jazz') || g.includes('soul')) return { color: '#888780', bg: '#101018' };
    if (g.includes('pop') || g.includes('indie')) return { color: '#1d9e75', bg: '#0e1f1a' };
    if (g.includes('classical') || g.includes('ambient')) return { color: '#5a4be8', bg: '#13102a' };
    if (g.includes('hip') || g.includes('rap')) return { color: '#d4537e', bg: '#1e1020' };
    return fallback;
}

function mapSongs(songs: any[], prefix: string, excludeId?: string): Song[] {
    return songs
        .filter((s) => s.title && s.artist && s.id !== excludeId)
        .slice(0, 8)
        .map((s, i) => ({
            id: `reco-${prefix}-${i}-${s.id}`,
            title: s.title,
            artist: s.artist,
            duration: s.duration,
            album: s.album,
            releaseId: s.releaseId,
            ...genreToColor(s.genres ?? [], { color: '#5a4be8', bg: '#13102a' }),
        }));
}

export function useSongRecommendations(currentSong: Song | null) {
    const [sections, setSections] = useState<RecoSection[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!currentSong?.id || !currentSong.title) {
            setSections([]);
            return;
        }

        let cancelled = false;

        async function build() {
            setLoading(true);
            const built: RecoSection[] = [];

            // ── 1. More from this artist ──
            try {
                const { songs } = await searchSongs(currentSong!.artist, 10, 0);
                const mapped = mapSongs(songs, 'artist', currentSong!.id);
                if (mapped.length > 0) {
                    built.push({
                        id: 'artist',
                        title: `More ${currentSong!.artist}`,
                        reason: `Because you're playing ${currentSong!.title}`,
                        songs: mapped,
                    });
                }
            } catch { }

            if (cancelled) return;

            // ── 2. From the same album ──
            if (currentSong!.album) {
                try {
                    const { songs } = await searchSongs(
                        `${currentSong!.album} ${currentSong!.artist}`,
                        10,
                        0
                    );
                    const mapped = mapSongs(songs, 'album', currentSong!.id);
                    if (mapped.length > 0) {
                        built.push({
                            id: 'album',
                            title: `From "${currentSong!.album}"`,
                            reason: `Same album as ${currentSong!.title}`,
                            songs: mapped,
                        });
                    }
                } catch { }
            }

            if (cancelled) return;

            // ── 3. Similar genre / mood ──
            try {
                const { color } = genreToColor([], { color: '', bg: '' });
                const moodQuery = currentSong!.color === '#5a4be8'
                    ? 'ambient indie similar'
                    : currentSong!.color === '#d85a30'
                        ? 'electronic high energy similar'
                        : currentSong!.color === '#1d9e75'
                            ? 'acoustic chill similar'
                            : 'similar songs';

                const { songs } = await searchSongs(
                    `${currentSong!.title} similar`,
                    10,
                    0
                );
                const mapped = mapSongs(songs, 'similar', currentSong!.id);
                if (mapped.length > 0) {
                    built.push({
                        id: 'similar',
                        title: 'You might also like',
                        reason: `Similar to ${currentSong!.title}`,
                        songs: mapped,
                    });
                }
            } catch { }

            if (!cancelled) {
                setSections(built);
                setLoading(false);
            }
        }

        build();
        return () => { cancelled = true; };
    }, [currentSong?.id]);

    return { sections, loading };
}