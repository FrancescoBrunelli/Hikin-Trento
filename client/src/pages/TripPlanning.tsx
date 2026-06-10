import Layout from "../components/Layout.tsx";
import TripMapView from "../components/Map/TripMapView.tsx";
import SearchPanel from "../components/SearchPanel";
import DetailPanel from "../components/DetailPanel";
import TripPanel from "../components/TripPanel";
import { useSearch } from "../hooks/useSearch";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/TripPlanning.css"

type TripPoint = {
    _id: string;
    name: string;
    coordinates: { latitude: number; longitude: number; altitude?: number };
    type: 'structure' | 'pi';
}

type RouteResult = {
    distance: number;
    duration: number;
    ascent: number;
    descent: number;
    geometry: any;
    segments: any[];
}

const API = 'http://localhost:3000';
const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

const formatDistance = (m: number) => m >= 1000 ? `${(m/1000).toFixed(1)} km` : `${Math.round(m)} m`;
const formatDuration = (s: number) => { const h = Math.floor(s/3600); const m = Math.floor((s%3600)/60); return h > 0 ? `${h}h ${m}m` : `${m}m`; };

function TripPlanning() {
    const { query, setQuery, results, handleSearch, mode, setMode, structureFilters, setStructureFilters, piFilters, setPIFilters, trailFilters, setTrailFilters } = useSearch(['structures', 'pis']);
    const [selected, setSelected] = useState<any>(null);
    const [tripPoints, setTripPoints] = useState<TripPoint[]>([]);
    const navigate = useNavigate();
    const [tripName, setTripName] = useState('');
    const [roundtrip, setRoundtrip] = useState(false);

    // Route preview state
    const [route, setRoute] = useState<RouteResult | null>(null);
    const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [calcError, setCalcError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const addToTrip = (point: any) => {
        if (tripPoints.find(p => p._id === point._id)) return;
        setTripPoints(prev => [...prev, {
            _id: point._id,
            name: point.name,
            coordinates: point.coordinates,
            type: point.type
        }]);
        setSelected(null);
        setRoute(null);
        setPreviewOpen(false);
        setSaved(false);
    };

    const removeFromTrip = (id: string) => {
        setTripPoints(prev => prev.filter(p => p._id !== id));
        setRoute(null);
        setPreviewOpen(false);
        setSaved(false);
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        setTripPoints(prev => {
            const updated = [...prev];
            [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
            return updated;
        });
        setRoute(null);
        setPreviewOpen(false);
    };

    const moveDown = (index: number) => {
        if (index === tripPoints.length - 1) return;
        setTripPoints(prev => {
            const updated = [...prev];
            [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
            return updated;
        });
        setRoute(null);
        setPreviewOpen(false);
    };

    const isInTrip = (id: string) => tripPoints.some(p => p._id === id);

    // Decode ORS encoded polyline
const decodePolyline = (encoded: string, has3d: boolean = true): [number, number][] => {
    const points: [number, number][] = [];
    let index = 0, lat = 0, lng = 0;
    while (index < encoded.length) {
        let shift = 0, result = 0, byte;
        do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
        lat += result & 1 ? ~(result >> 1) : result >> 1;
        shift = 0; result = 0;
        do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
        lng += result & 1 ? ~(result >> 1) : result >> 1;
        if (has3d) {
            shift = 0; result = 0;
            do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
        }
        points.push([lat / 1e5, lng / 1e5]);
    }
    return points;
};

    const getRouteCoords = (geometry: any): [number, number][] => {
        if (!geometry) return [];
        if (typeof geometry === 'string') return decodePolyline(geometry);
        if (geometry.coordinates) return geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
        return [];
    };

    const handleConfirm = async () => {
        if (tripPoints.length < 2) return;
        setCalculating(true);
        setCalcError(null);
        setPreviewOpen(false);
        setSaved(false);

        try {
            // Build points array, add start again at end if roundtrip
            const points = roundtrip
                ? [...tripPoints, tripPoints[0]]
                : tripPoints;

            const start: [number, number] = [points[0].coordinates.longitude, points[0].coordinates.latitude];
            const end: [number, number] = [points[points.length - 1].coordinates.longitude, points[points.length - 1].coordinates.latitude];
            console.log('sending start:', start);
            console.log('sending end:', end);
            const waypoints = points.slice(1, -1).map(p => [p.coordinates.longitude, p.coordinates.latitude]);

            const res = await fetch(`${API}/api/planning/route`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ start, end, waypoints })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Route calculation failed');
            const coords = getRouteCoords(data.route.geometry);
            console.log('geometry type:', typeof data.route.geometry);
            console.log('first decoded coord:', coords[0]);
            console.log('last decoded coord:', coords[coords.length - 1]);
            console.log('total coords:', coords.length);
            setRoute(data.route);
            setRouteCoords(coords);
            setPreviewOpen(true);
        } catch (err: any) {
            setCalcError(err.message);
        } finally {
            setCalculating(false);
        }
    };

    const handleSave = async () => {
        if (!route || tripPoints.length < 2 || !tripName.trim()) return;
        setSaving(true);

        try {
            const points = roundtrip ? [...tripPoints, tripPoints[0]] : tripPoints;
            const start: [number, number] = [points[0].coordinates.longitude, points[0].coordinates.latitude];
            const end: [number, number] = [points[points.length - 1].coordinates.longitude, points[points.length - 1].coordinates.latitude];

            const waypoints = points.slice(1, -1).map(p => [p.coordinates.longitude, p.coordinates.latitude]);

            const res = await fetch(`${API}/api/planning/save`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ name: tripName.trim(), start, end, waypoints, route, multiDay: false, days: 1 })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save plan');

            setSaved(true);
            setTimeout(() => navigate(`/user/trip/${data.plan.id}`), 1200);
        } catch (err: any) {
            setCalcError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const isAuthenticated = !!localStorage.getItem('token');

    return (
        <Layout>
            <div className="home-container">
                <SearchPanel
                    query={query}
                    setQuery={setQuery}
                    results={results}
                    onSearch={handleSearch}
                    onSelect={(r) => setSelected(r)}
                    selected={selected}
                    mode={mode}
                    setMode={setMode}
                    trailFilters={trailFilters}
                    setTrailFilters={setTrailFilters}
                    piFilters={piFilters}
                    setPIFilters={setPIFilters}
                    structureFilters={structureFilters}
                    setStructureFilters={setStructureFilters}
                    hideModes={['trails']}
                />
                <div className="home-map" style={{ position: 'relative' }}>
                    <TripMapView
                        selected={selected}
                        tripPoints={tripPoints}
                        routeCoords={routeCoords}
                    />

                    {/* ROUTE PREVIEW BOTTOM SHEET */}
                    <div className={`trip-route-preview ${previewOpen ? 'visible' : ''}`}>
                        <div className="trip-route-preview-handle" onClick={() => setPreviewOpen(o => !o)}>
                            <div className="trip-route-preview-handle-bar" />
                        </div>
                        {route && (
                            <div className="trip-route-preview-inner">
                                <p className="trip-route-preview-title">Route Preview</p>
                                <div className="trip-route-stats">
                                    <div className="trip-route-stat-card">
                                        <span className="trip-route-stat-icon">📏</span>
                                        <span className="trip-route-stat-value">{formatDistance(route.distance)}</span>
                                        <span className="trip-route-stat-label">Distance</span>
                                    </div>
                                    <div className="trip-route-stat-card">
                                        <span className="trip-route-stat-icon">⏱</span>
                                        <span className="trip-route-stat-value">{formatDuration(route.duration)}</span>
                                        <span className="trip-route-stat-label">Duration</span>
                                    </div>
                                    <div className="trip-route-stat-card">
                                        <span className="trip-route-stat-icon">⬆️</span>
                                        <span className="trip-route-stat-value">+{Math.round(route.ascent ?? 0)}m</span>
                                        <span className="trip-route-stat-label">Ascent</span>
                                    </div>
                                    <div className="trip-route-stat-card">
                                        <span className="trip-route-stat-icon">⬇️</span>
                                        <span className="trip-route-stat-value">-{Math.round(route.descent ?? 0)}m</span>
                                        <span className="trip-route-stat-label">Descent</span>
                                    </div>
                                </div>
                                {isAuthenticated && !saved && (
                                    <button
                                        className="trip-save-btn"
                                        onClick={handleSave}
                                        disabled={saving || !tripName.trim()}
                                    >
                                        {saving ? '...' : 'Save Trip'}
                                    </button>
                                )}
                                {saved && (
                                    <div className="trip-save-success">✓ Trip saved! Redirecting…</div>
                                )}
                                {!isAuthenticated && (
                                    <p style={{ margin: 0, fontSize: 13, color: 'var(--hint)' }}>
                                        <a href="/signin" style={{ color: 'var(--primary)' }}>Sign in</a> to save this trip.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {selected ? (
                    <DetailPanel
                        selected={selected}
                        onClose={() => setSelected(null)}
                        onAddToTrip={addToTrip}
                        isInTrip={isInTrip}
                        isAuthenticated={isAuthenticated}
                        favourites={[]}
                        onToggleFavourite={() => {}}
                    />
                ) : (
                    <TripPanel
                        tripPoints={tripPoints}
                        onRemove={removeFromTrip}
                        onMoveUp={moveUp}
                        onMoveDown={moveDown}
                        roundtrip={roundtrip}
                        setRoundtrip={setRoundtrip}
                        onConfirm={handleConfirm}
                        tripName={tripName}
                        setTripName={setTripName}
                        calculating={calculating}
                        calcError={calcError}
                    />
                )}
            </div>
        </Layout>
    );
}

export default TripPlanning;