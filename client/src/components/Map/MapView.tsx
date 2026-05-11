import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

type Coordinates = {
  latitude: number;
  longitude: number;
  altitude?: number;
};

type Structure = {
  _id: string;
  name: string;
  coordinates: Coordinates;
  managed: boolean;
  telephone?: string;
  name_owner?: string;
  surname_owner?: string;
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
  structure: createIcon('#f97316'),
  poi:       createIcon('#3b82f6'),
  trail:     createIcon('#22c55e'),
};

export default function MapView({ structures, onSelect }: {
  structures: Structure[],
  onSelect: (s: Structure) => void
}) {
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
        {structures.map((s) => {
          if (!s.coordinates?.latitude || !s.coordinates?.longitude) return null;
          return (
            <Marker
              key={s._id}
              position={[s.coordinates.latitude, s.coordinates.longitude] as [number, number]}
              icon={icons['structure']}
              eventHandlers={{
                click: () => onSelect(s)
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}