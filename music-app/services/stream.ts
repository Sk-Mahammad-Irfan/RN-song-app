const BACKEND_URL = 'http://10.140.152.20:3000';

export async function getStreamUrl(
    title: string,
    artist: string
): Promise<string> {
    const params = new URLSearchParams({ title, artist });
    const res = await fetch(`${BACKEND_URL}/stream-url?${params}`);

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || `Server error ${res.status}`);
    }

    const data = await res.json();
    if (!data.streamUrl) throw new Error('No stream URL returned');
    return data.streamUrl;
}

export async function checkBackend(): Promise<boolean> {
    try {
        const res = await fetch(`${BACKEND_URL}/`);
        return res.ok;
    } catch {
        return false;
    }
}