import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import {
  addRequest,
  fetchRequests,
  SongRequest,
  upvoteRequest,
} from '../services/requests';

const REQUESTED_KEY = 'waveform:requested_songs';
const UPVOTED_KEY = 'waveform:upvoted_requests';

export function useRequests() {
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [upvotedIds, setUpvotedIds] = useState<Set<number>>(new Set());
  const [requestedSongKeys, setRequestedSongKeys] = useState<Set<string>>(new Set());

  // ── Load persisted device state ──
  const loadDeviceState = useCallback(async () => {
    try {
      const [upvotedRaw, requestedRaw] = await Promise.all([
        AsyncStorage.getItem(UPVOTED_KEY),
        AsyncStorage.getItem(REQUESTED_KEY),
      ]);

      if (upvotedRaw) {
        const ids: number[] = JSON.parse(upvotedRaw);
        setUpvotedIds(new Set(ids));
      }
      if (requestedRaw) {
        const keys: string[] = JSON.parse(requestedRaw);
        setRequestedSongKeys(new Set(keys));
      }
    } catch { }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    await loadDeviceState();
    const data = await fetchRequests();
    setRequests(data);
    setLoading(false);
  }, [loadDeviceState]);

  useEffect(() => {
    load();
  }, []);

  // ── Request a song — blocked if already requested from this device ──
  const request = useCallback(async (song_name: string, artist: string) => {
    const key = `${song_name.toLowerCase().trim()}__${artist.toLowerCase().trim()}`;

    if (requestedSongKeys.has(key)) {
      return { alreadyRequested: true };
    }

    const result = await addRequest(song_name, artist);
    if (result) {
      // Persist to device
      const updated = new Set(requestedSongKeys).add(key);
      setRequestedSongKeys(updated);
      await AsyncStorage.setItem(
        REQUESTED_KEY,
        JSON.stringify(Array.from(updated))
      );

      // Also mark the request id as upvoted so they can't vote on their own
      if (result.request?.id) {
        const updatedVotes = new Set(upvotedIds).add(result.request.id);
        setUpvotedIds(updatedVotes);
        await AsyncStorage.setItem(
          UPVOTED_KEY,
          JSON.stringify(Array.from(updatedVotes))
        );
      }

      await load();
    }
    return { alreadyRequested: false };
  }, [requestedSongKeys, upvotedIds, load]);

  // ── Upvote — blocked if already voted from this device ──
  const upvote = useCallback(async (id: number) => {
    if (upvotedIds.has(id)) return;

    const updated = await upvoteRequest(id);
    if (updated) {
      const updatedSet = new Set(upvotedIds).add(id);
      setUpvotedIds(updatedSet);

      // Persist to device
      await AsyncStorage.setItem(
        UPVOTED_KEY,
        JSON.stringify(Array.from(updatedSet))
      );

      setRequests((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
    }
  }, [upvotedIds]);

  // ── Check if this device already requested a specific song ──
  const hasRequested = useCallback(
    (song_name: string, artist: string): boolean => {
      const key = `${song_name.toLowerCase().trim()}__${artist.toLowerCase().trim()}`;
      return requestedSongKeys.has(key);
    },
    [requestedSongKeys]
  );

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const readyRequests = requests.filter((r) => r.status === 'ready');

  return {
    requests,
    pendingRequests,
    readyRequests,
    loading,
    request,
    upvote,
    upvotedIds,
    requestedSongKeys,
    hasRequested,
    refresh: load,
  };
}