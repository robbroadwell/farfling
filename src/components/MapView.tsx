

"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

type Adventure = {
  id: string;
  title: string;
  location: string;
};

export default function MapView({ adventures }: { adventures: Adventure[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    const map = L.map(mapRef.current).setView([20, 0], 2);
    leafletMapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    adventures.forEach((adventure) => {
      // Mock lat/lng for now
      const lat = Math.random() * 140 - 70;
      const lng = Math.random() * 360 - 180;

      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`<strong>${adventure.title}</strong><br>${adventure.location}`);
    });
  }, [adventures]);

  return (
    <div className="fixed inset-0 z-40">
      <div ref={mapRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 z-50 bg-white shadow-lg p-4 rounded-md max-w-sm">
        <input
          type="text"
          placeholder="Search adventures..."
          className="w-full mb-2 p-2 border rounded"
        />
        <div className="flex gap-2 flex-wrap">
          {["Hiking", "Cycling", "Skiing", "Kayaking", "Climbing"].map((type) => (
            <button
              key={type}
              className="px-3 py-1 bg-blue-100 rounded-full text-sm text-blue-800"
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}