import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapPin } from 'lucide-react';

// Fix for default marker icon in react-leaflet
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ position, setPosition }: { position: L.LatLng | null, setPosition: (p: L.LatLng) => void }) => {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
    locationfound(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

const LocationSelector: React.FC = () => {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  const handleSubmit = () => {
    if (position) {
      alert(`Location saved: ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`);
      setPosition(null);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-500" />
          Report Location
        </h2>
        
        <div className="h-48 lg:h-64 w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200 z-0 relative mb-4">
          <MapContainer 
            center={[0, 0]} 
            zoom={2} 
            scrollWheelZoom={false} 
            style={{ height: '100%', width: '100%', zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>
        </div>
        
        {position ? (
          <div className="flex flex-col gap-3">
            <div className="text-sm font-medium text-slate-500 bg-slate-50 p-3 rounded-xl">
              Selected: <span className="text-slate-800">{position.lat.toFixed(4)}, {position.lng.toFixed(4)}</span>
            </div>
            <button 
              onClick={handleSubmit}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Confirm Location
            </button>
          </div>
        ) : (
          <p className="text-center text-sm text-slate-500 font-medium">Tap anywhere on the map to set an incident location</p>
        )}
      </div>
    </div>
  );
};

export default LocationSelector;
