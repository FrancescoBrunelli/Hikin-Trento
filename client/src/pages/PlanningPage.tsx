import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Layout from '../components/Layout.tsx';
import {
    calculateRoute,
    savePlan,
    formatDistance,
    formatDuration,
    type RouteResult
} from '../services/planningService';
import '../styles/planningPage.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const startIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const endIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

interface MapClickHandlerProps {
    onMapClick: (latlng: L.LatLng) => void;
    enabled: boolean;
}

function MapClickHandler({ onMapClick, enabled }: MapClickHandlerProps) {
    useMapEvents({
        click: (e) => { if (enabled) onMapClick(e.latlng); }
    });
    return null;
}

function decodePolyline(encoded: string): [number, number][] {
    const points: [number, number][] = [];
    let index = 0, lat = 0, lng = 0;
    while (index < encoded.length) {
        let shift = 0, result = 0, byte;
        do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
        lat += result & 1 ? ~(result >> 1) : result >> 1;
        shift = 0; result = 0;
        do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
        lng += result & 1 ? ~(result >> 1) : result >> 1;
        points.push([lat / 1e5, lng / 1e5]);
    }
    return points;
}

function getRouteCoords(geometry: RouteResult['geometry']): [number, number][] {
    if (!geometry) return [];
    if (typeof geometry === 'string') return decodePolyline(geometry);
    if (geometry.coordinates) return geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    return [];
}

function getMapTip(start: [number, number, number] | null, end: [number, number, number] | null): string {
    if (!start) return '🟠 Click on the map to set start point';
    if (!end)   return '🟢 Click on the map to set end point';
    return '✓ Start and end set — calculate your route';
}

