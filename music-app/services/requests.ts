const BACKEND_URL = 'http://10.140.152.20:3000';

export type SongRequest = {
    id: number;
    song_name: string;
    artist: string;
    status: 'pending' | 'ready';
    count: number;
    eta_days: number;
    created_at: string;
    updated_at: string;
};

// Fetch all requests
export async function fetchRequests(): Promise<SongRequest[]> {
    try {
        const res = await fetch(`${BACKEND_URL}/requests`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        return data.requests ?? [];
    } catch (err) {
        console.error('[Requests] fetchRequests error:', err);
        return [];
    }
}

// Add new request or upvote if exists
export async function addRequest(
    song_name: string,
    artist: string
): Promise<{ request: SongRequest; upvoted: boolean } | null> {
    try {
        const res = await fetch(`${BACKEND_URL}/requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ song_name, artist }),
        });
        if (!res.ok) throw new Error('Failed to add request');
        return await res.json();
    } catch (err) {
        console.error('[Requests] addRequest error:', err);
        return null;
    }
}

// Upvote a request
export async function upvoteRequest(id: number): Promise<SongRequest | null> {
    try {
        const res = await fetch(`${BACKEND_URL}/requests/${id}/upvote`, {
            method: 'POST',
        });
        if (!res.ok) throw new Error('Failed to upvote');
        const data = await res.json();
        return data.request;
    } catch (err) {
        console.error('[Requests] upvoteRequest error:', err);
        return null;
    }
}