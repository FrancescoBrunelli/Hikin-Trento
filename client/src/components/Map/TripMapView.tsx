import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

type TripPoint = {
    _id: string;
    name: string;
    coordinates: { latitude: number; longitude: number };
    type: 'structure' | 'pi'
};

const createNumberedIcon = (color: string, number: number) => L.divIcon({
    className: '',
    html: `<div style="
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: ${color};
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 13px;
        font-family: sans-serif;
    ">${number}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
});

const createPreviewIcon = (color: string) => L.divIcon({
    className: '',
    html: `<div style="
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: ${color};
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        opacity: 0.6;
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
});

const previewIcons: Record<string, L.DivIcon> = {
    structure: createPreviewIcon('#f97316'),
    pi:        createPreviewIcon('#3b82f6'),
};

const tripColors: Record<string, string> = {
    structure: '#ea580c',
    pi:        '#ea580c',
};

export default function TripMapView({ selected, tripPoints }: {
    selected: any;
    tripPoints: TripPoint[];
}) {
    const tripIds = new Set(tripPoints.map(p => p._id));

    return (
        <div>
            <MapContainer
                center={[46.07, 11.12] as [number, number]}
                zoom={10}
                style={{ height: 'calc(100vh - 69px)', width: 'calc(100vw - 520px)' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="© OpenStreetMap contributors"
                />

                {/* Selected but not yet added — small faded preview */}
                {selected && selected.coordinates && !tripIds.has(selected._id) && (
                    <Marker
                        position={[selected.coordinates.latitude, selected.coordinates.longitude]}
                        icon={previewIcons[selected.type]}
                    />
                )}

                {/* Trip points — numbered */}
                {tripPoints.map((p, i) => (
                    <Marker
                        key={p._id}
                        position={[p.coordinates.latitude, p.coordinates.longitude]}
                        icon={createNumberedIcon(tripColors[p.type], i + 1)}
                    />
                ))}
            </MapContainer>
        </div>
    );
}





