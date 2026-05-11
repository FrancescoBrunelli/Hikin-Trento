import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapView() {
  return (
    <div>
      <MapContainer
        center={[46.07, 11.12] as [number, number]}
        zoom={10}
        style={{ height: 'calc(100vh - 69px)', width: 'calc(100vw - 520px)'  }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
      </MapContainer>
    </div>
  );
}