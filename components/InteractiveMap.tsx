"use client";

import { useEffect, useState, useRef } from "react";
import * as RL from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
  selectedZone?: {
    zoneId: string;
    coordinates: { lat: number; lng: number }[];
    assignedDrones?: string[];
  } | null;
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

// Fly map to fit a zone's boundary
function FlyToZone({ positions }: { positions: LatLngTuple[] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions.map(([lat, lng]) => L.latLng(lat, lng)));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions.map(p => p.join(",")).join("|")]);
  return null;
}

// Component to fly and display a selected saved zone
function SelectedZoneLayer({ zone }: { zone: InteractiveMapProps["selectedZone"] }) {
  if (!zone || !zone.coordinates || zone.coordinates.length === 0) return null;
  const positions: LatLngTuple[] = zone.coordinates.map(({ lat, lng }) => [lat, lng] as LatLngTuple);
  const displayName = (zone as any).zoneName || zone.zoneId;
  return (
    <>
      <FlyToZone positions={positions} />
      <Polygon
        positions={positions}
        pathOptions={{ color: "#a855f7", fillColor: "#a855f7", fillOpacity: 0.2, weight: 3 }}
      >
        <Popup>
          <div className="p-2">
            <p className="font-semibold text-purple-600">{displayName}</p>
            <p className="text-xs text-gray-500">{positions.length} boundary points</p>
          </div>
        </Popup>
      </Polygon>
      {positions.map(([lat, lng], i) => (
        <Marker
          key={`zone-pin-${i}`}
          position={[lat, lng]}
          icon={L.divIcon({
            className: "",
            html: `<div style="width:26px;height:26px;background:#a855f7;border:2px solid #f3e8ff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;color:white;font-weight:bold;box-shadow:0 2px 8px rgba(168,85,247,0.6);">${i + 1}</div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          })}
        >
          <Popup>
            <span className="text-xs">{displayName} — Point {i + 1}</span>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export function InteractiveMap({ onBoundaryComplete, drones = [], selectedZone = null }: InteractiveMapProps = {}) {
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
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Debug logging for drones
  useEffect(() => {
    console.log("🗺️ InteractiveMap received drones:", drones.length);
    const dronesWithCoords = drones.filter(d => d.registrationLat != null && d.registrationLng != null);
    console.log("📍 Drones with coordinates:", dronesWithCoords.length);
    if (dronesWithCoords.length > 0) {
      console.log("📊 Drone locations:", dronesWithCoords.map(d => ({
        name: d.cairnDroneId,
        lat: d.registrationLat,
        lng: d.registrationLng
      })));
    }
  }, [drones]);

  // Ensure component only renders on client
  useEffect(() => {
    setIsMounted(true);
    
    // Cleanup function to prevent map container reuse
    return () => {
      // Clear any orphaned Leaflet containers from failed mounts
      const containers = document.querySelectorAll(".leaflet-container");
      if (containers.length > 1) {
        // Keep only the first valid one, remove duplicates
        Array.from(containers).slice(1).forEach(container => {
          try {
            if ((container as any)._leaflet_map) {
              (container as any)._leaflet_map.remove();
            }
            container.remove();
          } catch (e) {
            // Silently ignore removal errors
          }
        });
      }
    };
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
      <div style={{ position: "relative", height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--muted)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ animation: "spin 2s linear infinite", borderRadius: "50%", height: 48, width: 48, borderBottom: "2px solid var(--fg)", margin: "0 auto 12px" }} />
          <p style={{ color: "var(--muted-fg)", fontSize: 13 }}>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", height: "100%", width: "100%", overflow: "hidden" }} ref={mapContainerRef}>
      {/* Control Panel */}
      <div style={{ position: "absolute", top: 16, left: 16, zIndex: 1000, display: "flex", flexDirection: "column", gap: 12 }}>
        
        {/* Tools Section */}
        <div style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "14px 16px",
          minWidth: "200px"
        }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: "var(--muted-fg)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>
            🛠 Tools
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              style={{
                padding: "10px 12px",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                background: "var(--bg)",
                color: "var(--fg)",
                fontSize: 10,
                fontWeight: 500,
                cursor: isGettingLocation ? "not-allowed" : "pointer",
                transition: "all 0.15s",
                opacity: isGettingLocation ? 0.6 : 1,
                textAlign: "center"
              }}
              onMouseEnter={(e) => {
                if (!isGettingLocation) {
                  e.currentTarget.style.background = "var(--muted)";
                  e.currentTarget.style.borderColor = "var(--fg)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--bg)";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              {isGettingLocation ? "⟳ GETTING LOCATION..." : "📍 MY LOCATION"}
            </button>
            
            <button
              onClick={() => setMode(mode === "pin" ? "none" : "pin")}
              style={{
                padding: "10px 12px",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                background: mode === "pin" ? "var(--fg)" : "var(--bg)",
                color: mode === "pin" ? "var(--bg)" : "var(--fg)",
                fontSize: 10,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s",
                textAlign: "center"
              }}
              onMouseEnter={(e) => {
                if (mode !== "pin") {
                  e.currentTarget.style.background = "var(--muted)";
                  e.currentTarget.style.borderColor = "var(--fg)";
                }
              }}
              onMouseLeave={(e) => {
                if (mode !== "pin") {
                  e.currentTarget.style.background = "var(--bg)";
                  e.currentTarget.style.borderColor = "var(--border)";
                }
              }}
            >
              {mode === "pin" ? "✓ DROP PINS" : "📌 DROP PINS"}
            </button>
            
            <button
              onClick={() => setMode(mode === "boundary" ? "none" : "boundary")}
              style={{
                padding: "10px 12px",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                background: mode === "boundary" ? "var(--fg)" : "var(--bg)",
                color: mode === "boundary" ? "var(--bg)" : "var(--fg)",
                fontSize: 10,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s",
                textAlign: "center"
              }}
              onMouseEnter={(e) => {
                if (mode !== "boundary") {
                  e.currentTarget.style.background = "var(--muted)";
                  e.currentTarget.style.borderColor = "var(--fg)";
                }
              }}
              onMouseLeave={(e) => {
                if (mode !== "boundary") {
                  e.currentTarget.style.background = "var(--bg)";
                  e.currentTarget.style.borderColor = "var(--border)";
                }
              }}
            >
              {mode === "boundary" ? "✓ CREATE BOUNDARY" : "🔲 CREATE BOUNDARY"}
            </button>
          </div>
        </div>

        {/* Boundary Mode Controls */}
        {mode === "boundary" && (
          <div style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "12px 14px",
            minWidth: "200px"
          }}>
            <div style={{ fontSize: 9, color: "var(--muted-fg)", marginBottom: 10 }}>
              Click map to add points ({boundaryPoints.length} added)
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={completeBoundary}
                disabled={boundaryPoints.length < 3}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  background: boundaryPoints.length < 3 ? "var(--muted)" : "var(--fg)",
                  color: boundaryPoints.length < 3 ? "var(--muted-fg)" : "var(--bg)",
                  fontSize: 9,
                  fontWeight: 600,
                  cursor: boundaryPoints.length < 3 ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                  opacity: boundaryPoints.length < 3 ? 0.6 : 1,
                  textTransform: "uppercase",
                  letterSpacing: ".05em"
                }}
              >
                COMPLETE
              </button>
              <button
                onClick={cancelBoundary}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  background: "var(--bg)",
                  color: "var(--fg)",
                  fontSize: 9,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  textTransform: "uppercase",
                  letterSpacing: ".05em"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--muted)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--bg)";
                }}
              >
                CANCEL
              </button>
            </div>
          </div>
        )}

        {/* Stats Panel */}
        <div style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "14px 16px",
          minWidth: "200px"
        }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: "var(--muted-fg)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>
            📊 Stats
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 9, color: "var(--muted-fg)", fontWeight: 500 }}>PINS</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--fg)", background: "var(--muted)", padding: "4px 10px", borderRadius: "4px" }}>
                {pins.length}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 9, color: "var(--muted-fg)", fontWeight: 500 }}>BOUNDARIES</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--fg)", background: "var(--muted)", padding: "4px 10px", borderRadius: "4px" }}>
                {boundaries.length}
              </span>
            </div>
            {pins.length >= 3 && (
              <button
                onClick={convertPinsToBoundary}
                style={{
                  marginTop: 8,
                  padding: "10px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  background: "var(--fg)",
                  color: "var(--bg)",
                  fontSize: 9,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  textTransform: "uppercase",
                  letterSpacing: ".05em"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                CONVERT TO BOUNDARY
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={{ position: "relative", height: "100%", width: "100%" }}>
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
          key="interactive-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        
        <MapRecenter center={mapCenter} />
        <MapEventHandler onMapClick={handleMapClick} mode={mode} />

        {/* Render Pins - hide when viewing a saved chain zone */}
        {!selectedZone && pins.map((pin) => (
          <Marker key={pin.id} position={pin.position}>
            <Popup>
              <div style={{ minWidth: 180, padding: 8 }}>
                {editingPin === pin.id ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      style={{
                        padding: "6px 8px",
                        fontSize: 11,
                        border: "1px solid var(--border)",
                        borderRadius: "4px",
                        background: "var(--bg)",
                        color: "var(--fg)"
                      }}
                      autoFocus
                    />
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => saveEditPin(pin.id)}
                        style={{
                          flex: 1,
                          padding: "6px 10px",
                          fontSize: 9,
                          fontWeight: 600,
                          border: "1px solid var(--border)",
                          borderRadius: "4px",
                          background: "var(--fg)",
                          color: "var(--bg)",
                          cursor: "pointer"
                        }}
                      >
                        SAVE
                      </button>
                      <button
                        onClick={() => setEditingPin(null)}
                        style={{
                          flex: 1,
                          padding: "6px 10px",
                          fontSize: 9,
                          fontWeight: 600,
                          border: "1px solid var(--border)",
                          borderRadius: "4px",
                          background: "var(--bg)",
                          color: "var(--fg)",
                          cursor: "pointer"
                        }}
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg)" }}>{pin.label}</div>
                    <div style={{ fontSize: 9, color: "var(--muted-fg)", fontFamily: "monospace" }}>
                      {pin.position[0].toFixed(4)}° · {pin.position[1].toFixed(4)}°
                    </div>
                    <div style={{ display: "flex", gap: 6, paddingTop: 4 }}>
                      <button
                        onClick={() => startEditPin(pin)}
                        style={{
                          flex: 1,
                          padding: "6px 10px",
                          fontSize: 9,
                          fontWeight: 600,
                          border: "1px solid var(--border)",
                          borderRadius: "4px",
                          background: "var(--bg)",
                          color: "var(--fg)",
                          cursor: "pointer"
                        }}
                      >
                        EDIT
                      </button>
                      <button
                        onClick={() => deletePin(pin.id)}
                        style={{
                          padding: "6px 10px",
                          fontSize: 9,
                          fontWeight: 600,
                          border: "1px solid var(--border)",
                          borderRadius: "4px",
                          background: "var(--bg)",
                          color: "var(--fg)",
                          cursor: "pointer"
                        }}
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render Boundaries - hide when viewing a saved chain zone */}
        {!selectedZone && boundaries.map((boundary) => (
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
              <div style={{ padding: 8, minWidth: 200 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg)", marginBottom: 6 }}>Boundary</div>
                <div style={{ fontSize: 9, color: "var(--muted-fg)", marginBottom: 10 }}>
                  {boundary.positions.length} points
                </div>
                <button
                  onClick={() => deleteBoundary(boundary.id)}
                  style={{
                    width: "100%",
                    padding: "6px 10px",
                    fontSize: 9,
                    fontWeight: 600,
                    border: "1px solid var(--border)",
                    borderRadius: "4px",
                    background: "var(--fg)",
                    color: "var(--bg)",
                    cursor: "pointer"
                  }}
                >
                  DELETE
                </button>
              </div>
            </Popup>
          </Polygon>
        ))}

        {/* Selected Saved Zone */}
        <SelectedZoneLayer zone={selectedZone} />

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
                <div style={{ padding: 8, minWidth: 200 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg)", marginBottom: 8 }}>
                    🚁 {drone.cairnDroneId}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 9 }}>
                    <div><strong style={{ color: "var(--fg)" }}>Model:</strong> <span style={{ color: "var(--muted-fg)" }}>{drone.model}</span></div>
                    <div><strong style={{ color: "var(--fg)" }}>Serial:</strong> <span style={{ color: "var(--muted-fg)" }}>{drone.serialNumber}</span></div>
                    <div style={{ color: "var(--muted-fg)", marginTop: 6 }}>
                      <strong>Registration Location:</strong>
                    </div>
                    <div style={{ color: "var(--muted-fg)", fontFamily: "monospace", fontSize: 8 }}>
                      {drone.registrationLat.toFixed(6)}° · {drone.registrationLng.toFixed(6)}°
                    </div>
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
    </div>
  );
}
