"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address?: string }) => void;
  initialLocation?: { lat: number; lng: number; address?: string };
  disabled?: boolean;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

export function LocationPicker({ onLocationSelect, initialLocation, disabled }: LocationPickerProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | null>(
    initialLocation || null
  );
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [address, setAddress] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [showResults, setShowResults] = useState(false);

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
        
        // Reverse geocode to get address
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
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const searchAddress = async () => {
    if (!address.trim()) {
      alert("Please enter an address");
      return;
    }

    setIsSearching(true);
    setShowResults(false);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5`,
        {
          headers: {
            'User-Agent': 'BoundaryTruth Drone Management App'
          }
        }
      );
      const data: NominatimResult[] = await response.json();
      
      if (data.length === 0) {
        alert("No results found. Please try a different address.");
      } else {
        setSearchResults(data);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      alert("Failed to search address. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (result: NominatimResult) => {
    const newLocation = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name,
    };
    setLocation(newLocation);
    onLocationSelect(newLocation);
    setShowResults(false);
    setAddress("");
    setSearchResults([]);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location Selection
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Use GPS or search for an address
            </p>
          </div>
        </div>

        {/* GPS Location Button */}
        <div className="mb-3">
          <Button
            type="button"
            onClick={getCurrentLocation}
            disabled={isGettingLocation || disabled}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            {isGettingLocation ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Getting Location...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Get My GPS Location
              </>
            )}
          </Button>
        </div>

        {/* Address Search */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchAddress()}
              placeholder="Search address (e.g., Mumbai, India)"
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              disabled={disabled}
            />
            <Button
              type="button"
              onClick={searchAddress}
              disabled={isSearching || !address.trim() || disabled}
              variant="outline"
              size="sm"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Search Results */}
          {showResults && searchResults.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-1 border border-white/10 rounded p-2 bg-[#0a1f0f]">
              {searchResults.map((result, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectSearchResult(result)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-blue-500/20 transition-colors text-xs text-gray-300"
                >
                  {result.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Location Display */}
        {location && (
          <div className="mt-3 p-3 rounded bg-green-500/10 border border-green-500/30">
            <Badge variant="outline" className="mb-2 bg-green-500/20 text-green-300 border-green-400/50">
              Location Selected
            </Badge>
            <div className="space-y-1 text-xs">
              {location.address && (
                <div className="text-gray-300 mb-2">{location.address}</div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Latitude:</span>
                <span className="font-mono text-green-400">{location.lat.toFixed(6)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Longitude:</span>
                <span className="font-mono text-green-400">{location.lng.toFixed(6)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
