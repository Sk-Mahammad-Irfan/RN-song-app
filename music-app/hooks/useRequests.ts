import { useCallback, useEffect, useState } from 'react';
import {
  addRequest,
  fetchRequests,
  SongRequest,
  upvoteRequest,
} from '../services/requests';

export function useRequests() {
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [upvotedIds, setUpvotedIds] = useState<Set<number>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchRequests();
    setRequests(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, []);

  const request = useCallback(async (song_name: string, artist: string) => {
    const result = await addRequest(song_name, artist);
    if (result) {
      await load(); // refresh list
    }
    return result;
  }, [load]);

  const upvote = useCallback(async (id: number) => {
    if (upvotedIds.has(id)) return; // prevent double upvote
    const updated = await upvoteRequest(id);
    if (updated) {
      setUpvotedIds((prev) => new Set(prev).add(id));
      setRequests((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
    }
  }, [upvotedIds]);

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
    refresh: load,
  };
}