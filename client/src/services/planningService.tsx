const API_BASE = 'http://localhost:3000/api/planning';

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export interface Coordinates {
    lng: number;
    lat: number;
    alt?: number;
}

export interface RouteResult {
    distance: number;
    duration: number;
    ascent: number;
    descent: number;
    geometry: {
        type: 'LineString';
        coordinates: [number, number][];
    };
    segments: any[];
}

export const calculateRoute = async (
    start: [number, number, number],
    end: [number, number, number],
    waypoints: [number, number, number][] = []
): Promise<RouteResult> => {
    const res = await fetch(`${API_BASE}/route`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ start, end, waypoints })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Route calculation failed');
    return data.route;
};

export const savePlan = async (payload: {
    name: string;
    description?: string;
    start: [number, number, number];
    end: [number, number, number];
    waypoints?: [number, number, number][];
    route: RouteResult;
    multiDay?: boolean;
    days?: number;
}) => {
    const res = await fetch(`${API_BASE}/save`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save plan');
    return data;
};

export const getUserPlans = async () => {
    const res = await fetch(`${API_BASE}/`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch plans');
    return data.plans;
};

export const deletePlan = async (id: string) => {
    const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete plan');
    return data;
};

export const saveFavorite = async (id: string) => {
    const res = await fetch(`${API_BASE}/${id}/favorite`, {
        method: 'POST',
        headers: authHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save favorite');
    return data;
};

export const removeFavorite = async (id: string) => {
    const res = await fetch(`${API_BASE}/${id}/favorite`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to remove favorite');
    return data;
};

export const getFavorites = async () => {
    const res = await fetch(`${API_BASE}/favorites/me`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch favorites');
    return data.plans;
};

export const formatDistance = (meters: number): string => {
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    return `${Math.round(meters)} m`;
};

export const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
};