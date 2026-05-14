import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import { useState } from 'react';
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

type Trail = {
  _id: string;
  name: string;
  difficulty?: string;
  distance_km?: number;
  geometry: {
    type: string;
    coordinates: [number, number][]; // [lng, lat]
  };
}

function TrailsLayer({ onSelectTrail, selectedTrail } : {
  onSelectTrail: (t: Trail) => void;
  selectedTrail: Trail | null;
}) {
  const [trails, setTrails] = useState<Trail[]>([]);
  const [zoom, setZoom] = useState(10);

  useMapEvents({
    moveend: async(e) => {
      if (selectedTrail) return;
      const map = e.target;
      const currentZoom = map.getZoom();
      setZoom(currentZoom);

      if (currentZoom < 10) {   // Below this: nothing shown
        setTrails([]); // clear trails when zoomed out
        return;
      }

      const center = map.getCenter();
      const radius = map.getCenter().distanceTo(map.getBounds().getNorthEast()) / 1000;

      const res = await fetch(`/api/trails?lat=${center.lat}&lng=${center.lng}&radius=${radius}`);
      const data = await res.json();
      setTrails(data.trails);
    }
  });

  const visibleTrails = selectedTrail ? [selectedTrail] : trails;

  return (
      <>
      {visibleTrails.map((trail) => {
        if (zoom < 13) {    // Below this: dots, above this: lines
          // Show dot at trail midpoint
          const midIndex = Math.floor(trail.geometry.coordinates.length / 2);
          const [lng, lat] = trail.geometry.coordinates[midIndex];
          return (
              <Marker
                  key={trail._id}
                  position={[lat, lng]}
                  icon={icons['trail']}
                  eventHandlers={{
                    click: () => onSelectTrail(trail)
                  }}
              />
          );
        }

        const positions = trail.geometry.coordinates.map(
            ([lng, lat]) => [lat, lng] as [number, number]
        );
        return (
            <Polyline
                key={trail._id}
                positions={positions}
                pathOptions={{ color: '#22c55e', weight: 3 }}
                eventHandlers={{ click: () => onSelectTrail(trail) }}
            />
        );
      })}
      </>
  );
}

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

const createSmallIcon = (color: string) => L.divIcon({
  className: '',
  html: `<div style="
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${color};
    border: 1px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const icons: Record<string, L.DivIcon> = {
  structure: createIcon('#f97316'),
  poi:       createIcon('#3b82f6'),
  trail:     createSmallIcon('#22c55e'),
};

export default function MapView({ structures, onSelectStructure, onSelectTrail, selectedTrail }: {
  structures: Structure[],
  onSelectStructure: (s: Structure) => void,
  onSelectTrail: (t: Trail) => void,
  selectedTrail: Trail | null
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
                click: () => onSelectStructure(s)
              }}
            />
          );
        })}
        <TrailsLayer onSelectTrail={onSelectTrail} selectedTrail={selectedTrail} />
      </MapContainer>
    </div>
  );
}
