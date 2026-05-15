import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet';
import {useEffect, useRef, useState} from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster'

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
  const [hoveredTrailId, setHoveredTrailId] = useState<string | null>(null);
  const selectedTrailRef = useRef(selectedTrail);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const map = useMap();

  useEffect(() => {
    const currentZoom = map.getZoom();
    setZoom(currentZoom);

    if (currentZoom < 10) return

    const center = map.getCenter();
    const radius = map.getCenter().distanceTo(map.getBounds().getNorthEast()) / 1000;
    fetch(`/api/trails?lat=${center.lat}&lng=${center.lng}&radius=${radius}`)
      .then((res) => res.json())
      .then((data) => setTrails(data.trails));
  }, []);   // Trail visual initialization when page is loaded

  useEffect(() => {
    selectedTrailRef.current = selectedTrail;
  }, [selectedTrail])

  useMapEvents({
    moveend: async(e) => {
      if (selectedTrailRef.current) return;
      const map = e.target;
      const currentZoom = map.getZoom();
      setZoom(currentZoom);

      if (currentZoom < 10) {   // Below this: nothing shown
        setTrails([]); // clear trails when zoomed out
        return;
      }

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const center = map.getCenter();
        const radius = map.getCenter().distanceTo(map.getBounds().getNorthEast()) / 1000;
        const res = await fetch(`/api/trails?lat=${center.lat}&lng=${center.lng}&radius=${radius}`);
        const data = await res.json();
        setTrails(data.trails);
      }, 300)   // Waits 300ms after user's map last movement before fetching trails
    }
  });

  const visibleTrails = selectedTrail ? [selectedTrail] : trails;

  return (
      <>
        {zoom < 13 ? (
            <MarkerClusterGroup
                iconCreateFunction={(cluster: { getChildCount: () => any; }) => {
                  const count = cluster.getChildCount();
                  return L.divIcon({
                    className: '',
                    html: `<div class="trail-cluster-icon">${count}</div>`,
                    iconSize: [28, 28],
                    iconAnchor: [14, 14],
                  });
                }}>
              {visibleTrails.map((trail) => {
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
              })}
            </MarkerClusterGroup>
        ) : (
            <>
              {visibleTrails.map((trail) => {
                const positions = trail.geometry.coordinates.map(
                    ([lng, lat]) => [lat, lng] as [number, number]
                );
                return (
                    <Polyline
                        key={trail._id}
                        positions={positions}
                        pathOptions={{
                          color: '#22c55e',
                          weight: hoveredTrailId === trail._id ? 6 : 3,
                          opacity: hoveredTrailId && hoveredTrailId !== trail._id ? 0.4 : 1,
                        }}
                        eventHandlers={{
                          click: () => onSelectTrail(trail),
                          mouseover: () => setHoveredTrailId(trail._id),
                          mouseout: () => setHoveredTrailId(null),
                        }}
                    />
                );
              })}
            </>
        )}
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
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${color};
    border: 2px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [8, 8],
  iconAnchor: [4, 4],
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
