'use client';
import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// fix standard leaflet icon rendering issue in next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// moved outside to prevent react re-rendering errors
function LocationClick({ setPosition }: { setPosition: (pos: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function MapComponent() {
  const [position, setPosition] = useState({ lat: 39.9526, lng: -75.1652 }); 
  const [status, setStatus] = useState('');

  // send coordinates to python backend
  const handleSpoof = async () => {
    setStatus('Spoofing...');
    try {
      await fetch('http://127.0.0.1:8002/api/update-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(position),
      });
      setStatus('Location spoofed!');
    } catch (error) {
      setStatus('Error connecting to backend.');
    }
  };

  // clear coordinates from device
  const handleReset = async () => {
    setStatus('Resetting...');
    try {
      await fetch('http://127.0.0.1:8002/api/reset-location', {
        method: 'POST',
      });
      setStatus('Location reset to normal.');
    } catch (error) {
      setStatus('Error resetting location.');
    }
  };

  return (
    <div className="flex flex-col h-screen w-full relative">
      <MapContainer center={[position.lat, position.lng]} zoom={13} className="h-full w-full z-0">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationClick setPosition={setPosition} />
        <Marker position={[position.lat, position.lng]} icon={defaultIcon} />
      </MapContainer>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] bg-white p-4 rounded-xl shadow-2xl flex flex-col items-center gap-4 border border-gray-200">
        <div className="flex gap-6 w-full justify-between items-center px-2">
          <div className="flex flex-col text-gray-700">
            <span className="text-xs uppercase font-bold text-gray-400">Target</span>
            <span className="font-mono">{position.lat.toFixed(4)}, {position.lng.toFixed(4)}</span>
          </div>
          <span className="text-sm font-medium text-blue-500">{status}</span>
        </div>
        
        <div className="flex gap-2">
          <button onClick={handleSpoof} className="bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition">
            Change Location
          </button>
          <button onClick={handleReset} className="bg-red-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-red-600 transition">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}