export default function PlanningPage() {
    const navigate = useNavigate();
    const [start, setStart] = useState<[number, number, number] | null>(null);
    const [end,   setEnd]   = useState<[number, number, number] | null>(null);
    const [route, setRoute] = useState<RouteResult | null>(null);
    const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState<string | null>(null);
    const [planName, setPlanName]     = useState('');
    const [saving, setSaving]         = useState(false);
    const [saved, setSaved]           = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const isAuthenticated = !!localStorage.getItem('token');

    const handleMapClick = useCallback((latlng: L.LatLng) => {
        const coord: [number, number, number] = [latlng.lng, latlng.lat, 0];
        if (!start) {
            setStart(coord);
        } else if (!end) {
            setEnd(coord);
        }
    }, [start, end]);

    const handleCalculate = async () => {
        if (!start || !end) return;
        setLoading(true);
        setError(null);
        setRoute(null);
        setPreviewOpen(false);
        setSaved(false);
        try {
            const result = await calculateRoute(start, end);
            setRoute(result);
            setRouteCoords(getRouteCoords(result.geometry));
            setPreviewOpen(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!route || !start || !end || !planName.trim()) return;
        setSaving(true);
        try {
            await savePlan({ name: planName.trim(), start, end, route });
            setSaved(true);
            setPlanName('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleClearStart = () => { setStart(null); setRoute(null); setPreviewOpen(false); setSaved(false); };
    const handleClearEnd   = () => { setEnd(null);   setRoute(null); setPreviewOpen(false); setSaved(false); };

    const canCalculate = !!start && !!end && !loading;
    const mapClickEnabled = !start || !end;

    return (
        <Layout
            navChildren={
                <button className="planning-back-btn" onClick={() => navigate('/')}>
                    ← Back to map
                </button>
            }
        >
            <div className="planning-page">

                {/* LEFT PANEL */}
                <aside className="planning-panel">
                    <div className="planning-panel-header">
                        <h2>Plan a Route</h2>
                        <p>Click the map to place start and end points</p>
                    </div>

                    <div className="planning-panel-body">

                        <div className="planning-input-group">
                            <span className="planning-input-label">
                                <span className="planning-input-label-dot start" />
                                Start point
                            </span>
                            {start ? (
                                <div className="planning-coord-display has-value">
                                    <span className="planning-coord-value">
                                        {start[1].toFixed(4)}°, {start[0].toFixed(4)}°
                                    </span>
                                    <button className="planning-coord-clear" onClick={handleClearStart} title="Clear">✕</button>
                                </div>
                            ) : (
                                <div className="planning-coord-display">
                                    <span className="planning-coord-placeholder">Not set</span>
                                </div>
                            )}
                        </div>

                        <div className="planning-input-group">
                            <span className="planning-input-label">
                                <span className="planning-input-label-dot end" />
                                End point
                            </span>
                            {end ? (
                                <div className="planning-coord-display has-value">
                                    <span className="planning-coord-value">
                                        {end[1].toFixed(4)}°, {end[0].toFixed(4)}°
                                    </span>
                                    <button className="planning-coord-clear" onClick={handleClearEnd} title="Clear">✕</button>
                                </div>
                            ) : (
                                <div className="planning-coord-display">
                                    <span className="planning-coord-placeholder">Not set</span>
                                </div>
                            )}
                        </div>

                        {(!start || !end) && (
                            <div className="planning-hint">
                                <span>{getMapTip(start, end)}</span>
                            </div>
                        )}

                        {error && (
                            <div className="planning-error">{error}</div>
                        )}

                        <button
                            className={`planning-calculate-btn ${loading ? 'loading' : ''}`}
                            onClick={handleCalculate}
                            disabled={!canCalculate}
                        >
                            {loading ? (
                                <><div className="spinner" /> Calculating…</>
                            ) : (
                                <>⛰ Calculate Route</>
                            )}
                        </button>

                        {route && (
                            <div style={{ marginTop: 8 }}>
                                <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--hint)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                                    Route summary
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {[
                                        { label: 'Distance', value: formatDistance(route.distance) },
                                        { label: 'Duration', value: formatDuration(route.duration) },
                                        { label: 'Ascent',   value: `+${Math.round(route.ascent ?? 0)} m` },
                                        { label: 'Descent',  value: `-${Math.round(route.descent ?? 0)} m` },
                                    ].map(({ label, value }) => (
                                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                            <span style={{ color: 'var(--hint)' }}>{label}</span>
                                            <span style={{ fontWeight: 700, color: 'var(--text)' }}>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* MAP */}
                <div className="planning-map-wrapper">
                    <div className="planning-map-tip">
                        {getMapTip(start, end)}
                    </div>

                    <MapContainer
                        center={[46.07, 11.12]}
                        zoom={11}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />

                        <MapClickHandler onMapClick={handleMapClick} enabled={mapClickEnabled} />

                        {start && (
                            <Marker
                                position={[start[1], start[0]]}
                                icon={startIcon}
                                draggable
                                eventHandlers={{
                                    dragend: (e) => {
                                        const ll = e.target.getLatLng();
                                        setStart([ll.lng, ll.lat, 0]);
                                        setRoute(null);
                                        setPreviewOpen(false);
                                    }
                                }}
                            />
                        )}

                        {end && (
                            <Marker
                                position={[end[1], end[0]]}
                                icon={endIcon}
                                draggable
                                eventHandlers={{
                                    dragend: (e) => {
                                        const ll = e.target.getLatLng();
                                        setEnd([ll.lng, ll.lat, 0]);
                                        setRoute(null);
                                        setPreviewOpen(false);
                                    }
                                }}
                            />
                        )}

                        {routeCoords.length > 0 && (
                            <Polyline
                                positions={routeCoords}
                                color="rgb(254, 116, 25)"
                                weight={4}
                                opacity={0.85}
                            />
                        )}
                    </MapContainer>

                    {/* ROUTE PREVIEW BOTTOM SHEET */}
                    <div className={`route-preview ${previewOpen ? 'visible' : ''}`}>
                        <div className="route-preview-handle" onClick={() => setPreviewOpen(o => !o)}>
                            <div className="route-preview-handle-bar" />
                        </div>

                        {route && (
                            <div className="route-preview-inner">
                                <p className="route-preview-title">Route Preview</p>

                                <div className="route-stats">
                                    <div className="route-stat-card">
                                        <span className="route-stat-icon">📏</span>
                                        <span className="route-stat-value">{formatDistance(route.distance)}</span>
                                        <span className="route-stat-label">Distance</span>
                                    </div>
                                    <div className="route-stat-card">
                                        <span className="route-stat-icon">⏱</span>
                                        <span className="route-stat-value">{formatDuration(route.duration)}</span>
                                        <span className="route-stat-label">Duration</span>
                                    </div>
                                    <div className="route-stat-card">
                                        <span className="route-stat-icon">⬆️</span>
                                        <span className="route-stat-value">+{Math.round(route.ascent ?? 0)} m</span>
                                        <span className="route-stat-label">Ascent</span>
                                    </div>
                                    <div className="route-stat-card">
                                        <span className="route-stat-icon">⬇️</span>
                                        <span className="route-stat-value">-{Math.round(route.descent ?? 0)} m</span>
                                        <span className="route-stat-label">Descent</span>
                                    </div>
                                </div>

                                {isAuthenticated && !saved && (
                                    <div className="route-save-form">
                                        <input
                                            className="route-save-input"
                                            type="text"
                                            placeholder="Give your route a name…"
                                            value={planName}
                                            onChange={e => setPlanName(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleSave()}
                                        />
                                        <button
                                            className="route-save-btn"
                                            onClick={handleSave}
                                            disabled={saving || !planName.trim()}
                                        >
                                            {saving ? <div className="spinner" /> : '💾 Save'}
                                        </button>
                                    </div>
                                )}

                                {saved && (
                                    <div className="route-save-success">
                                        ✓ Route saved successfully!
                                    </div>
                                )}

                                {!isAuthenticated && (
                                    <p style={{ margin: 0, fontSize: 13, color: 'var(--hint)' }}>
                                        <a href="/signin" style={{ color: 'var(--primary)' }}>Sign in</a> to save this route.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}