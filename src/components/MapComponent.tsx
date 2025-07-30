'use client';

import { MapContainer, TileLayer, Circle, useMap, Marker } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Minimal MapComponent for demonstration; replace with real map implementation as needed
export default function MapComponent({
  center,
  radius,
  onRadiusChange,
}: {
  center: { lat: number; lng: number } | null;
  radius: number;
  onRadiusChange: (r: number) => void;
}) {
  const pulseIcon = L.divIcon({
    className: '',
    html: `<div class="relative w-4 h-4">
      <div class="absolute w-full h-full rounded-full bg-blue-500 opacity-75 animate-ping"></div>
      <div class="absolute w-2 h-2 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-700 z-10"></div>
    </div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  function MapUpdater({ center }: { center: { lat: number; lng: number } }) {
    const map = useMap();
    useEffect(() => {
      if (!center) return;

      map.whenReady(() => {
        setTimeout(() => {
          const radiusInMeters = radius * 1609.34;
          const circle = L.circle([center.lat, center.lng], { radius: radiusInMeters });
          map.fitBounds(circle.getBounds(), { padding: [0, 0] });
        }, 0);
      });
    }, [center, map]);
    return null;
  }

  return (
    <div className="w-full h-full relative">
      <div className="absolute bottom-5 left-0 right-0 z-[500] px-2 flex gap-2 flex-wrap justify-center">
        {[5, 10, 20, 30, 50, 100, 200].map((r) => (
          <button
            key={r}
            className={`px-3 py-1 rounded-full border text-sm font-semibold ${
              radius === r ? "bg-black text-white border-black" : "bg-white text-black border-gray-400"
            }`}
            onClick={() => onRadiusChange(r)}
          >
            🧭 {r} mi
          </button>
        ))}
      </div>
      <div className="w-full h-92 overflow-hidden rounded">
        {center ? (
          <MapContainer
            center={[center.lat, center.lng]}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <MapUpdater center={center} />
            <Marker position={[center.lat, center.lng]} icon={pulseIcon} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Circle
              center={[center.lat, center.lng]}
              radius={radius * 1609.34}
              pathOptions={{ fillColor: 'blue', fillOpacity: 0.2, stroke: true, color: 'blue' }}
            />
          </MapContainer>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-600">
            Map will appear here
          </div>
        )}
      </div>
    </div>
  );
}