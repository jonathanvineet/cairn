"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address?: string }) => void;
  initialLocation?: { lat: number; lng: number; address?: string };
  disabled?: boolean;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  type: string;
}

// Dynamic import for Leaflet map (client-side only)
const MapComponent = dynamic(
  () => import("./MapComponent").then((mod) => mod.MapComponent),
  { ssr: false, loading: () => <div style={{ width: "100%", height: "100%", background: "var(--muted)" }} /> }
);

// Search Results Component
function SearchResults({ results, onSelect, isSearching }: { results: NominatimResult[]; onSelect: (place: NominatimResult) => void; isSearching: boolean }) {
  if (!results.length && !isSearching) return null;

  return (
    <div style={{
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      background: "var(--card)",
      overflow: "hidden"
    }}>
      {isSearching && (
        <div style={{ padding: "12px 14px", fontSize: 11, color: "var(--muted-fg)", textAlign: "center", borderBottom: "1px solid var(--border)" }}>
          ⟳ SEARCHING...
        </div>
      )}
      <div style={{
        maxHeight: "140px",
        overflowY: "auto"
      }}>
        {results.map((result, idx) => (
          <div
            key={idx}
            onClick={() => onSelect(result)}
            style={{
              padding: "10px 14px",
              background: "var(--card)",
              cursor: "pointer",
              transition: "all 0.15s",
              fontSize: 11,
              borderBottom: idx < results.length - 1 ? "1px solid var(--border)" : "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--muted)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--card)";
            }}
          >
            <div style={{ fontWeight: 500, color: "var(--fg)", marginBottom: 3 }}>
              {result.type.toUpperCase()}
            </div>
            <div style={{ color: "var(--muted-fg)", fontSize: 9, lineHeight: 1.4 }}>
              {result.display_name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Location Info Component
function LocationInfo({ location }: { location: { lat: number; lng: number; address?: string } | null }) {
  if (!location) {
    return (
      <div style={{
        padding: "12px 14px",
        border: "1px dashed var(--border)",
        borderRadius: "var(--radius)",
        background: "var(--muted)",
        fontSize: 11,
        color: "var(--muted-fg)",
        textAlign: "center"
      }}>
        Select a location to continue
      </div>
    );
  }

  return (
    <div style={{
      padding: "12px 14px",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      background: "var(--muted)",
      fontSize: 11
    }}>
      <div style={{ color: "var(--muted-fg)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".05em" }}>
        <span>✓</span>
        <span>Location confirmed</span>
      </div>
      <div style={{ fontSize: 10, color: "var(--fg)", fontFamily: "monospace", letterSpacing: ".08em", marginBottom: 8, fontWeight: 500 }}>
        {location.lat.toFixed(5)}° · {location.lng.toFixed(5)}°
      </div>
      {location.address && (
        <div style={{ fontSize: 9, color: "var(--muted-fg)", lineHeight: 1.5 }}>
          {location.address}
        </div>
      )}
    </div>
  );
}

// Map Modal Component
function MapModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  initialLocation 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: (location: { lat: number; lng: number }) => void;
  initialLocation: { lat: number; lng: number } | null;
}) {
  const [tempLocation, setTempLocation] = useState<{ lat: number; lng: number } | null>(initialLocation);

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.75)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: 16
    }}>
      <div style={{
        background: "var(--bg)",
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "580px",
        height: "80vh",
        maxHeight: "650px",
        overflow: "hidden",
        boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
      }}>
        {/* Modal Header */}
        <div style={{
          padding: "14px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "var(--card)"
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg)", textTransform: "uppercase", letterSpacing: ".08em" }}>
            📍 Select Location on Map
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: 18,
              cursor: "pointer",
              color: "var(--muted-fg)",
              padding: "0 8px",
              transition: "color 0.15s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--fg)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--muted-fg)"}
          >
            ✕
          </button>
        </div>

        {/* Map Container */}
        <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
          <MapComponent 
            selectedLocation={tempLocation} 
            onLocationSelect={(lat, lng) => setTempLocation({ lat, lng })} 
          />
          {/* Center Crosshair */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            fontSize: 32,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
          }}>
            🎯
          </div>
          {/* Tip */}
          <div style={{
            position: "absolute",
            top: 14,
            left: 14,
            fontSize: 9,
            color: "#fff",
            background: "rgba(0,0,0,0.65)",
            padding: "7px 11px",
            borderRadius: "4px",
            pointerEvents: "none",
            fontWeight: 500
          }}>
            Click or drag to select
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: "14px 16px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          gap: 10,
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--card)"
        }}>
          {tempLocation && (
            <div style={{ fontSize: 9, color: "var(--muted-fg)", fontFamily: "monospace", fontWeight: 500, letterSpacing: ".05em" }}>
              {tempLocation.lat.toFixed(5)}° · {tempLocation.lng.toFixed(5)}°
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onClose}
              className="btn btn-ghost"
              style={{ fontSize: 10, padding: "8px 14px", fontWeight: 500 }}
            >
              CANCEL
            </button>
            <button
              onClick={() => {
                if (tempLocation) {
                  onConfirm(tempLocation);
                }
              }}
              className="btn btn-primary"
              disabled={!tempLocation}
              style={{ fontSize: 10, padding: "8px 14px", fontWeight: 500 }}
            >
              CONFIRM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LocationPicker({ onLocationSelect, initialLocation, disabled }: LocationPickerProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | null>(
    initialLocation || null
  );
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Search for places by name
  const searchPlaces = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`
      );
      const results = await response.json();
      setSearchResults(results as NominatimResult[]);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  // Handle place selection from search results
  const selectPlace = (place: NominatimResult) => {
    const newLocation = {
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
      address: place.display_name,
    };
    setLocation(newLocation);
    setSearchQuery("");
    setSearchResults([]);
    onLocationSelect(newLocation);
  };

  useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation);
    }
  }, [initialLocation]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLocation.lat}&lon=${newLocation.lng}`
          );
          const data = await response.json();
          const locationWithAddress = {
            ...newLocation,
            address: data.display_name,
          };
          setLocation(locationWithAddress);
          onLocationSelect(locationWithAddress);
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
          setLocation(newLocation);
          onLocationSelect(newLocation);
        }
        
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to get your location. Please check your browser permissions.");
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleMapModalConfirm = async (selectedLocation: { lat: number; lng: number }) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${selectedLocation.lat}&lon=${selectedLocation.lng}`
      );
      const data = await response.json();
      const locationWithAddress = {
        ...selectedLocation,
        address: data.display_name,
      };
      setLocation(locationWithAddress);
      onLocationSelect(locationWithAddress);
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      setLocation(selectedLocation);
      onLocationSelect(selectedLocation);
    }
    setIsMapModalOpen(false);
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 14 }}>
        {/* Search Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ fontSize: 9, color: "var(--muted-fg)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em" }}>
            🔍 Search Place
          </label>
          <input
            type="text"
            className="inp"
            placeholder="Type place name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              searchPlaces(e.target.value);
            }}
            disabled={disabled}
            style={{ width: "100%" }}
          />
        </div>

        {/* Search Results */}
        {(searchResults.length > 0 || isSearching) && (
          <SearchResults results={searchResults} onSelect={selectPlace} isSearching={isSearching} />
        )}

        {/* Action Buttons Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={() => setIsMapModalOpen(true)}
            className="btn btn-ghost"
            disabled={disabled}
            style={{ 
              width: "100%",
              fontSize: 10,
              padding: "11px 14px",
              textAlign: "center",
              border: "1px solid var(--border)",
              fontWeight: 500,
              transition: "all 0.15s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--muted)";
              e.currentTarget.style.borderColor = "var(--fg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            📍 SELECT FROM MAP
          </button>

          <button
            className="btn btn-ghost"
            onClick={getCurrentLocation}
            disabled={isGettingLocation || disabled}
            style={{ 
              width: "100%",
              fontSize: 10, 
              padding: "11px 14px",
              textAlign: "center",
              border: "1px solid var(--border)",
              fontWeight: 500,
              transition: "all 0.15s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--muted)";
              e.currentTarget.style.borderColor = "var(--fg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            {isGettingLocation ? `⟳ GETTING GPS...` : `🛰️  USE MY LOCATION`}
          </button>
        </div>

        {/* Location Info */}
        <LocationInfo location={location} />
      </div>

      {/* Map Selection Modal */}
      <MapModal 
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onConfirm={handleMapModalConfirm}
        initialLocation={location}
      />
    </>
  );
}
