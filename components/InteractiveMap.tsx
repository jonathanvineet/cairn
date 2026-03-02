"use client";

import { useEffect, useState } from "react";
import * as RL from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit2, Save, Navigation2, Loader2 } from "lucide-react";

const MapContainer = RL.MapContainer as any;
const TileLayer = RL.TileLayer as any;
const Marker = RL.Marker as any;
const Popup = RL.Popup as any;
const Polygon = RL.Polygon as any;
const useMapEvents = RL.useMapEvents as any;
const useMap = RL.useMap as any;

type LatLngTuple = [number, number];

interface Pin {
  id: string;
  position: LatLngTuple;
  label: string;
}

interface Boundary {
  id: string;
  positions: LatLngTuple[];
  color: string;
}

interface InteractiveMapProps {
  onBoundaryComplete?: (coordinates: { lat: number; lng: number }[]) => void;
  drones?: Array<{
    cairnDroneId: string;
    registrationLat: number;
    registrationLng: number;
    model: string;
    serialNumber: string;
  }>;
}

const WAYANAD_CENTER: LatLngTuple = [11.6, 76.1];

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function MapEventHandler({ 
  onMapClick, 
  mode 
}: { 
  onMapClick: (lat: number, lng: number) => void;
  mode: "pin" | "boundary" | "none";
}) {
  useMapEvents({
    click(e: L.LeafletMouseEvent) {
      if (mode === "pin" || mode === "boundary") {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// Component to recenter map when location changes
function MapRecenter({ center }: { center: LatLngTuple }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 16);
  }, [center, map]);
  return null;
}

export function InteractiveMap({ onBoundaryComplete, drones = [] }: InteractiveMapProps = {}) {
  const [isMounted, setIsMounted] = useState(false);
  const [pins, setPins] = useState<Pin[]>([]);
  const [boundaries, setBoundaries] = useState<Boundary[]>([]);
  const [mode, setMode] = useState<"pin" | "boundary" | "none">("none");
  const [boundaryPoints, setBoundaryPoints] = useState<LatLngTuple[]>([]);
  const [editingPin, setEditingPin] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [currentLocation, setCurrentLocation] = useState<LatLngTuple | null>(null);
  const [ isGettingLocation, setIsGettingLocation] = useState(false);
  const [mapCenter, setMapCenter] = useState<LatLngTuple>(WAYANAD_CENTER);

  // Ensure component only renders on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const newLocation: LatLngTuple = [lat, lng];
        setCurrentLocation(newLocation);
        setMapCenter(newLocation);
        setIsGettingLocation(false);
        
        // Optionally add a pin at current location
        const locationPin: Pin = {
          id: `current-location-${Date.now()}`,
          position: newLocation,
          label: "📍 My Location",
        };
        setPins([...pins, locationPin]);
      },
      (error) => {
        setIsGettingLocation(false);
        alert(`Error getting location: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (mode === "pin") {
      const newPin: Pin = {
        id: `pin-${Date.now()}`,
        position: [lat, lng],
        label: `Pin ${pins.length + 1}`,
      };
      setPins([...pins, newPin]);
    } else if (mode === "boundary") {
      setBoundaryPoints([...boundaryPoints, [lat, lng]]);
    }
  };

  const deletePin = (id: string) => {
    setPins(pins.filter((pin) => pin.id !== id));
  };

  const startEditPin = (pin: Pin) => {
    setEditingPin(pin.id);
    setEditLabel(pin.label);
  };

  const saveEditPin = (id: string) => {
    setPins(pins.map((pin) => 
      pin.id === id ? { ...pin, label: editLabel } : pin
    ));
    setEditingPin(null);
    setEditLabel("");
  };

  const completeBoundary = () => {
    if (boundaryPoints.length >= 3) {
      const newBoundary: Boundary = {
        id: `boundary-${Date.now()}`,
        positions: boundaryPoints,
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      };
      setBoundaries([...boundaries, newBoundary]);
      
      // Call callback with lat/lng objects
      if (onBoundaryComplete) {
        const coordinates = boundaryPoints.map(([lat, lng]) => ({ lat, lng }));
        onBoundaryComplete(coordinates);
      }
      
      setBoundaryPoints([]);
      setMode("none");
    }
  };

  const cancelBoundary = () => {
    setBoundaryPoints([]);
    setMode("none");
  };

  const deleteBoundary = (id: string) => {
    setBoundaries(boundaries.filter((b) => b.id !== id));
  };

  const convertPinsToBoundary = () => {
    if (pins.length >= 3) {
      const positions: LatLngTuple[] = pins.map((pin) => pin.position);
      const newBoundary: Boundary = {
        id: `boundary-${Date.now()}`,
        positions,
        color: "#10b981",
      };
      setBoundaries([...boundaries, newBoundary]);

      // Notify parent with lat/lng coordinates
      if (onBoundaryComplete) {
        const coordinates = positions.map(([lat, lng]) => ({ lat, lng }));
        onBoundaryComplete(coordinates);
      }

      setPins([]);
      setMode("none");
    }
  };

  // Don't render until mounted on client
  if (!isMounted) {
    return (
      <div className="relative h-full w-full flex items-center justify-center bg-forest-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-3"></div>
          <p className="text-gray-400 text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* Control Panel */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <div className="glass-strong rounded-lg border border-white/20 p-3 space-y-2">
          <h3 className="text-xs font-semibold text-green-400 uppercase tracking-wide">Tools</h3>
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className="w-full justify-start bg-blue-600/10 hover:bg-blue-600/20 border-blue-500/30"
            >
              {isGettingLocation ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Getting Location...
                </>
              ) : (
                <>
                  <Navigation2 className="h-3 w-3 mr-2" />
                  My Location
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant={mode === "pin" ? "default" : "outline"}
              onClick={() => setMode(mode === "pin" ? "none" : "pin")}
              className="w-full justify-start"
            >
              {mode === "pin" ? "✓ " : ""}Drop Pins
            </Button>
            <Button
              size="sm"
              variant={mode === "boundary" ? "default" : "outline"}
              onClick={() => setMode(mode === "boundary" ? "none" : "boundary")}
              className="w-full justify-start"
            >
              {mode === "boundary" ? "✓ " : ""}Create Boundary
            </Button>
          </div>
        </div>

        {/* Boundary Controls */}
        {mode === "boundary" && (
          <div className="glass-strong rounded-lg border border-blue-500/30 p-3 space-y-2">
            <p className="text-xs text-gray-300">
              Click map to add points ({boundaryPoints.length} added)
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={completeBoundary}
                disabled={boundaryPoints.length < 3}
                className="flex-1"
              >
                <Save className="h-3 w-3 mr-1" />
                Complete
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={cancelBoundary}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Stats and Actions */}
        <div className="glass-strong rounded-lg border border-white/20 p-3">
          <div className="text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Pins:</span>
              <Badge variant="outline" className="h-5 px-2 text-xs">{pins.length}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Boundaries:</span>
              <Badge variant="outline" className="h-5 px-2 text-xs">{boundaries.length}</Badge>
            </div>
            {pins.length >= 3 && (
              <Button
                size="sm"
                onClick={convertPinsToBoundary}
                className="w-full mt-2 bg-green-600 hover:bg-green-700 text-xs h-7"
              >
                Convert Pins to Boundary
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={mapCenter}
        zoom={13}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapRecenter center={mapCenter} />
        <MapEventHandler onMapClick={handleMapClick} mode={mode} />

        {/* Render Pins */}
        {pins.map((pin) => (
          <Marker key={pin.id} position={pin.position}>
            <Popup>
              <div className="p-2 min-w-[180px]">
                {editingPin === pin.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded"
                      autoFocus
                    />
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => saveEditPin(pin.id)}
                        className="flex-1 h-7 text-xs"
                      >
                        <Save className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingPin(null)}
                        className="h-7 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">{pin.label}</h4>
                    <p className="text-xs text-gray-600">
                      {pin.position[0].toFixed(4)}, {pin.position[1].toFixed(4)}
                    </p>
                    <div className="flex gap-1 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditPin(pin)}
                        className="flex-1 h-7 text-xs"
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deletePin(pin.id)}
                        className="h-7 px-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render Boundaries */}
        {boundaries.map((boundary) => (
          <Polygon
            key={boundary.id}
            positions={boundary.positions}
            pathOptions={{
              color: boundary.color,
              fillColor: boundary.color,
              fillOpacity: 0.2,
              weight: 3,
            }}
          >
            <Popup>
              <div className="p-2">
                <h4 className="font-semibold text-sm mb-2">Boundary</h4>
                <p className="text-xs text-gray-600 mb-2">
                  {boundary.positions.length} points
                </p>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteBoundary(boundary.id)}
                  className="w-full h-7 text-xs"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </Popup>
          </Polygon>
        ))}

        {/* Render Drones */}
        {drones.filter((drone) => 
          drone.registrationLat != null && drone.registrationLng != null
        ).map((drone) => {
          const droneIcon = L.divIcon({
            className: "custom-drone-icon",
            html: `<div style="
              width: 32px;
              height: 32px;
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              border: 2px solid #60a5fa;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
              font-size: 16px;
            ">🚁</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16],
          });

          return (
            <Marker
              key={drone.cairnDroneId}
              position={[drone.registrationLat, drone.registrationLng]}
              icon={droneIcon}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h4 className="font-semibold text-sm text-blue-600 mb-2">
                    🚁 {drone.cairnDroneId}
                  </h4>
                  <div className="space-y-1 text-xs">
                    <p><strong>Model:</strong> {drone.model}</p>
                    <p><strong>Serial:</strong> {drone.serialNumber}</p>
                    <p className="text-gray-600 mt-2">
                      <strong>Registration Location:</strong>
                    </p>
                    <p className="text-gray-500 font-mono">
                      {drone.registrationLat.toFixed(6)}, {drone.registrationLng.toFixed(6)}
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Render temporary boundary being created */}
        {boundaryPoints.length > 0 && (
          <Polygon
            positions={boundaryPoints}
            pathOptions={{
              color: "#3b82f6",
              fillColor: "#3b82f6",
              fillOpacity: 0.1,
              weight: 2,
              dashArray: "5, 5",
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
