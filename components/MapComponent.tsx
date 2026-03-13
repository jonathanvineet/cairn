"use client";

import { useEffect } from "react";
import * as RL from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MapContainer = RL.MapContainer as any;
const TileLayer = RL.TileLayer as any;
const Marker = RL.Marker as any;
const useMapEvents = RL.useMapEvents as any;

interface MapComponentProps {
  selectedLocation: { lat: number; lng: number } | null;
  onLocationSelect: (lat: number, lng: number) => void;
}

const MapClickHandler = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e: L.LeafletMouseEvent) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export function MapComponent({ selectedLocation, onLocationSelect }: MapComponentProps) {
  const defaultLocation: [number, number] = [11.6, 76.1]; // Wayanad, India
  const userLocation: [number, number] = selectedLocation
    ? [selectedLocation.lat, selectedLocation.lng]
    : defaultLocation;

  return (
    <MapContainer
      center={userLocation}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {selectedLocation && (
        <Marker
          position={[selectedLocation.lat, selectedLocation.lng]}
          icon={L.icon({
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          })}
        />
      )}
      <MapClickHandler onLocationSelect={onLocationSelect} />
    </MapContainer>
  );
}
