import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

type TripPoint = {
    _id: string;
    name: string;
    coordinates: { latitude: number; longitude: number };
    type: 'structure' | 'pi'
};

const createIcon = (color: string) => L.divIcon({
    className: '',
    html: `<div style="
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: ${color};
    border: 2px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
});

const icons: Record<string, L.DivIcon> = {
    preview_structure:  createIcon('#f97316'),
    structure:          createIcon('#3b82f6'),
    preview_poi:        createIcon('#b45309'),
    poi:                createIcon('#1d4ed8'),
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

                {/* Selected but not yet added — preview color */}
                {selected && selected.coordinates && !tripIds.has(selected._id) && (
                    <Marker
                        position={[selected.coordinates.latitude, selected.coordinates.longitude]}
                        icon={icons[`preview_${selected.type}` as keyof typeof icons]}
                    />
                )}

                {/* Added trip points — darker color */}
                {tripPoints.map(p => (
                    <Marker
                        key={p._id}
                        position={[p.coordinates.latitude, p.coordinates.longitude]}
                        icon={icons[p.type as keyof typeof icons]}
                    />
                ))}
            </MapContainer>
        </div>
    );
}





