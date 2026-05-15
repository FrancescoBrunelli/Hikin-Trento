import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';

const createIcon = (color) => L.divIcon({
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

const icons = {
  structure: createIcon('#f97316'), // orange
  poi:       createIcon('#3b82f6'), // blue
  trail:     createIcon('#22c55e'), // green
};

<Marker
  position={[46.4102, 11.3428]}
  icon={icons.structure}
  eventHandlers={{
    click: () => setSelected(structure) // sets state in parent component
  }}
/>
